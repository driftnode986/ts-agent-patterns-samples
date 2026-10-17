import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrokenCircuitError, CircuitState } from 'cockatiel';
import { breaker, callLLMWithRetry } from '../src/lib/resilience';

const httpError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { status });

describe('callLLMWithRetry', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('429 はリトライし、3 回目で成功すれば結果を返す', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(httpError(429))
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValue('ok');
    const promise = callLLMWithRetry(fn);
    await vi.advanceTimersByTimeAsync(120_000);
    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('maxAttempts: 3 は「リトライ 3 回」なので、最初の 1 回と合わせて 4 回呼ぶ', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(500));
    const promise = callLLMWithRetry(fn);
    const assertion = expect(promise).rejects.toThrow('HTTP 500');
    await vi.advanceTimersByTimeAsync(300_000);
    await assertion;
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('400 はリトライしない', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(400));
    await expect(callLLMWithRetry(fn)).rejects.toThrow('HTTP 400');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('breaker', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('Closed → Open → HalfOpen → Closed と状態が変わる', async () => {
    const states: CircuitState[] = [];
    const sub = breaker.onStateChange((s) => states.push(s));
    const failing = () => Promise.reject(httpError(503));

    expect(breaker.state).toBe(CircuitState.Closed);
    for (let i = 0; i < 4; i++) {
      await expect(breaker.execute(failing)).rejects.toThrow('HTTP 503');
    }
    expect(breaker.state).toBe(CircuitState.Closed);

    // 5 回連続で失敗すると Open になる
    await expect(breaker.execute(failing)).rejects.toThrow('HTTP 503');
    expect(breaker.state).toBe(CircuitState.Open);

    // Open の間は関数を呼ばずに即座に拒否する
    const fn = vi.fn().mockResolvedValue('ok');
    await expect(breaker.execute(fn)).rejects.toBeInstanceOf(
      BrokenCircuitError
    );
    expect(fn).not.toHaveBeenCalled();

    // 30 秒後の 1 回が成功すると Closed に戻る
    vi.advanceTimersByTime(30_000);
    await expect(breaker.execute(fn)).resolves.toBe('ok');
    expect(breaker.state).toBe(CircuitState.Closed);
    expect(states).toEqual([
      CircuitState.Open,
      CircuitState.HalfOpen,
      CircuitState.Closed,
    ]);
    sub.dispose();
  });

  it('対象外のエラー（400）は失敗に数えない', async () => {
    for (let i = 0; i < 6; i++) {
      await expect(
        breaker.execute(() => Promise.reject(httpError(400)))
      ).rejects.toThrow('HTTP 400');
    }
    expect(breaker.state).toBe(CircuitState.Closed);
  });
});

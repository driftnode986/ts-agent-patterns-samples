import { describe, it, expect, vi } from 'vitest';
import { fakeAnthropicFetch } from './fake-anthropic';
import { mockModel } from './mock-model';

// Agent の anthropic() は偽物のモデルに差し替える
vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: () => mockModel('型推論は初期値から型を決める仕組みです。'),
}));

// 審査役 (judge) の 'anthropic/claude-sonnet-4-6' は fetch を偽物にする
const judge = fakeAnthropicFetch((body) =>
  body.output_config
    ? JSON.stringify({ isAccurate: true, coverage: 0.8, issues: [] })
    : '正確だが具体例が不足しているため 0.8 です。'
);
vi.stubGlobal('fetch', judge.fetch);

describe('qualityScorer', () => {
  it('正確なら coverage がスコアになり、理由も返す', async () => {
    const { qualityScorer } = await import('../src/evals/quality-scorer');
    const result = await qualityScorer.run({
      input: [{ role: 'user', content: '型推論とは' }],
      output: { text: '初期値から型を決めます' },
    });
    expect(result.score).toBe(0.8);
    expect(result.reason).toBe('正確だが具体例が不足しているため 0.8 です。');
    // analyze と generateReason で 2 回 judge を呼ぶ
    expect(judge.calls).toHaveLength(2);
    expect(JSON.stringify(judge.calls[0])).toContain('初期値から型を決めます');
  });

  it('不正確なら 0 点になる', async () => {
    const { qualityScorer } = await import('../src/evals/quality-scorer');
    const wrong = fakeAnthropicFetch((body) =>
      body.output_config
        ? JSON.stringify({ isAccurate: false, coverage: 0.9, issues: ['誤り'] })
        : '事実誤りがあるため 0 点です。'
    );
    vi.stubGlobal('fetch', wrong.fetch);
    const result = await qualityScorer.run({
      output: { text: 'TypeScript に型推論はありません' },
    });
    expect(result.score).toBe(0);
    vi.stubGlobal('fetch', judge.fetch);
  });

  it('Agent の応答を採点する (run-quality-scorer.ts)', async () => {
    const { evalResult } = await import('../src/evals/run-quality-scorer');
    expect(evalResult.score).toBe(0.8);
    expect(JSON.stringify(judge.calls.at(-2)))
      .toContain('型推論は初期値から型を決める仕組みです。');
  });
});

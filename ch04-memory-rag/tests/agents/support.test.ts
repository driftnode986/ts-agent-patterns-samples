import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setTurns, calls, promptText } from '../helpers/mock-llm';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('supportAgent の Message History', () => {
  it('同じ thread の 2 回目の呼び出しに 1 回目の会話が渡る (4.2)', async () => {
    setTurns([{ text: 'こんにちは、田中さん。' }, { text: '続きをどうぞ。' }]);
    await import('../../src/steps/chat.step1');

    expect(calls).toHaveLength(2);
    expect(promptText(1)).toContain('こんにちは、田中です');
    expect(promptText(1)).toContain('こんにちは、田中さん。');
  });

  it('同じ resource でも別の thread の会話は渡らない (4.5)', async () => {
    setTurns([{ text: '何でしょう。' }, { text: '順調です。' }]);
    await import('../../src/scripts/chat');

    expect(calls).toHaveLength(2);
    expect(promptText(1)).toContain('進捗を教えてください');
    expect(promptText(1)).not.toContain('質問があります');
  });
});

describe('supportAgent の messageHistory', () => {
  it('履歴が maxTokens を超えると、古いメッセージから渡さなくなる (4.2)', async () => {
    setTurns([{ text: '受け取りました。' }, { text: '続きをどうぞ。' }]);
    const { supportAgent } = await import('../../src/mastra/agents/support');
    const memory = { resource: 'user-budget', thread: 'thread-budget' };
    // 8,000 トークンを確実に超える長い 1 通目
    const long = `長文の目印 ${'data '.repeat(20_000)}`;

    await supportAgent.generate(long, { memory });
    await supportAgent.generate('短い 2 通目です', { memory });

    expect(calls).toHaveLength(2);
    expect(promptText(0)).toContain('長文の目印');
    expect(promptText(1)).toContain('短い 2 通目です');
    expect(promptText(1)).not.toContain('長文の目印');
  });

  it('予算に収まる履歴は、2 回目の呼び出しにも渡る (4.2)', async () => {
    setTurns([{ text: '受け取りました。' }, { text: '続きをどうぞ。' }]);
    const { supportAgent } = await import('../../src/mastra/agents/support');
    const memory = { resource: 'user-budget', thread: 'thread-short' };

    await supportAgent.generate('短い目印の 1 通目', { memory });
    await supportAgent.generate('短い 2 通目です', { memory });

    expect(promptText(1)).toContain('短い目印の 1 通目');
  });
});

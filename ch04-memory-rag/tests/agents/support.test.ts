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

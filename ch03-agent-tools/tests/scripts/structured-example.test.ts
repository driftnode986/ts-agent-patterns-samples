import { describe, expect, it, vi } from 'vitest';
import { claude } from '../helpers/models';

vi.mock('@ai-sdk/anthropic', async () => {
  const { anthropicMock } = await import('../helpers/models');
  return { anthropic: anthropicMock };
});

const task = {
  title: 'Next.js ログイン画面の実装',
  priority: 'high',
  estimatedHours: 8,
  tags: ['frontend', 'auth'],
};

describe('structured-example (3.11)', () => {
  it('generate と stream の構造化出力をスキーマの型で受け取る', async () => {
    claude.enqueue(
      { text: JSON.stringify(task) },
      // 配列のスキーマは { elements: [...] } で包んだ JSON としてモデルに求められる
      { text: JSON.stringify({ elements: [task, task, task] }) },
    );
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../../src/scripts/structured-example');
    expect(log.mock.calls.map(([v]) => v)).toEqual([
      'Next.js ログイン画面の実装',
      'high',
      8,
      3,
    ]);
  });
});

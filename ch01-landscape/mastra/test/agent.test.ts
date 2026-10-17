import { describe, expect, it, vi } from 'vitest';
import type { Reply } from '../../testing/mock-model';

const replies = vi.hoisted(() => [] as Reply[]);
vi.mock('@ai-sdk/anthropic', async () => {
  const { scriptedModel } = await import('../../testing/mock-model');
  return { anthropic: (id: string) => scriptedModel(replies, id) };
});

describe('supportAgent', () => {
  it('answers with the model text', async () => {
    const { supportAgent } = await import('../src/mastra/agents');
    replies.push({ text: 'お問い合わせありがとうございます。' });
    const res = await supportAgent.generate('返品したい');
    expect(supportAgent.id).toBe('customer-support');
    expect(res.text).toBe('お問い合わせありがとうございます。');
  });
});

import { describe, expect, it } from 'vitest';
import { RealtimeAgent } from '@openai/agents/realtime';

describe('RealtimeAgent', () => {
  it('defines a voice agent with name and instructions', async () => {
    const { agent } = await import('../src/index');
    expect(agent).toBeInstanceOf(RealtimeAgent);
    expect(agent.name).toBe('VoiceAssistant');
    expect(agent.instructions).toBe('音声で応答するアシスタントです。');
  });
});

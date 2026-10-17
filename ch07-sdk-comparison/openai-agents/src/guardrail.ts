// src/guardrail.ts
import { Agent } from '@openai/agents';

export const guardrailedAgent = new Agent({
  name: 'SafeAssistant',
  instructions: '安全な回答のみ提供してください。',
  model: 'gpt-4o',
  inputGuardrails: [
    {
      name: 'ContentFilter',
      execute: async ({ input }) => {
        // input は文字列か、会話の履歴（メッセージの配列）
        if (JSON.stringify(input).includes('危険')) {
          return { tripwireTriggered: true, outputInfo: '危険な語を含む' };
        }
        return { tripwireTriggered: false, outputInfo: null };
      },
    },
  ],
});

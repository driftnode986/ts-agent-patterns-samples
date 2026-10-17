import {
  RealtimeAgent,
  RealtimeSession,
} from '@openai/agents/realtime';

export const agent = new RealtimeAgent({
  name: 'VoiceAssistant',
  instructions: '音声で応答するアシスタントです。',
});

// #region weather-tool
// src/app/api/chat/route.ts
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  tool,
  type UIMessage,
} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const weatherTool = tool({
  description: '指定した都市の天気を取得します',
  inputSchema: z.object({
    city: z.string().describe('都市名'),
  }),
  execute: async ({ city }) => {
    return { city, temperature: 22, condition: 'sunny' };
  },
});
// #endregion

// #region post
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    messages: await convertToModelMessages(messages),
    tools: { weather: weatherTool },
    stopWhen: isStepCount(5),
  });

  return result.toUIMessageStreamResponse();
}
// #endregion

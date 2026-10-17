// src/app/api/chat/route.ts
import { streamText, tool, isStepCount } from 'ai';
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

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    messages,
    tools: { weather: weatherTool },
    stopWhen: isStepCount(5),
  });

  return result.toUIMessageStreamResponse();
}

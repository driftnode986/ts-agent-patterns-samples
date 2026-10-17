import { createUIMessageStreamResponse } from 'ai';
import { toAISdkStream } from '@mastra/ai-sdk';
import { mastra } from '@/mastra';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const agent = mastra.getAgent('customerSupport');

  const result = await agent.stream(messages);
  return createUIMessageStreamResponse({
    stream: toAISdkStream(result, { from: 'agent', version: 'v7' }),
  });
}

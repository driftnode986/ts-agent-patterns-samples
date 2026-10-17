// src/app/api/chat/route.ts
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

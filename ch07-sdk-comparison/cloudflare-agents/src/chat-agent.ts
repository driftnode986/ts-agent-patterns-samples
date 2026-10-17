// src/chat-agent.ts
import { AIChatAgent } from '@cloudflare/ai-chat';
import { anthropic } from '@ai-sdk/anthropic';
import { convertToModelMessages, streamText } from 'ai';

export class ChatAgent extends AIChatAgent<Env> {
  async onChatMessage() {
    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      messages: await convertToModelMessages(this.messages),
    });

    return result.toUIMessageStreamResponse();
  }
}

import { anthropic } from '@ai-sdk/anthropic';

export function selectModel(inputTokens: number) {
  if (inputTokens < 1000) {
    return anthropic('claude-haiku-4-5');
  }
  if (inputTokens < 10000) {
    return anthropic('claude-sonnet-4-6');
  }
  return anthropic('claude-opus-4-7');
}

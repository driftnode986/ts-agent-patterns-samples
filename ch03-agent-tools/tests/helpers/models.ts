// vi.mock で @ai-sdk/anthropic などの代わりに渡す、共有のテスト用モデル
import { vi } from 'vitest';
import { createScriptedModel } from './scripted-model';

export const claude = createScriptedModel('mock-claude');
export const gpt = createScriptedModel('mock-gpt');

export const anthropicMock = vi.fn((_modelId: string) => claude.model);
export const openaiMock = vi.fn((_modelId: string) => gpt.model);

export function resetModels() {
  claude.reset();
  gpt.reset();
  anthropicMock.mockClear();
  openaiMock.mockClear();
}

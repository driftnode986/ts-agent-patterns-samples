// src/lib/pii-filter.ts
// #region imports
import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import type { MastraModelConfig } from '@mastra/core/llm';
import { RegexFilterProcessor } from '@mastra/core/processors';
// #endregion

// #region mask
const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /0\d{1,4}-?\d{1,4}-?\d{4}/g,
  creditCard: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/g,
  myNumber: /\d{4}\s?\d{4}\s?\d{4}/g,
};

// 監査ログなど、文字列をそのまま伏せたい場面で使う
export function maskPII(text: string): string {
  let masked = text;
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    masked = masked.replace(pattern, `[${type.toUpperCase()}_MASKED]`);
  }
  return masked;
}
// #endregion

// #region processor
// LLM に送る前のメッセージを伏せる入力プロセッサ（LLM は呼ばない）
export function createPIIMaskProcessor() {
  return new RegexFilterProcessor({
    rules: Object.entries(PII_PATTERNS).map(([type, pattern]) => ({
      name: type,
      pattern,
      replacement: `[${type.toUpperCase()}_MASKED]`,
    })),
    strategy: 'redact', // 一致した部分を置き換える（既定の block は中断）
    phase: 'input', // 入力だけを対象にする（既定の all は出力も対象）
  });
}
// #endregion

// #region agent
export function createPIIFilteredAgent(
  model: MastraModelConfig = anthropic('claude-sonnet-4-6'),
) {
  return new Agent({
    id: 'pii-filtered-support',
    name: 'PIIFilteredSupport',
    instructions: '丁寧な顧客サポートを行います。',
    model,
    // generate() と stream() のどちらでも、モデルに渡る前に通る
    inputProcessors: [createPIIMaskProcessor()],
  });
}
// #endregion

// src/agent.ts
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = await query({
  prompt: 'src/ ディレクトリの TypeScript ファイルを分析してください',
  options: {
    model: 'claude-sonnet-4-6',
    maxTurns: 10,
    systemPrompt: 'あなたはコードレビュー担当者です。',
  },
});

console.log(result.result);

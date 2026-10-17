import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: 'src/ ディレクトリの TypeScript ファイルを分析してください',
  options: {
    model: 'claude-sonnet-4-6',
    maxTurns: 10,
    systemPrompt: 'あなたはコードレビュー担当者です。',
  },
})) {
  // 最後に届く result メッセージに最終的な回答が入る
  if (message.type === 'result' && message.subtype === 'success') {
    console.log(message.result);
  }
}

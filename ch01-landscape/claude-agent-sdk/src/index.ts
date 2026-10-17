import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: 'TypeScript プロジェクトのバグを見つけて修正してください',
  options: { allowedTools: ['Read', 'Edit', 'Bash'] },
})) {
  console.log(message);
}

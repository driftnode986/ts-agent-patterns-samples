import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { searchDocsTool } from '../tools/search-docs';

export const docsAgent = new Agent({
  id: 'docs-agent',
  name: 'ドキュメント検索エージェント',
  instructions: `社内ドキュメントに基づいてユーザーの質問に回答する
アシスタントです。

回答する前に、必ず searchDocsTool で関連ドキュメントを検索してください。
検索結果に基づいて回答し、出典を明記してください。
検索結果に該当情報がない場合は
「ドキュメントに該当情報が見つかりませんでした」と回答してください。`,
  model: anthropic('claude-sonnet-4-6'),
  tools: { searchDocsTool },
});

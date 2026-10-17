export function buildInstructions(config: {
  companyName: string;
  supportTier: 'basic' | 'premium';
  knowledgeBase: string[];
}) {
  const tierInstructions = config.supportTier === 'premium'
    ? '技術的に深い質問にも対応してください。' +
      'コード例を積極的に示してください。'
    : '基本的な使い方を案内してください。' +
      '技術的な詳細は開発チームにエスカレーションしてください。';

  return `あなたは ${config.companyName} の` +
    `カスタマーサポートエージェントです。

${tierInstructions}

以下のナレッジベースの情報を参照して回答してください:
${config.knowledgeBase.map(kb => `- ${kb}`).join('\n')}

回答できない質問には「担当者に確認します」と答えてください。`;
}

// src/scripts/eval-rag.ts
import { searchKnowledgeBase } from '../lib/search';

const testCases = [
  {
    query: 'Mastra の Agent はどうやって定義しますか',
    expectedKeywords: ['Agent', 'instructions', 'model', 'tools'],
    expectedSource: 'user-guide.md',
  },
  {
    query: 'Tool のエラーハンドリングの方法は',
    expectedKeywords: ['execute', 'throw', 'Error'],
    expectedSource: 'api-reference.md',
  },
];

for (const testCase of testCases) {
  const results = await searchKnowledgeBase(testCase.query);

  // Context Precision: 関連キーワードの含有率
  const keywordHits = testCase.expectedKeywords.filter(kw =>
    results.some(r => r.includes(kw))
  );
  const precision = keywordHits.length / testCase.expectedKeywords.length;

  console.log(`Query: ${testCase.query}`);
  console.log(`  Precision: ${(precision * 100).toFixed(0)}%`);
  console.log(`  Retrieved: ${results.length} chunks`);
}

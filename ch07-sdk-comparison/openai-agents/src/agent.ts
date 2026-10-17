// src/agent.ts
import { Agent, run } from '@openai/agents';

const triageAgent = new Agent({
  name: 'Triage',
  instructions: 'ユーザーの問い合わせを分類し、適切な担当に振り分けてください。',
  model: 'gpt-4o',
});

const technicalAgent = new Agent({
  name: 'TechnicalSupport',
  instructions: '技術的な問題を解決してください。',
  model: 'gpt-4o',
});

triageAgent.handoffs = [technicalAgent];

const result = await run(triageAgent, '画面が真っ白になりました');
console.log(result.finalOutput);

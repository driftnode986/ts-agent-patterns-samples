// src/scripts/chat.ts
import { supportAgent } from '../mastra/agents/support';

const response = await supportAgent.generate('こんにちは、田中です', {
  memory: {
    resource: 'user-tanaka',
    thread: 'thread-001',
  },
});
console.log(response.text);
// "こんにちは、田中さん。何かお手伝いできることはありますか？"

// 2 回目の呼び出し。前回のメッセージを覚えている
const response2 = await supportAgent.generate('前回相談した件の続きです', {
  memory: {
    resource: 'user-tanaka',
    thread: 'thread-001',
  },
});
console.log(response2.text);

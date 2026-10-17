import { supportAgent } from '../mastra/agents/support';

// ユーザー「田中」の「サポート」スレッドに紐づく
const response = await supportAgent.generate('質問があります', {
  memory: {
    resource: 'user-tanaka',
    thread: 'support-thread-001',
  },
});

// 同じユーザーの「プロジェクト」スレッド (別の文脈)
const response2 = await supportAgent.generate('進捗を教えてください', {
  memory: {
    resource: 'user-tanaka',
    thread: 'project-thread-001',
  },
});
console.log(response.text, response2.text);

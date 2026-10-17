// src/scripts/chat.ts
// ユーザー「田中」の「サポート」スレッドに紐づく
const response = await agent.generate('質問があります', {
  memory: {
    resource: 'user-tanaka',
    thread: 'support-thread-001',
  },
});

// 同じユーザーの「プロジェクト」スレッド (別の文脈)
const response2 = await agent.generate('進捗を教えてください', {
  memory: {
    resource: 'user-tanaka',
    thread: 'project-thread-001',
  },
});

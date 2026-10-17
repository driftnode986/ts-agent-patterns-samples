// src/scripts/gdpr-delete.ts
import { memory } from '../mastra';

async function deleteUserData(userId: string) {
  // 1. ユーザーの全スレッドを取得
  const threads = await memory.getThreadsByResourceId(userId);

  // 2. 各スレッドのメッセージと Working Memory を削除
  for (const thread of threads) {
    await memory.deleteThread(thread.id);
  }

  // 3. ベクトル DB のエントリを削除 (resourceId でフィルタ)
  await memory.deleteVectorsByResourceId(userId);

  console.log(`ユーザー ${userId} のデータを完全に削除しました`);
}

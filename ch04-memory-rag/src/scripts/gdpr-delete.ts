import { memory } from '../mastra';

export async function deleteUserData(userId: string) {
  // 1. ユーザーの全スレッドを取得
  const { threads } = await memory.listThreads({
    filter: { resourceId: userId },
    perPage: false,
  });

  // 2. 各スレッドを削除 (メッセージとベクトルも一緒に消える)
  for (const thread of threads) {
    await memory.deleteThread(thread.id);
  }

  // 3. resource 単位の Working Memory を空にする
  const store = await memory.storage.getStore('memory');
  if (await store?.getResourceById({ resourceId: userId })) {
    await store?.updateResource({ resourceId: userId, workingMemory: '' });
  }

  // 4. 裏で進むベクトル削除の完了を待つ
  await memory.settled();

  console.log(`ユーザー ${userId} のデータを完全に削除しました`);
}

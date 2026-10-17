import { describe, it, expect, vi } from 'vitest';
import { memory } from '../../src/mastra';
import { deleteUserData } from '../../src/scripts/gdpr-delete';

async function seed(resourceId: string, threadId: string) {
  const now = new Date();
  await memory.saveThread({
    thread: { id: threadId, resourceId, title: threadId, createdAt: now, updatedAt: now },
  });
}

describe('deleteUserData', () => {
  it('指定ユーザーのスレッドと Working Memory だけを消す', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await seed('user-tanaka', 't-1');
    await seed('user-tanaka', 't-2');
    await seed('user-suzuki', 't-3');
    await memory.updateWorkingMemory({
      threadId: 't-1', resourceId: 'user-tanaka', workingMemory: '- 名前: 田中太郎',
    });

    await deleteUserData('user-tanaka');

    const tanaka = await memory.listThreads({ filter: { resourceId: 'user-tanaka' } });
    const suzuki = await memory.listThreads({ filter: { resourceId: 'user-suzuki' } });
    expect(tanaka.threads).toHaveLength(0);
    expect(suzuki.threads.map((t) => t.id)).toEqual(['t-3']);

    const store = await memory.storage.getStore('memory');
    const resource = await store?.getResourceById({ resourceId: 'user-tanaka' });
    expect(resource?.workingMemory ?? '').toBe('');
  });
});

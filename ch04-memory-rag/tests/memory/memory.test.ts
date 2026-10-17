import { describe, it, expect } from 'vitest';
import { memory as wmMemory } from '../../src/steps/memory.step1';

describe('Working Memory (4.3 / 4.5)', () => {
  it('テンプレートが設定されている', async () => {
    const t = await wmMemory.getWorkingMemoryTemplate({
      memoryConfig: wmMemory.getMergedThreadConfig(),
    });
    expect(t?.content).toContain('- 名前:');
  });

  it('同じ resource なら別の thread からも同じ内容が読める', async () => {
    for (const id of ['support-thread-001', 'project-thread-001']) {
      await wmMemory.saveThread({
        thread: { id, resourceId: 'user-tanaka', title: id, createdAt: new Date(), updatedAt: new Date() },
      });
    }
    await wmMemory.updateWorkingMemory({
      threadId: 'support-thread-001',
      resourceId: 'user-tanaka',
      workingMemory: '# ユーザープロファイル\n- 名前: 田中太郎\n- 役職: CTO',
    });

    const wm = await wmMemory.getWorkingMemory({
      threadId: 'project-thread-001',
      resourceId: 'user-tanaka',
    });
    expect(wm).toContain('名前: 田中太郎');
  });
});

describe('バックエンドの切り替え (4.4 / 4.6)', () => {
  it('LibSQL 版・Postgres 版・Semantic Recall 版がどれも作れる', async () => {
    const dev = await import('../../src/mastra/memory.dev');
    const prod = await import('../../src/mastra/memory.prod');
    const recall = await import('../../src/mastra/memory');
    expect(dev.memory.vector).toBeDefined();
    expect(prod.memory.vector).toBeDefined();
    expect(recall.memory.getMergedThreadConfig().semanticRecall).toMatchObject({ topK: 3 });
  });
});

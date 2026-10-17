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
    // dev / prod も vector と embedder を渡したうえで Semantic Recall を有効にしている
    expect(dev.memory.getMergedThreadConfig().semanticRecall).toBe(true);
    expect(prod.memory.getMergedThreadConfig().semanticRecall).toBe(true);
    const config = recall.memory.getMergedThreadConfig();
    expect(config.semanticRecall).toMatchObject({ topK: 3 });
    // 4.6 の版でも 4.3 の Working Memory を残している
    expect(config.workingMemory).toMatchObject({ enabled: true });
  });
});

describe('Memory の構成 (4.1 / 4.5 / 4.7)', () => {
  it('supportAgent と削除処理が同じ Memory を使う', async () => {
    const { memory } = await import('../../src/mastra');
    const { supportAgent } = await import('../../src/mastra/agents/support');
    expect(await supportAgent.getMemory()).toBe(memory);
  });
});

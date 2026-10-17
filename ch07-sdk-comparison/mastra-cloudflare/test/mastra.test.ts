import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { getDeployer } from '@mastra/deployer';
import type { Reply } from '../../testing/mock-model';

const replies = vi.hoisted(() => [] as Reply[]);
vi.mock('@ai-sdk/anthropic', async () => {
  const { scriptedModel } = await import('../../testing/mock-model');
  return { anthropic: (id: string) => scriptedModel(replies, id) };
});

describe('mastra with CloudflareDeployer', () => {
  it('runs the registered agent', async () => {
    const { mastra } = await import('../src/mastra');
    replies.push({ text: 'はい' });
    const res = await mastra.getAgent('customerSupport').generate('こんにちは');
    expect(res.text).toBe('はい');
  });

  // mastra build / deploy は src/mastra/index.ts から deployer の設定を取り出す。
  // 実行時の Mastra インスタンスは deployer を保持しない（getDeployer() は undefined）
  it('lets mastra build read the deployer from the entry file', async () => {
    // 出力先は node_modules を解決できるよう章の中（.mastra/ は gitignore 済み）
    const out = join(import.meta.dirname, '../.mastra/test-build');
    await mkdir(out, { recursive: true });
    const entry = join(import.meta.dirname, '../src/mastra/index.ts');
    const deployer = await getDeployer(entry, out);
    expect(deployer?.constructor.name).toBe('CloudflareDeployer');
  }, 60_000);
});

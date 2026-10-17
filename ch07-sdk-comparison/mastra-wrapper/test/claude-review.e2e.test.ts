// Mastra Agent → codeReviewTool → 本物の Claude Code の順に動かし、
// レビュー中のモデルが書き込みを試みても何も書き換わらないことを確かめる。
// Claude Code の先のモデルは偽の Anthropic API（API キーは不要）。
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Agent } from '@mastra/core/agent';
import { codeReviewTool } from '../src/mastra/tools/claude-review';
import { scriptedModel } from '../../testing/mock-model';
import { startFakeAnthropicApi } from '../../testing/fake-anthropic-api';
import {
  claudeCodeEnv,
  createWorkdir,
  SOURCE,
  WRITTEN_BY_ATTEMPTS,
  writeAttempts,
} from '../../testing/claude-code-e2e';

let work: Awaited<ReturnType<typeof createWorkdir>>;
let api: Awaited<ReturnType<typeof startFakeAnthropicApi>>;
let review: unknown;

beforeAll(async () => {
  work = await createWorkdir();
  // codeReviewTool の maxTurns: 5 に収まるよう、書き込みの 4 回だけを試みる
  api = await startFakeAnthropicApi(writeAttempts(work.dir));
  for (const [key, value] of Object.entries(claudeCodeEnv(work.dir, api.url))) {
    if (value !== undefined) vi.stubEnv(key, value);
  }
  const filePath = join(work.dir, 'src/api/items.ts');
  const agent = new Agent({
    id: 'reviewer',
    name: 'Reviewer',
    instructions: 'コードレビューを依頼されたらツールを使う',
    model: scriptedModel([
      { toolCall: { name: 'codeReviewTool', input: { filePath } } },
      { text: 'レビューしました' },
    ]),
    tools: { codeReviewTool },
  });
  const res = await agent.generate(`${filePath} をレビューして`);
  review = res.toolResults[0]?.payload.result;
}, 150_000);

afterAll(async () => {
  vi.unstubAllEnvs();
  await api?.close();
  await work?.remove();
});

describe('codeReviewTool with the real Claude Code', () => {
  it('shows the model only the read-only built-in tools', () => {
    const tools = api.requests[0]?.tools.filter((t) => !t.startsWith('mcp__'));
    expect(tools?.sort()).toEqual(['Glob', 'Grep', 'Read']);
  });

  it('rejects every write call and changes no files', async () => {
    const results = api.requests.at(-1)?.results ?? [];
    expect(results.map((x) => x.isError)).toEqual([true, true, true, true]);
    for (const f of WRITTEN_BY_ATTEMPTS) {
      expect(existsSync(join(work.dir, f))).toBe(false);
    }
    const source = await readFile(join(work.dir, 'src/api/items.ts'), 'utf8');
    expect(source).toBe(SOURCE);
  });

  it('returns the final answer of Claude Code as the review', () => {
    expect(review).toEqual({ review: 'done', issues: 0 });
  });
});

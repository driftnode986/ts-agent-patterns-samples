// read-only.ts と stateless.ts を本物の Claude Code で動かし、モデルが
// 書き込みを試みても何も書き換わらないことを確かめる。モデルの代わりに
// 偽の Anthropic API が Bash・Write・Edit などを順に呼ぶ（API キーは不要）。
// read-only.ts の MCP サーバーは npx で取得するため、初回はネットワークが必要。
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  startFakeAnthropicApi,
  type PlannedCall,
} from '../../testing/fake-anthropic-api';
import {
  claudeCodeEnv,
  createWorkdir,
  SOURCE,
  WRITTEN_BY_ATTEMPTS,
  writeAttempts,
} from '../../testing/claude-code-e2e';

const run = promisify(execFile);
const tsx = fileURLToPath(new URL('../../../node_modules/.bin/tsx', import.meta.url));
const scriptPath = (name: string) =>
  fileURLToPath(new URL(`../src/${name}`, import.meta.url));

async function runScript(name: string, extra: (dir: string) => PlannedCall[]) {
  const work = await createWorkdir();
  const plan = [...writeAttempts(work.dir), ...extra(work.dir)];
  const api = await startFakeAnthropicApi(plan);
  await run(tsx, [scriptPath(name)], {
    cwd: work.dir,
    env: claudeCodeEnv(work.dir, api.url),
    timeout: 120_000,
  });
  await api.close();
  // 最後のリクエストには、それまでのツールの結果がすべて入っている
  const results = api.requests.at(-1)?.results ?? [];
  return { work, api, plan, results };
}

describe.each([
  {
    script: 'read-only.ts',
    builtIn: ['Glob', 'Grep', 'Read'],
    extra: (dir: string) => [
      {
        name: 'mcp__specs__write_file',
        input: { path: `${dir}/docs/specs/by-mcp.txt`, content: 'x' },
      },
      { name: 'Read', input: { file_path: `${dir}/src/api/items.ts` } },
      {
        name: 'mcp__specs__read_text_file',
        input: { path: `${dir}/docs/specs/spec.md` },
      },
    ],
  },
  // stateless.ts は maxTurns: 5 なので、書き込みの 4 回だけを試みる
  { script: 'stateless.ts', builtIn: ['Glob', 'Read'], extra: () => [] },
])('$script with the real Claude Code', ({ script, builtIn, extra }) => {
  let r: Awaited<ReturnType<typeof runScript>>;
  beforeAll(async () => {
    r = await runScript(script, extra);
  }, 150_000);
  afterAll(() => r?.work.remove());

  it('shows the model only the read-only built-in tools', () => {
    const tools = r.api.requests[0]?.tools.filter((t) => !t.startsWith('mcp__'));
    expect(tools?.sort()).toEqual(builtIn);
  });

  it('changes no files even when the model tries to write', async () => {
    for (const f of [...WRITTEN_BY_ATTEMPTS, 'docs/specs/by-mcp.txt']) {
      expect(existsSync(join(r.work.dir, f))).toBe(false);
    }
    const source = await readFile(join(r.work.dir, 'src/api/items.ts'), 'utf8');
    expect(source).toBe(SOURCE);
  });

  it('rejects every write call and runs the read calls', () => {
    const outcome = r.results.map((res, i) => [r.plan[i]?.name, res.isError]);
    const expected = r.plan.map((c) => [
      c.name,
      !['Read', 'mcp__specs__read_text_file'].includes(c.name),
    ]);
    expect(outcome).toEqual(expected);
  });

  it.runIf(script === 'read-only.ts')('denies the MCP write in dontAsk mode', () => {
    const byName = (n: string) => r.results[r.plan.findIndex((c) => c.name === n)];
    expect(byName('mcp__specs__write_file')?.text).toContain("don't ask mode");
    expect(byName('Read')?.text).toContain('export const x = 1');
    expect(byName('mcp__specs__read_text_file')?.text).toContain('GET /items');
  });
});

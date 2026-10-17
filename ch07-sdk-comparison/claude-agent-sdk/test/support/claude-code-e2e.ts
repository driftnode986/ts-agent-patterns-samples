// 本物の Claude Code を偽の Anthropic API につないで動かすための準備。
// 作業フォルダ（仕様書 1 つとソース 1 つ）と、Claude Code に渡す環境変数を作る。
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PlannedCall } from './fake-anthropic-api';

export const SOURCE = 'export const x = 1;\n';

export async function createWorkdir() {
  // macOS の tmpdir はシンボリックリンクなので、実体のパスにそろえる
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'claude-e2e-')));
  await mkdir(join(dir, 'docs/specs'), { recursive: true });
  await mkdir(join(dir, 'src/api'), { recursive: true });
  await mkdir(join(dir, 'claude-config'));
  await writeFile(join(dir, 'docs/specs/spec.md'), '# GET /items\n');
  await writeFile(join(dir, 'src/api/items.ts'), SOURCE);
  return {
    dir,
    remove: () => rm(dir, { recursive: true, force: true }),
  };
}

export function claudeCodeEnv(dir: string, apiUrl: string) {
  return {
    ...process.env,
    ANTHROPIC_BASE_URL: apiUrl,
    ANTHROPIC_API_KEY: 'sk-ant-test',
    CLAUDE_CONFIG_DIR: join(dir, 'claude-config'), // 手元の設定を読ませない
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
    SPECS_DIR: join(dir, 'docs/specs'),
  };
}

/** モデルが順に試みる、書き込み系の呼び出し（どれも拒否されるべきもの） */
export function writeAttempts(dir: string): PlannedCall[] {
  return [
    { name: 'Bash', input: { command: `touch ${dir}/by-bash`, description: 'x' } },
    { name: 'Write', input: { file_path: `${dir}/by-write.txt`, content: 'x' } },
    {
      name: 'Edit',
      input: { file_path: `${dir}/src/api/items.ts`, old_string: 'x = 1', new_string: 'x = 2' },
    },
    {
      name: 'NotebookEdit',
      input: { notebook_path: `${dir}/by-notebook.ipynb`, new_source: 'x' },
    },
  ];
}

export const WRITTEN_BY_ATTEMPTS = ['by-bash', 'by-write.txt', 'by-notebook.ipynb'];

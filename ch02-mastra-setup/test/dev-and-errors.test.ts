import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { noopObserve } from '@mastra/core/tools';
import { weatherTool } from '../src/mastra/tools';

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

describe('2.4 npm run dev', () => {
  const pkg = JSON.parse(read('../package.json'));

  it('runs mastra dev with the .env at the repo root', () => {
    expect(pkg.scripts.dev).toBe('mastra dev --env ../.env');
  });

  it('pins the mastra CLI that accepts the installed @mastra/core', () => {
    const cli = JSON.parse(read('../../node_modules/mastra/package.json'));
    const core = JSON.parse(read('../../node_modules/@mastra/core/package.json'));
    expect(pkg.devDependencies.mastra).toBe(cli.version);
    // mastra@1.34.2 の peerDependencies は ">=1.58.0-0 <2.0.0-0"
    const [major, minor] = core.version.split('.').map(Number);
    expect(cli.peerDependencies['@mastra/core']).toBe('>=1.58.0-0 <2.0.0-0');
    expect(major).toBe(1);
    expect(minor).toBeGreaterThanOrEqual(58);
  });
});

describe('2.3 .env.example', () => {
  it('has no server settings that mastra dev ignores', () => {
    const env = read('../.env.example');
    expect(env).not.toMatch(/MASTRA_SERVER_(HOST|PORT)/);
    expect(env).toMatch(/^ANTHROPIC_API_KEY=$/m);
  });
});

describe('2.12 tool input errors', () => {
  it('returns the validation error as the tool result instead of throwing', async () => {
    const execute = weatherTool.execute!;
    // LLM が city を渡さなかった場合を再現する
    const result = await execute({} as { city: string }, {
      observe: noopObserve,
    });
    expect(result).toMatchObject({ error: true });
    const message = (result as unknown as { message: string }).message;
    expect(message).toContain('Tool input validation failed for get-weather');
    expect(message).toContain(
      '- city: Invalid input: expected string, received undefined',
    );
  });
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // テストではファイルを作らず、メモリ上の LibSQL に保存する
    env: { WORKFLOW_DB_URL: ':memory:' },
    testTimeout: 20_000,
  },
});

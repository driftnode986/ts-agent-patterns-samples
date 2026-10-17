// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // テストから Langfuse に送らない: キーを空にし、送り先を閉じたポートにする
    env: {
      LANGFUSE_PUBLIC_KEY: '',
      LANGFUSE_SECRET_KEY: '',
      LANGFUSE_BASE_URL: 'http://127.0.0.1:9',
      ANTHROPIC_API_KEY: 'test-key',
    },
  },
});

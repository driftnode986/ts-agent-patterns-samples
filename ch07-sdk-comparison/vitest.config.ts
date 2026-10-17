import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // vercel-ai-sdk/tsconfig.json の paths（@/* → ./src/*）と同じ
    alias: {
      '@': fileURLToPath(new URL('./vercel-ai-sdk/src', import.meta.url)),
    },
  },
});

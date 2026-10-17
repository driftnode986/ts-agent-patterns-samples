import { describe, expect, it, vi } from 'vitest';
import { textModel } from './mock-model';

// Anthropic の代わりに、受け取ったプロンプトを記録する偽のモデルを使う
const model = vi.hoisted(() => ({ current: null as ReturnType<typeof textModel> | null }));
vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: () => model.current,
}));

describe('answerWithCanary', () => {
  it.each([
    { percentage: '100', version: 'v2', instructions: '3文以内' },
    { percentage: '0', version: 'v1', instructions: '挨拶から' },
  ])(
    'CANARY_PERCENTAGE=$percentage なら $version の instructions で答える',
    async ({ percentage, version, instructions }) => {
      vi.resetModules();
      vi.stubEnv('CANARY_PERCENTAGE', percentage);
      model.current = textModel('承知しました');
      const { answerWithCanary } = await import('../src/middleware/canary');

      expect(await answerWithCanary('user-1', '配送状況は?')).toEqual({
        version,
        text: '承知しました',
      });
      const sent = JSON.stringify(model.current.doGenerateCalls[0].prompt);
      expect(sent).toContain(instructions);
      vi.unstubAllEnvs();
    },
  );
});

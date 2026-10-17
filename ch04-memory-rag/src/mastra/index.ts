// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { supportAgent } from './agents/support';

// 4.7 の削除処理が import できるように、Memory も export する
export { memory } from './memory';

export const mastra = new Mastra({
  agents: { supportAgent },
});

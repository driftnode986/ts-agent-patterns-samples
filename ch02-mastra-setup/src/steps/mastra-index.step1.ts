// src/mastra/index.ts (2.10 の時点。2.11 で storage を足す)
import { Mastra } from '@mastra/core';
import { supportAgent, weatherAgent } from '../mastra/agents';

export const mastra = new Mastra({
  agents: { supportAgent, weatherAgent },
});

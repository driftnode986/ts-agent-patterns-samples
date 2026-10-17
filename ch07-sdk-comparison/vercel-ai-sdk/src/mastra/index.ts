// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { customerSupport } from './agents/customer-support';

export const mastra = new Mastra({
  agents: { customerSupport },
});

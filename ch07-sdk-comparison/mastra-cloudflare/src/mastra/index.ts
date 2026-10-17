// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';

export const mastra = new Mastra({
  agents: { customerSupport },
  deployer: new CloudflareDeployer({
    scope: 'my-account-id',
    projectName: 'my-agent-app',
  }),
});

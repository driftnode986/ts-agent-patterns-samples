import { Mastra } from '@mastra/core';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { customerSupport } from './agents/customer-support';

export const mastra = new Mastra({
  agents: { customerSupport },
  deployer: new CloudflareDeployer({
    account_id: 'my-account-id',
    name: 'my-agent-app',
  }),
});

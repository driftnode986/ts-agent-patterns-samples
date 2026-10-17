// src/index.ts
import { Agent } from 'agents';

export class ResearchAgent extends Agent<Env> {
  async onMessage(query: string) {
    const searchResults = await this.think(async () => {
      return await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: `Search: ${query}` }],
      });
    });

    const summary = await this.think(async () => {
      return await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'user',
            content: `Summarize: ${searchResults.response}`,
          },
        ],
      });
    });

    return summary.response;
  }
}

import { Agent, type Connection, type WSMessage } from 'agents';

export class ResearchAgent extends Agent<Env> {
  async onMessage(connection: Connection, message: WSMessage) {
    const query = String(message);
    const searchResults = await this.runFiber('search', async () => {
      return await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
        messages: [{ role: 'user', content: `Search: ${query}` }],
      });
    });

    const summary = await this.runFiber('summarize', async () => {
      return await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
        messages: [
          {
            role: 'user',
            content: `Summarize: ${searchResults.response}`,
          },
        ],
      });
    });

    connection.send(summary.response ?? '');
  }
}

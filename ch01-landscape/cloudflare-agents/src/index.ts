import { Agent, type Connection, type WSMessage } from 'agents';

export class MyAgent extends Agent<Env> {
  async onMessage(connection: Connection, message: WSMessage) {
    const response = await this.runFiber('reply', async () =>
      this.env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
        prompt: String(message),
      }),
    );
    connection.send(response.response ?? '');
  }
}

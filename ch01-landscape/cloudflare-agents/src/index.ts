// src/index.ts
import { Agent } from 'agents';

export class MyAgent extends Agent {
  async onMessage(message: string) {
    const response = await this.think(message);
    return response;
  }
}

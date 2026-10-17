// #region customer-support
import {
  Agent,
  getAgentByName,
  type Connection,
  type WSMessage,
} from 'agents';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type State = { history: ChatMessage[] };
// #endregion

// #region on-message
export class CustomerSupport extends Agent<Env, State> {
  async onMessage(connection: Connection, message: WSMessage) {
    const text = String(message);
    const response = await this.env.AI.run(
      '@cf/meta/llama-3.1-8b-instruct-fp8',
      {
        messages: [
          { role: 'system', content: 'あなたは顧客サポート担当者です。' },
          ...(this.state?.history || []),
          { role: 'user', content: text },
        ],
      }
    );
    const reply = response.response ?? '';

    this.setState({
      ...this.state,
      history: [
        ...(this.state?.history || []),
        { role: 'user', content: text },
        { role: 'assistant', content: reply },
      ],
    });

    connection.send(reply);
  }
}
// #endregion

// #region fetch
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const agent = await getAgentByName(env.CUSTOMER_SUPPORT, 'user-123');
    return agent.fetch(request);
  },
};
// #endregion

// #region exports
// wrangler.jsonc で宣言した Durable Object のクラスは、
// エントリの src/index.ts から export する
export { ChatAgent } from './chat-agent';
export { ResearchAgent } from './research-agent';
// #endregion

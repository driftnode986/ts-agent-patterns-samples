import { query } from '@anthropic-ai/claude-agent-sdk';

/**
 * query() のメッセージを最後まで読み、
 * 最終回答とセッション ID を返す
 */
export async function runQuery(params: Parameters<typeof query>[0]) {
  for await (const message of query(params)) {
    if (message.type !== 'result') continue;
    if (message.subtype !== 'success') {
      throw new Error(`query failed: ${message.subtype}`);
    }
    return { result: message.result, sessionId: message.session_id };
  }
  throw new Error('query ended without a result message');
}

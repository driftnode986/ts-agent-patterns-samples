// #region select
import { hashCode } from '../lib/hash';

export function selectAgentVersion(userId: string): 'v1' | 'v2' {
  const hash = hashCode(userId);
  const canaryPercentage = parseInt(process.env.CANARY_PERCENTAGE || '0');
  return (hash % 100) < canaryPercentage ? 'v2' : 'v1';
}
// #endregion

// #region pick
import { supportAgents } from '../mastra/agents';

// Canary: リクエストごとに、ユーザーの版の Agent を選んで呼ぶ
export async function answerWithCanary(userId: string, message: string) {
  const version = selectAgentVersion(userId);
  const result = await supportAgents[version].generate(message);
  return { version, text: result.text };
}
// #endregion

import { supportAgent as agent } from '../mastra/agents/support-agent';

// トレースにタグとメタデータを付けて呼び出す (6.6)
export async function askOrderStatus() {
  // #region tags-metadata
  const result = await agent.generate('注文状況を教えてください', {
    tracingOptions: {
      tags: ['production', 'customer-support'],
      metadata: {
        userId: 'user-123',
        tenantId: 'tenant-456',
        experimentId: 'prompt-v3',
      },
    },
  });
  // #endregion
  return result;
}

// プロンプトとレスポンスをトレースに残さない (6.9)
export async function askWithoutRecording() {
  // #region hide-input-output
  const result = await agent.generate('クレジットカード番号は...', {
    tracingOptions: {
      hideInput: true,
      hideOutput: true,
      tags: ['pii-sensitive'],
    },
  });
  // #endregion
  return result;
}

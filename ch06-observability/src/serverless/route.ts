import { mastra } from '../mastra';
import { supportAgent as agent } from '../mastra/agents/support-agent';

// #region serverless-flush
export async function POST(req: Request) {
  const result = await agent.generate([
    { role: 'user', content: await req.text() },
  ]);

  // 関数終了前にフラッシュ (必須)
  const observability = mastra.observability;
  await observability.flush();

  return Response.json(result);
}
// #endregion

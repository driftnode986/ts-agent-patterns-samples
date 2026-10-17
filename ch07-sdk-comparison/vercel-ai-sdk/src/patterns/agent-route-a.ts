// src/app/api/agent/route.ts（パターン A: Mastra を別プロセスで動かす）
export async function POST(req: Request) {
  const { message } = await req.json();

  const response = await fetch(
    'http://localhost:4111/api/agents/customerSupport/stream',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
      }),
    }
  );

  return new Response(response.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

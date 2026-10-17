// 偽の Anthropic Messages API。Claude Code から届いたリクエストを記録し、
// plan の順に tool_use を 1 つずつ返す。plan を使い切ったら 'done' と答える。
import http from 'node:http';
import type { AddressInfo } from 'node:net';

export interface PlannedCall {
  name: string;
  input: Record<string, unknown>;
}
export interface ToolResult {
  id: string;
  isError: boolean;
  text: string;
}
interface Recorded {
  tools: string[]; // モデルに見せたツールの名前
  results: ToolResult[]; // それまでに返ってきたツールの結果
}

type Block = Record<string, unknown>;
type Message = { content?: string | Block[] };

function toolResults(messages: Message[]): ToolResult[] {
  return messages
    .flatMap((m) => (Array.isArray(m.content) ? m.content : []))
    .filter((c) => c.type === 'tool_result')
    .map((c) => ({
      id: String(c.tool_use_id),
      isError: c.is_error === true,
      text: JSON.stringify(c.content),
    }));
}

function writeSse(res: http.ServerResponse, msg: Block & { content: Block[] }) {
  res.writeHead(200, { 'content-type': 'text/event-stream' });
  const send = (data: Block) =>
    res.write(`event: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`);
  const usage = { input_tokens: 10, output_tokens: 0 };
  send({
    type: 'message_start',
    message: { ...msg, content: [], stop_reason: null, usage },
  });
  msg.content.forEach((block, index) => {
    if (block.type === 'text') {
      send({ type: 'content_block_start', index, content_block: { type: 'text', text: '' } });
      send({ type: 'content_block_delta', index, delta: { type: 'text_delta', text: block.text } });
    } else {
      send({ type: 'content_block_start', index, content_block: { ...block, input: {} } });
      send({
        type: 'content_block_delta',
        index,
        delta: { type: 'input_json_delta', partial_json: JSON.stringify(block.input) },
      });
    }
    send({ type: 'content_block_stop', index });
  });
  send({
    type: 'message_delta',
    delta: { stop_reason: msg.stop_reason },
    usage: { output_tokens: 5 },
  });
  send({ type: 'message_stop' });
  res.end();
}

export async function startFakeAnthropicApi(plan: PlannedCall[]) {
  const requests: Recorded[] = [];
  let next = 0;
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const json = body ? JSON.parse(body) : {};
      const tools: string[] = (json.tools ?? []).map((t: Block) => t.name);
      // ツールを持たない呼び出し（タイトル付けなど）とトークン数の問い合わせ
      if (!req.url?.startsWith('/v1/messages') || tools.length === 0) {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ input_tokens: 10 }));
        return;
      }
      requests.push({ tools, results: toolResults(json.messages ?? []) });
      const call = plan[next];
      next += 1;
      const content: Block[] = call
        ? [{ type: 'tool_use', id: `toolu_${next}`, name: call.name, input: call.input }]
        : [{ type: 'text', text: 'done' }];
      const msg = {
        id: `msg_${next}`,
        type: 'message',
        role: 'assistant',
        model: json.model,
        content,
        stop_reason: call ? 'tool_use' : 'end_turn',
      };
      if (json.stream) {
        writeSse(res, msg);
        return;
      }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ...msg, usage: { input_tokens: 10, output_tokens: 5 } }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

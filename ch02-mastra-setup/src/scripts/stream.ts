import { mastra } from '../mastra';

const agent = mastra.getAgent('weatherAgent');

// #region stream
// ストリーミング応答: トークンが生成されるたびに逐次返る
const stream = await agent.stream('東京の天気を教えてください');

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
// #endregion

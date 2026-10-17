import { mastra } from '../mastra';

const agent = mastra.getAgent('weatherAgent');

// #region generate
// 同期応答: 全トークンが生成されてから返る
const response = await agent.generate('東京の天気を教えてください');
console.log(response.text);
// #endregion

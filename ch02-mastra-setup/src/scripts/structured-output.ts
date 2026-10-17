import { mastra } from '../mastra';

const agent = mastra.getAgent('supportAgent');

// #region structured-output
import { z } from 'zod';

const stream = await agent.stream('明日の予定を立ててください', {
  structuredOutput: {
    schema: z.array(
      z.object({
        time: z.string(),
        task: z.string(),
      }),
    ),
  },
});

// 構造化されたオブジェクトを取得
const schedule = await stream.object;
console.log(schedule);
// #endregion

// #region generate
import { z } from 'zod';
import { supportAgent } from '../mastra/agents';

const taskSchema = z.object({
  title: z.string().describe('タスクのタイトル'),
  priority: z.enum(['high', 'medium', 'low']).describe('優先度'),
  estimatedHours: z.number().describe('見積もり工数 (時間)'),
  tags: z.array(z.string()).describe('関連タグ'),
});

const response = await supportAgent.generate(
  'Next.js のログイン画面を実装するタスクを作成してください',
  {
    structuredOutput: {
      schema: taskSchema,
    },
  }
);

// response.object は taskSchema の型で推論される
console.log(response.object.title); // "Next.js ログイン画面の実装"
console.log(response.object.priority); // "high"
console.log(response.object.estimatedHours); // 8
// #endregion

// #region stream
const stream = await supportAgent.stream(
  '今週のスプリントタスクを 3 つ提案してください',
  {
    structuredOutput: {
      schema: z.array(taskSchema),
    },
  }
);

const tasks = await stream.object;
// tasks は z.infer<typeof taskSchema>[] 型
// #endregion
console.log(tasks.length);

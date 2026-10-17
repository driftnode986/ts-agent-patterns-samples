// #region prompt-linking
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { buildTracingOptions } from '@mastra/observability';
import { LangfuseExporter, withLangfusePrompt } from '@mastra/langfuse';

const exporter = new LangfuseExporter({ /* keys */ });
if (!exporter.client) throw new Error('Langfuse のキーが未設定です');
const prompt = await exporter.client.prompt.get(
  'customer-support',
  { type: 'text' }
);

export const promptLinkedAgent = new Agent({
  id: 'prompt-linked-agent',
  name: 'prompt-linked-agent',
  instructions: prompt.compile(),
  model: anthropic('claude-sonnet-4-6'),
  defaultOptions: {
    tracingOptions: buildTracingOptions(
      withLangfusePrompt({
        name: prompt.name,
        version: prompt.version,
      })
    ),
  },
});
// #endregion

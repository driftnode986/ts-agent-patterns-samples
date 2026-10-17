import { beforeEach, describe, expect, it, vi } from 'vitest';
import { anthropicMock, claude, gpt, resetModels } from '../helpers/models';

vi.mock('@ai-sdk/anthropic', async () => {
  const { anthropicMock } = await import('../helpers/models');
  return { anthropic: anthropicMock };
});
vi.mock('@ai-sdk/openai', async () => {
  const { openaiMock } = await import('../helpers/models');
  return { openai: openaiMock };
});

const { fullAgent, researchAgent, resilientAgent, supportAgent, createTenantAgent } =
  await import('../../src/mastra/agents');
const { ask } = await import('../../src/mastra/agents/smart-agent');

beforeEach(resetModels);

describe('fullAgent (3.1)', () => {
  it('渡した Tool を呼び出して回答する', async () => {
    claude.enqueue(
      { toolCalls: [{ toolName: 'searchTool', input: { query: 'Mastra' } }] },
      { text: 'Mastra の公式ドキュメントを参照してください' },
    );
    const response = await fullAgent.generate('Mastra の資料はありますか');
    expect(response.toolResults[0].payload.result).toEqual({
      results: ['Mastra の公式ドキュメント'],
    });
    expect(response.text).toContain('公式ドキュメント');
  });
});

describe('researchAgent (3.5)', () => {
  it('1 回の応答で返した複数の Tool 呼び出しを両方実行する', async () => {
    claude.enqueue(
      {
        toolCalls: [
          { toolName: 'searchWebTool', input: { query: '競合' } },
          { toolName: 'getCalendarTool', input: { date: '2026-10-19' } },
        ],
      },
      { text: '競合情報と来週の予定をまとめました' },
    );
    const response = await researchAgent.generate('競合情報と予定を確認して');
    const names = response.toolResults.map((r) => r.payload.toolName).sort();
    expect(names).toEqual(['getCalendarTool', 'searchWebTool']);
    // LLM の呼び出しは 2 回 (Tool の選択と、結果を受けた回答)
    expect(claude.model.doGenerateCalls).toHaveLength(2);
  });
});

describe('Tool のエラー (3.4)', () => {
  it('Tool が投げたメッセージが LLM に渡る', async () => {
    claude.enqueue(
      { toolCalls: [{ toolName: 'getCustomerTool', input: { customerId: 'x' } }] },
      { text: '該当する顧客が見つかりませんでした' },
    );
    await supportAgent.generate('顧客 x を調べて');
    const secondPrompt = JSON.stringify(claude.model.doGenerateCalls[1].prompt);
    expect(secondPrompt).toContain('顧客 ID x は存在しません');
  });
});

describe('resilientAgent (3.9)', () => {
  it('プライマリが失敗したら fallback のモデルで回答する', async () => {
    const rateLimit = Object.assign(new Error('rate limit'), { statusCode: 429 });
    claude.enqueue({ error: rateLimit }, { error: rateLimit }, { error: rateLimit });
    gpt.enqueue({ text: 'GPT が回答しました' });
    const response = await resilientAgent.generate('こんにちは');
    expect(response.text).toBe('GPT が回答しました');
    expect(claude.model.doGenerateCalls.length).toBeGreaterThan(0);
    expect(gpt.model.doGenerateCalls).toHaveLength(1);
  });
});

describe('createTenantAgent (3.12)', () => {
  it('テナント設定から instructions と ID を組み立てる', async () => {
    const agent = createTenantAgent({
      tenantId: 'acme',
      companyName: 'ACME',
      supportTier: 'premium',
      knowledgeBase: ['返品は30日以内'],
    });
    expect(agent.id).toBe('support-acme');
    const instructions = String(await agent.getInstructions());
    expect(instructions).toContain('あなたは ACME のカスタマーサポートエージェントです');
    expect(instructions).toContain('- 返品は30日以内');
    expect(instructions).toContain('コード例を積極的に示してください');
    expect(Object.keys(await agent.listTools())).toEqual(['searchKnowledgeBase']);
  });
});

describe('Token-aware routing (3.10)', () => {
  it('呼び出し時に入力の長さで選んだモデルを使う', async () => {
    claude.enqueue({ text: '短い回答' }, { text: '長い回答' });
    await ask('短い質問');
    await ask('あ'.repeat(20000));
    const ids = anthropicMock.mock.calls.map(([id]) => id);
    expect(ids).toContain('claude-haiku-4-5');
    expect(ids).toContain('claude-opus-4-7');
    expect(claude.model.doGenerateCalls).toHaveLength(2);
  });
});

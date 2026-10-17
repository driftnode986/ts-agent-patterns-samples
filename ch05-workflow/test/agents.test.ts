import { describe, it, expect, vi, beforeEach } from 'vitest';

// reviewerAgent のモデル（anthropic(...)）を偽物に差し替える
const reply = vi.hoisted(() => ({ text: '' }));
vi.mock('@ai-sdk/anthropic', async () => {
  const { textModel } = await import('./mock-model');
  return { anthropic: () => textModel(() => reply.text) };
});

const { mastra } = await import('../src/mastra');
const { agentStepWorkflow, structuredReviewWorkflow } = await import(
  '../src/mastra/workflows/agent-step-workflow'
);

beforeEach(() => {
  reply.text = '';
});

describe('Workflow Step から Agent を呼ぶ (5.11)', () => {
  it('パターン A: Step の中で mastra.getAgent() の Agent を呼ぶ', async () => {
    reply.text = '見出しが本文と合っていません。';
    const run = await mastra.getWorkflow('documentReviewWorkflow').createRun();
    const result = await run.start({ inputData: { document: '仕様書 v1' } });
    expect(result.status === 'success' && result.result).toEqual({
      review: '見出しが本文と合っていません。',
      score: 0.85,
    });
  });

  it('getAgent() は登録したキーで引く（Agent の id では引けない）', () => {
    expect(mastra.getAgent('reviewerAgent').id).toBe('document-reviewer');
    expect(() => mastra.getAgent('document-reviewer' as 'reviewerAgent')).toThrow();
  });

  it('パターン B: createStep(agent) は { prompt } を受けて { text } を返す', async () => {
    reply.text = '誤字が 2 か所あります。';
    const run = await agentStepWorkflow.createRun();
    const result = await run.start({ inputData: { document: '議事録' } });
    expect(result.status === 'success' && result.result).toEqual({
      text: '誤字が 2 か所あります。',
    });
  });

  it('パターン C: structuredOutput を渡すと出力がスキーマの形になる', async () => {
    reply.text = JSON.stringify({
      summary: '概ね良い',
      issues: ['図番号の重複'],
      score: 0.7,
    });
    const run = await structuredReviewWorkflow.createRun();
    const result = await run.start({ inputData: { document: '設計書' } });
    expect(result.status === 'success' && result.result).toEqual({
      summary: '概ね良い',
      issues: ['図番号の重複'],
      score: 0.7,
    });
  });
});

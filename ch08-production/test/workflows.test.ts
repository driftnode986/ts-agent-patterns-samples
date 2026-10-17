import { afterEach, describe, expect, it, vi } from 'vitest';
import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { bookingSaga } from '../src/mastra/workflows/booking-saga';
import { approvalWorkflow } from '../src/mastra/workflows/approval-workflow';
import { flightAPI, hotelAPI } from '../src/lib/travel-api';

afterEach(() => vi.restoreAllMocks());

describe('bookingSaga', () => {
  it('ホテルと航空券を順に予約する', async () => {
    const run = await bookingSaga.createRun();
    const result = await run.start({
      inputData: { destination: 'Osaka', dates: '2026-11-01' },
    });
    expect(result.status).toBe('success');
    if (result.status !== 'success') return;
    expect(result.result.flightId).toBe('flight-Osaka-2026-11-01');
  });

  it('航空券の予約に失敗したら、ホテル予約を取り消す', async () => {
    const book = vi.spyOn(hotelAPI, 'book');
    const cancel = vi.spyOn(hotelAPI, 'cancel');
    vi.spyOn(flightAPI, 'book').mockRejectedValue(new Error('満席'));

    const run = await bookingSaga.createRun();
    const result = await run.start({
      inputData: { destination: 'Osaka', dates: '2026-11-01' },
    });

    expect(result.status).toBe('failed');
    const hotelId = await book.mock.results[0].value;
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledWith(hotelId));
    expect(hotelAPI.has(hotelId)).toBe(false);
  });
});

describe('approvalWorkflow', () => {
  // resume には storage に保存したスナップショットが要る。テストではメモリ上の LibSQL を使う
  const mastra = new Mastra({
    workflows: { approvalWorkflow },
    storage: new LibSQLStore({ id: 'test-storage', url: ':memory:' }),
    logger: false,
  });
  const workflow = mastra.getWorkflow('approvalWorkflow');

  it('高リスク操作は suspend し、承認で再開すると approved: true', async () => {
    const run = await workflow.createRun();
    const first = await run.start({ inputData: { request: '返金して' } });
    expect(first.status).toBe('suspended');
    if (first.status !== 'suspended') return;
    expect(first.suspendPayload['human-approval']).toMatchObject({
      reason: '高リスク操作: refund (¥50000)',
      notifyChannel: 'slack',
    });

    const resumed = await run.resume({
      step: 'human-approval',
      resumeData: { decision: 'approve' },
    });
    expect(resumed.status).toBe('success');
    if (resumed.status !== 'success') return;
    expect(resumed.result).toEqual({ approved: true });
  });

  it('却下すると approved: false', async () => {
    const run = await workflow.createRun();
    await run.start({ inputData: { request: '返金して' } });
    const resumed = await run.resume({
      step: 'human-approval',
      resumeData: { decision: 'reject' },
    });
    expect(resumed.status).toBe('success');
    if (resumed.status !== 'success') return;
    expect(resumed.result).toEqual({ approved: false });
  });
});

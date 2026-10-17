import { describe, it, expect, vi } from 'vitest';
import { paymentWorkflow } from '../src/mastra/workflows/payment-workflow';
import { paymentGateway } from '../src/lib/payment-gateway';

describe('paymentWorkflow (5.2)', () => {
  it('検証 → 決済 → 領収書の順に進み receiptId を返す', async () => {
    const run = await paymentWorkflow.createRun();
    const result = await run.start({
      inputData: { email: 'user@example.com', amount: 5000 },
    });
    expect(result.status).toBe('success');
    if (result.status !== 'success') return;
    expect(result.result.receiptId).toMatch(/^rcpt_pay_\d+$/);
    expect(result.steps['validate-input']?.status).toBe('success');
    expect(result.steps['process-payment']?.status).toBe('success');
    expect(result.steps['send-receipt']?.status).toBe('success');
  });

  it('メールに @ が無いと決済の Step で失敗し、課金しない', async () => {
    const before = paymentGateway.charges.size;
    const run = await paymentWorkflow.createRun();
    const result = await run.start({
      inputData: { email: 'no-at-mark', amount: 5000 },
    });
    expect(result.status).toBe('failed');
    expect(result.steps['validate-input']?.status).toBe('success');
    expect(result.steps['process-payment']?.status).toBe('failed');
    expect(paymentGateway.charges.size).toBe(before);
  });

  it('src/index.ts を実行すると領収書の ID を表示する', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../src/index');
    expect(log).toHaveBeenCalledWith('Receipt:', expect.stringMatching(/^rcpt_/));
    log.mockRestore();
  });
});

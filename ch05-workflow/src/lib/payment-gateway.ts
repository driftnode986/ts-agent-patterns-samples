// src/lib/payment-gateway.ts
// 本章の決済サービスの代わり。メモリ上で動き、外部へは通信しない
export const paymentGateway = {
  charges: new Map<string, number>(),
  refunded: [] as string[],

  async charge(amount: number): Promise<string> {
    const paymentId = `pay_${this.charges.size + 1}`;
    this.charges.set(paymentId, amount);
    return paymentId;
  },

  async refund(paymentId: string): Promise<void> {
    if (!this.charges.has(paymentId)) {
      throw new Error(`決済 ${paymentId} が見つかりません`);
    }
    this.refunded.push(paymentId);
  },
};

// src/lib/inventory.ts
// 在庫サービスの代わり。在庫が 0 のとき引き当てに失敗する
export const inventory = {
  stock: 10,

  async reserve(orderId: string): Promise<void> {
    if (this.stock <= 0) {
      throw new Error(`注文 ${orderId}: 在庫がありません`);
    }
    this.stock -= 1;
  },
};

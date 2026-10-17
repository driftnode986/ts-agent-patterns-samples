// src/lib/external-api.ts
// 外部 API の代わり。テストでは一時的な失敗を差し込む
export const externalApi = {
  async get(url: string): Promise<{ status: number; url: string }> {
    return { status: 200, url };
  },
};

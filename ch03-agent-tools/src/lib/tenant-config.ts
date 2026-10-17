// テナントごとの設定。サーバー側の DB や設定ファイルから読み込む想定
export type TenantConfig = {
  tenantId: string;
  companyName: string;
  supportTier: 'basic' | 'premium';
  knowledgeBase: string[];
};

// #region define
// src/mastra/tools/customer.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '../../lib/db';

export const getCustomerTool = createTool({
  id: 'get-customer',
  description:
    '顧客 ID を指定して、顧客の基本情報 ' +
    '(名前・メールアドレス・プラン) を取得します',
  inputSchema: z.object({
    customerId: z.string().describe('顧客の一意識別子 (UUID 形式)'),
  }),
  outputSchema: z.object({
    name: z.string(),
    email: z.string(),
    plan: z.enum(['free', 'pro', 'enterprise']),
  }),
  // #endregion
  // #region execute
  execute: async (inputData) => {
    const customer = await db.customers.findUnique({
      where: { id: inputData.customerId },
    });
    if (!customer) {
      throw new Error(`顧客 ID ${inputData.customerId} は存在しません`);
    }
    return {
      name: customer.name,
      email: customer.email,
      plan: customer.plan,
    };
  },
});
// #endregion

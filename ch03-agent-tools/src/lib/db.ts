// #region setup
// src/lib/db.ts
// 顧客データベースの代わり。LibSQL のメモリ上の DB に顧客を2件入れておく
import { createClient } from '@libsql/client';

const client = createClient({ url: ':memory:' });

await client.batch([
  `CREATE TABLE customers (
     id TEXT PRIMARY KEY, name TEXT, email TEXT, plan TEXT)`,
  `INSERT INTO customers VALUES
     ('test-uuid-123', '山田 太郎', 'taro@example.com', 'pro'),
     ('test-uuid-456', '佐藤 花子', 'hanako@example.com', 'free')`,
]);

// #endregion

// #region db
type Customer = {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
};

export const db = {
  customers: {
    async findUnique(args: { where: { id: string } }) {
      const result = await client.execute({
        sql: 'SELECT * FROM customers WHERE id = ?',
        args: [args.where.id],
      });
      const row = result.rows[0];
      return row ? (row as unknown as Customer) : null;
    },
  },
  execute: (sql: string) => client.execute(sql),
};
// #endregion

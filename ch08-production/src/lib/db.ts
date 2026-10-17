// src/lib/db.ts
import pg from 'pg';

// pgvector 拡張を入れた PostgreSQL に接続する
export const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

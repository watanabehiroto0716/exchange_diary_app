import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts', // スキーマファイルの場所（プロジェクトに合わせて確認してください）
  out: './drizzle',
  dialect: 'sqlite',        // ★ここを 'mysql' から 'sqlite' に書き換える
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./db.sqlite', // .envのURLを使う
  },
});
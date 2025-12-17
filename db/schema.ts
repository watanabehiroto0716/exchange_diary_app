// db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const diaries = sqliteTable('diaries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  author: text('author').notNull(),
  // 日付のデフォルト値をSQL関数に任せることで、より確実に動作させます
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// もし 'users' テーブルを今後作るなら、予約語を避けてこのように定義します
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});
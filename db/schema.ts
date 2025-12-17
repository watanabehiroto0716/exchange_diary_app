// db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const diaries = sqliteTable('diaries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  author: text('author').notNull(),
  createdAt: text('created_at').default(new Date().toISOString()),
});
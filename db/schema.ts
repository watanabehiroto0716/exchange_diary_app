import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- Users Table ---
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  openId: text('open_id').unique(),
  email: text('email').unique(),
  name: text('name'),
  loginMethod: text('login_method'), // 'google', 'apple', 'password'
  passwordHash: text('password_hash'),
  role: text('role').default('user'),
  lastSignedIn: integer('last_signed_in', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// --- Groups Table ---
export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  inviteCode: text('invite_code').unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// --- Group Members Table ---
export const groupMembers = sqliteTable('group_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id').notNull().references(() => groups.id),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').default('member'), // 'admin', 'member'
});

// --- Diary Entries Table ---
export const diaryEntries = sqliteTable('diary_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id').notNull().references(() => groups.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Types for insertion
export type InsertUser = typeof users.$inferInsert;
export type InsertGroup = typeof groups.$inferInsert;
export type InsertGroupMember = typeof groupMembers.$inferInsert;
export type InsertDiaryEntry = typeof diaryEntries.$inferInsert;
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../db/schema";
import { users, groups, groupMembers, diaryEntries, type InsertUser, type InsertGroup, type InsertGroupMember, type InsertDiaryEntry } from "../db/schema";

// データベースクライアントの作成
const client = createClient({
  url: process.env.DATABASE_URL || "file:./db.sqlite",
});

export const db = drizzle(client, { schema });

// ========== Users (Auth) ==========

export async function getUserByOpenId(openId: string) {
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * ユーザーの作成または更新 (OAuth用)
 * SQLiteにはMySQLのonDuplicateKeyUpdateがないため、存在確認してから処理します
 */
export async function upsertUser(data: InsertUser) {
  if (!data.openId && !data.email) return null;

  const existing = data.openId 
    ? await getUserByOpenId(data.openId)
    : await getUserByEmail(data.email!);

  if (existing) {
    await db.update(users).set(data).where(eq(users.id, existing.id));
    return await getUserById(existing.id);
  } else {
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }
}

// ========== Groups ==========

export async function createGroup(data: InsertGroup) {
  const result = await db.insert(groups).values(data).returning();
  return result[0].id;
}

export async function getGroupsByUserId(userId: number) {
  return await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId));
}

export async function getGroupById(groupId: number) {
  const result = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateGroup(groupId: number, data: Partial<InsertGroup>) {
  await db.update(groups).set(data).where(eq(groups.id, groupId));
}

export async function deleteGroup(groupId: number) {
  await db.delete(groups).where(eq(groups.id, groupId));
}

// ========== Group Members ==========

export async function addGroupMember(data: InsertGroupMember) {
  await db.insert(groupMembers).values(data);
  return 0;
}

export async function getGroupMembers(groupId: number) {
  return await db
    .select({
      id: users.id,
      name: users.name,
      role: groupMembers.role,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId));
}

export async function removeGroupMember(groupId: number, userId: number) {
  await db.delete(groupMembers).where(
    and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
  );
}

// ========== Diary Entries ==========

export async function createDiaryEntry(data: InsertDiaryEntry) {
  await db.insert(diaryEntries).values(data);
  return 0;
}

export async function getDiaryEntriesByGroupId(groupId: number) {
  return await db
    .select({
      id: diaryEntries.id,
      content: diaryEntries.content,
      createdAt: diaryEntries.createdAt,
      userName: users.name,
    })
    .from(diaryEntries)
    .innerJoin(users, eq(diaryEntries.userId, users.id))
    .where(eq(diaryEntries.groupId, groupId));
}

export async function getDiaryEntryById(entryId: number) {
  const result = await db
    .select()
    .from(diaryEntries)
    .where(eq(diaryEntries.id, entryId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDiaryEntry(entryId: number, data: Partial<InsertDiaryEntry>) {
  await db.update(diaryEntries).set(data).where(eq(diaryEntries.id, entryId));
}

export async function deleteDiaryEntry(entryId: number) {
  await db.delete(diaryEntries).where(eq(diaryEntries.id, entryId));
}

// server/db.ts または routes のあるファイルに追加
app.get("/app-auth", (req, res) => {
  // 簡易的なログイン画面を返す、あるいは即座にリダイレクトさせる
  res.send("<h1>Login Page</h1><p>現在、簡易モードで動作中です。</p>");
});
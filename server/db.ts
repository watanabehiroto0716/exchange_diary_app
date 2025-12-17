import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../db/schema";
import { diaries, users } from "../db/schema";

// データベースクライアントの作成
const client = createClient({
  url: process.env.DATABASE_URL || "file:./db.sqlite",
});

export const db = drizzle(client, { schema });

// ========== Users ==========
export async function getUserById(userId: number) {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== Diaries (交換日記) ==========
export async function createDiaryEntry(data: typeof diaries.$inferInsert) {
  return await db.insert(diaries).values(data);
}

export async function getDiaries() {
  return await db.select().from(diaries).orderBy(diaries.id);
}

export async function getDiaryById(id: number) {
  const result = await db.select().from(diaries).where(eq(diaries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDiaryEntry(id: number, data: Partial<typeof diaries.$inferInsert>) {
  await db.update(diaries).set(data).where(eq(diaries.id, id));
}

export async function deleteDiaryEntry(id: number) {
  await db.delete(diaries).where(eq(diaries.id, id));
}
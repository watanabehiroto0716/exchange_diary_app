import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, groups, groupMembers, diaryEntries, InsertGroup, InsertGroupMember, InsertDiaryEntry } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * ユーザーをupsert（Manus OAuth用）
 */
export async function upsertUser(user: InsertUser) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return null;
  }

  try {
    const values: InsertUser = {};
    const updateSet: Record<string, unknown> = {};

    // openIdベースのupsert
    if (user.openId) {
      values.openId = user.openId;
    }

    // emailベースのupsert（複数認証対応）
    if (user.email) {
      values.email = user.email;
    }

    const textFields = ["name", "loginMethod", "passwordHash", "googleId", "appleId"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // 作成/更新されたユーザーを取得
    if (user.openId) {
      return getUserByOpenId(user.openId);
    } else if (user.email) {
      return getUserByEmail(user.email);
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * メールアドレスでユーザーを取得
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * ユーザーIDでユーザーを取得
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== Groups ==========
export async function createGroup(data: InsertGroup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(groups).values(data);
  // Return the created group - in real app, you'd query it back
  return 0;
}

export async function getGroupsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId));
}

export async function getGroupById(groupId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateGroup(groupId: number, data: Partial<InsertGroup>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(groups).set(data).where(eq(groups.id, groupId));
}

export async function deleteGroup(groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(groups).where(eq(groups.id, groupId));
}

// ========== Group Members ==========
export async function addGroupMember(data: InsertGroupMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(groupMembers).values(data);
  return 0;
}

export async function getGroupMembers(groupId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId));
}

export async function removeGroupMember(groupId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(groupMembers).where(
    eq(groupMembers.groupId, groupId) && eq(groupMembers.userId, userId)
  );
}

// ========== Diary Entries ==========
export async function createDiaryEntry(data: InsertDiaryEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(diaryEntries).values(data);
  return 0;
}

export async function getDiaryEntriesByGroupId(groupId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(diaryEntries)
    .innerJoin(users, eq(diaryEntries.userId, users.id))
    .where(eq(diaryEntries.groupId, groupId));
}

export async function getDiaryEntryById(entryId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(diaryEntries)
    .innerJoin(users, eq(diaryEntries.userId, users.id))
    .where(eq(diaryEntries.id, entryId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDiaryEntry(entryId: number, data: Partial<InsertDiaryEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(diaryEntries).set(data).where(eq(diaryEntries.id, entryId));
}

export async function deleteDiaryEntry(entryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(diaryEntries).where(eq(diaryEntries.id, entryId));
}

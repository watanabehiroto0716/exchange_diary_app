import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { db } from "../_core/index"; // 前回修正したdb定義がここにあるはずです
import { diaryEntries } from "../../db/schema";
import { desc, eq } from "drizzle-orm";

export const diaryRouter = router({
  // 日記一覧を取得する (新しい順)
  getEntries: publicProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(diaryEntries)
        .where(eq(diaryEntries.groupId, input.groupId))
        .orderBy(desc(diaryEntries.id)); // IDが大きい（新しい）順
    }),

  // 日記を投稿する
  postEntry: publicProcedure
    .input(z.object({
      groupId: z.number(),
      userId: z.number(),
      content: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(diaryEntries).values({
        groupId: input.groupId,
        userId: input.userId,
        content: input.content,
      }).returning();
      
      return result[0];
    }),
});
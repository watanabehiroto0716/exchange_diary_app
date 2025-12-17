import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Groups API
  groups: router({
    // グループ一覧取得
    list: protectedProcedure.query(({ ctx }) => {
      return db.getGroupsByUserId(ctx.user.id);
    }),

    // グループ作成
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const groupId = await db.createGroup({
          name: input.name,
          description: input.description,
          ownerId: ctx.user.id,
        });
        // オーナーをメンバーに追加
        await db.addGroupMember({
          groupId: groupId || 0,
          userId: ctx.user.id,
          role: "admin",
        });
        return { success: true, groupId };
      }),

    // グループ詳細取得
    getById: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .query(({ input }) => {
        return db.getGroupById(input.groupId);
      }),

    // グループ更新
    update: protectedProcedure
      .input(z.object({
        groupId: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => {
        return db.updateGroup(input.groupId, {
          name: input.name,
          description: input.description,
        });
      }),

    // グループ削除
    delete: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .mutation(({ input }) => {
        return db.deleteGroup(input.groupId);
      }),

    // グループメンバー一覧
    getMembers: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .query(({ input }) => {
        return db.getGroupMembers(input.groupId);
      }),

    // メンバー追加
    addMember: protectedProcedure
      .input(z.object({
        groupId: z.number(),
        userId: z.number(),
        role: z.enum(["member", "admin"]).optional(),
      }))
      .mutation(({ input }) => {
        return db.addGroupMember({
          groupId: input.groupId,
          userId: input.userId,
          role: input.role || "member",
        });
      }),

    // メンバー削除
    removeMember: protectedProcedure
      .input(z.object({
        groupId: z.number(),
        userId: z.number(),
      }))
      .mutation(({ input }) => {
        return db.removeGroupMember(input.groupId, input.userId);
      }),
  }),

  // Diary Entries API
  diaries: router({
    // グループ内の日記一覧
    listByGroup: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .query(({ input }) => {
        return db.getDiaryEntriesByGroupId(input.groupId);
      }),

    // 日記投稿
    create: protectedProcedure
      .input(z.object({
        groupId: z.number(),
        title: z.string().optional(),
        content: z.string().min(1),
        imageUrl: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => {
        return db.createDiaryEntry({
          groupId: input.groupId,
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          imageUrl: input.imageUrl,
        });
      }),

    // 日記詳細取得
    getById: protectedProcedure
      .input(z.object({ entryId: z.number() }))
      .query(({ input }) => {
        return db.getDiaryEntryById(input.entryId);
      }),

    // 日記更新
    update: protectedProcedure
      .input(z.object({
        entryId: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(({ input }) => {
        return db.updateDiaryEntry(input.entryId, {
          title: input.title,
          content: input.content,
          imageUrl: input.imageUrl,
        });
      }),

    // 日記削除
    delete: protectedProcedure
      .input(z.object({ entryId: z.number() }))
      .mutation(({ input }) => {
        return db.deleteDiaryEntry(input.entryId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

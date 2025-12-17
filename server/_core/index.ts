import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { z } from "zod"; // 追加
import { desc, eq } from "drizzle-orm"; // 追加

import { registerOAuthRoutes } from "./oauth"; 
import { createContext } from "./context";     
import { router, publicProcedure } from "./trpc"; // trpcの定義をインポート
import { db } from "./index"; // 自分自身のdb定義（またはdb.tsから）
import { diaryEntries } from "../../db/schema"; // スキーマから日記テーブルをインポート

// --- [tRPC Router の定義] ---
// ここで日記の投稿・取得機能を定義します
const diaryRouter = router({
  // 日記一覧を取得する
  getEntries: publicProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(diaryEntries)
        .where(eq(diaryEntries.groupId, input.groupId))
        .orderBy(desc(diaryEntries.id)); 
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

// メインのルーターに統合
export const appRouter = router({
  diary: diaryRouter,
  // 他に既存のルートがあればここに追加
});

export type AppRouter = typeof appRouter;

// --- [サーバー起動処理 (以前のまま)] ---

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function registerAuthPages(app: express.Express) {
  app.get("/app-auth", (req, res) => {
    const { state } = req.query;
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5;">
          <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
            <h2>交換日記アプリ</h2>
            <button onclick="login()" style="padding: 12px 24px; background: #007AFF; color: white; border: none; border-radius: 8px; font-weight: bold;">
              ログインしてアプリに戻る
            </button>
          </div>
          <script>
            function login() {
              const callbackUrl = "/api/oauth/mobile?code=dummy_code&state=${state}";
              window.location.href = callbackUrl;
            }
          </script>
        </body>
      </html>
    `);
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);
  registerAuthPages(app); 

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const port = await findAvailablePort(parseInt(process.env.PORT || "3000"));
  server.listen(port, () => {
    console.log("[api] server listening on port " + port);
  });
}

startServer().catch(console.error);
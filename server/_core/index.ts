import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";

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

// ログイン画面のルートを登録する関数
function registerAuthPages(app: express.Express) {
  app.get("/app-auth", (req, res) => {
    const { redirectUri, state } = req.query;

    res.send(`
      <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5;">
          <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
            <h2 style="color: #1c1e21;">交換日記アプリ</h2>
            <p style="color: #606770;">テスト用ログインとして実行します</p>
            <button onclick="login()" style="padding: 12px 24px; font-size: 16px; background: #007AFF; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
              ログインしてアプリに戻る
            </button>
          </div>
          <script>
            function login() {
              // サーバー内のモバイル用エンドポイントへリダイレクト
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
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ルートの登録
  registerOAuthRoutes(app);
  registerAuthPages(app); // ★ここでログインページを登録

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
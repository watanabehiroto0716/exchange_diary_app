import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Express, Request, Response } from "express";
import { getUserByEmail, upsertUser, getUserById } from "../db";
import { getSessionCookieOptions } from "./cookies";

// JWT秘密鍵（環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = "7d";

// トークンペイロード型
export interface TokenPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

/**
 * パスワードをハッシュ化
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * パスワードを検証
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * JWTトークンを生成
 */
export function generateToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * JWTトークンを検証
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * メール/パスワードでユーザー登録
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<{ user: any; token: string }> {
  // メールが既に存在するか確認
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // パスワードをハッシュ化
  const passwordHash = await hashPassword(password);

  // ユーザーを作成
  const user = await upsertUser({
    email,
    name: name || null,
    passwordHash,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });

  if (!user) {
    throw new Error("Failed to create user");
  }

  // トークンを生成
  const token = generateToken(user.id, user.email || email);

  return { user, token };
}

/**
 * メール/パスワードでログイン
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ user: any; token: string }> {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.passwordHash) {
    throw new Error("This account was not registered with email/password");
  }

  // パスワードを検証
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid password");
  }

  // 最終ログイン時刻を更新
  await upsertUser({
    email,
    lastSignedIn: new Date(),
  });

  // トークンを生成
  const token = generateToken(user.id, user.email || email);

  return { user, token };
}

/**
 * Google Sign-Inでログイン/登録
 */
export async function loginWithGoogle(
  googleId: string,
  email: string,
  name?: string
): Promise<{ user: any; token: string }> {
  let user = await getUserByEmail(email);

  if (!user) {
    // 新規ユーザーを作成
    const newUser = await upsertUser({
      email,
      name: name || null,
      googleId,
      loginMethod: "google",
      lastSignedIn: new Date(),
    });
    if (newUser) user = newUser;
  } else {
    // 既存ユーザーを更新
    if (!user.googleId) {
      // Google IDをリンク
      await upsertUser({
        email,
        googleId,
      });
    }
    // 最終ログイン時刻を更新
    await upsertUser({
      email,
      lastSignedIn: new Date(),
    });
  }

  if (!user) {
    throw new Error("Failed to create/update user");
  }

  // トークンを生成
  const token = generateToken(user.id, user.email || email);

  return { user, token };
}

/**
 * Apple Sign-Inでログイン/登録
 */
export async function loginWithApple(
  appleId: string,
  email: string,
  name?: string
): Promise<{ user: any; token: string }> {
  let user = await getUserByEmail(email);

  if (!user) {
    // 新規ユーザーを作成
    const newUser = await upsertUser({
      email,
      name: name || null,
      appleId,
      loginMethod: "apple",
      lastSignedIn: new Date(),
    });
    if (newUser) user = newUser;
  } else {
    // 既存ユーザーを更新
    if (!user.appleId) {
      // Apple IDをリンク
      await upsertUser({
        email,
        appleId,
      });
    }
    // 最終ログイン時刻を更新
    await upsertUser({
      email,
      lastSignedIn: new Date(),
    });
  }

  if (!user) {
    throw new Error("Failed to create/update user");
  }

  // トークンを生成
  const token = generateToken(user.id, user.email || email);

  return { user, token };
}

/**
 * Express ミドルウェア：トークンからユーザー情報を取得
 */
export async function authMiddleware(
  req: any,
  res: Response,
  next: () => void
) {
  try {
    // クッキーまたはAuthorizationヘッダーからトークンを取得
    const token =
      req.cookies.authToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // ユーザー情報を取得
    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // リクエストにユーザー情報を追加
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

/**
 * 認証ルートを設定
 */
export function setupAuthRoutes(app: Express) {
  // ユーザー登録（メール/パスワード）
  app.post("/api/auth/register", async (req: any, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const { user, token } = await registerUser(email, password, name);

      res.cookie("authToken", token, getSessionCookieOptions(req));
      res.json({ user, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ログイン（メール/パスワード）
  app.post("/api/auth/login", async (req: any, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const { user, token } = await loginWithEmail(email, password);

      res.cookie("authToken", token, getSessionCookieOptions(req));
      res.json({ user, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Google Sign-In コールバック
  app.post("/api/auth/google", async (req: any, res: Response) => {
    try {
      const { googleId, email, name } = req.body;

      if (!googleId || !email) {
        return res.status(400).json({ error: "Google ID and email required" });
      }

      const { user, token } = await loginWithGoogle(googleId, email, name);

      res.cookie("authToken", token, getSessionCookieOptions(req));
      res.json({ user, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Apple Sign-In コールバック
  app.post("/api/auth/apple", async (req: any, res: Response) => {
    try {
      const { appleId, email, name } = req.body;

      if (!appleId || !email) {
        return res.status(400).json({ error: "Apple ID and email required" });
      }

      const { user, token } = await loginWithApple(appleId, email, name);

      res.cookie("authToken", token, getSessionCookieOptions(req));
      res.json({ user, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ログアウト
  app.post("/api/auth/logout", (req: any, res: Response) => {
    res.clearCookie("authToken");
    res.json({ message: "Logged out" });
  });

  // 現在のユーザー情報を取得
  app.get("/api/auth/me", authMiddleware, (req: any, res: Response) => {
    res.json({ user: (req as any).user });
  });
}

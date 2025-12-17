# 交換日記アプリ - ソースコード構成

## プロジェクト概要

複数人で日記を共有できるスマートフォンアプリケーション。React Native + Expo、Node.js + Express、MySQL + Drizzle ORMを使用した フルスタック開発。

---

## ディレクトリ構造

```
exchange_diary_app/
├── app/                          # フロントエンド（React Native/Expo）
│   ├── (tabs)/                   # タブナビゲーション
│   │   ├── _layout.tsx          # タブレイアウト設定
│   │   └── index.tsx            # ホーム画面（グループ一覧）
│   ├── create-group.tsx         # グループ作成画面
│   ├── group-detail.tsx         # グループ詳細画面（日記タイムライン）
│   ├── create-diary.tsx         # 日記投稿画面
│   ├── diary-detail.tsx         # 日記詳細画面
│   ├── profile.tsx              # プロフィール画面
│   ├── oauth/
│   │   └── callback.tsx         # OAuth認証コールバック
│   ├── _layout.tsx              # ルートレイアウト
│   └── modal.tsx                # モーダル画面
│
├── components/                   # 再利用可能なコンポーネント
│   ├── themed-text.tsx          # テーマ対応テキスト
│   ├── themed-view.tsx          # テーマ対応ビュー
│   ├── parallax-scroll-view.tsx # パララックススクロール
│   ├── hello-wave.tsx           # ウェーブアニメーション
│   ├── haptic-tab.tsx           # ハプティックフィードバック
│   ├── external-link.tsx        # 外部リンク
│   └── ui/
│       ├── icon-symbol.tsx      # アイコン管理
│       ├── icon-symbol.ios.tsx  # iOS用アイコン
│       └── collapsible.tsx      # 折りたたみコンポーネント
│
├── constants/                    # 定数・設定
│   ├── theme.ts                 # カラーテーマ定義
│   ├── oauth.ts                 # OAuth設定
│   └── const.ts                 # その他定数
│
├── hooks/                        # カスタムフック
│   ├── use-auth.ts              # 認証状態管理
│   ├── use-theme-color.ts       # テーマカラー
│   └── use-color-scheme.ts      # カラースキーム
│
├── lib/                          # ユーティリティ・ライブラリ
│   ├── trpc.ts                  # tRPCクライアント設定
│   ├── auth.ts                  # 認証ロジック
│   ├── api.ts                   # API通信
│   └── manus-runtime.ts         # Manus実行時設定
│
├── server/                       # バックエンド（Node.js/Express）
│   ├── routers.ts               # tRPCルーター定義
│   │   ├── groups router        # グループAPI
│   │   └── diaries router       # 日記API
│   ├── db.ts                    # データベースクエリ関数
│   │   ├── createGroup()
│   │   ├── getGroupsByUserId()
│   │   ├── createDiaryEntry()
│   │   ├── getDiaryEntriesByGroupId()
│   │   └── その他CRUD操作
│   ├── _core/
│   │   ├── trpc.ts              # tRPC設定
│   │   ├── context.ts           # リクエストコンテキスト
│   │   ├── oauth.ts             # OAuth認証処理
│   │   ├── cookies.ts           # クッキー管理
│   │   ├── env.ts               # 環境変数
│   │   ├── index.ts             # サーバー起動
│   │   ├── llm.ts               # LLM統合
│   │   ├── notification.ts      # 通知機能
│   │   ├── imageGeneration.ts   # 画像生成
│   │   ├── voiceTranscription.ts # 音声認識
│   │   ├── dataApi.ts           # データAPI
│   │   ├── systemRouter.ts      # システムルーター
│   │   └── types/
│   │       ├── manusTypes.ts    # Manus型定義
│   │       └── cookie.d.ts      # クッキー型定義
│   └── storage.ts               # ストレージ処理
│
├── drizzle/                      # データベーススキーマ
│   ├── schema.ts                # テーブル定義
│   │   ├── users テーブル
│   │   ├── groups テーブル
│   │   ├── groupMembers テーブル
│   │   └── diaryEntries テーブル
│   ├── relations.ts             # テーブル関連定義
│   ├── 0001_lowly_shotgun.sql   # マイグレーション
│   └── meta/                    # メタデータ
│
├── shared/                       # 共有コード
│   ├── types.ts                 # 共有型定義
│   ├── const.ts                 # 共有定数
│   └── _core/
│       └── errors.ts            # エラー定義
│
├── tests/                        # テストファイル
│   └── auth.logout.test.ts      # 認証テスト
│
├── assets/                       # 静的アセット
│   └── images/
│       ├── icon.png             # アプリアイコン
│       ├── splash-icon.png      # スプラッシュ画面
│       ├── favicon.png          # ファビコン
│       └── android-icon-*.png   # Android用アイコン
│
├── app.config.ts                # Expo設定
├── drizzle.config.ts            # Drizzle ORM設定
├── tsconfig.json                # TypeScript設定
├── package.json                 # 依存関係定義
├── design.md                    # UI/UX設計書
├── todo.md                      # プロジェクトTODO
└── README.md                    # プロジェクト説明
```

---

## 主要ファイル解説

### フロントエンド（app/）

#### ホーム画面 (`app/(tabs)/index.tsx`)
- グループ一覧表示
- グループ作成ボタン
- プロフィールアクセス
- tRPCでグループデータ取得

#### グループ作成画面 (`app/create-group.tsx`)
- グループ名・説明入力
- バリデーション
- tRPCで作成API呼び出し

#### グループ詳細画面 (`app/group-detail.tsx`)
- グループ情報表示
- 日記タイムライン表示
- 日記投稿ボタン（FAB）
- 日記一覧取得

#### 日記投稿画面 (`app/create-diary.tsx`)
- タイトル・内容入力
- 日記作成API呼び出し

#### 日記詳細画面 (`app/diary-detail.tsx`)
- 日記全文表示
- 投稿者情報表示
- 投稿日時表示

#### プロフィール画面 (`app/profile.tsx`)
- ユーザー情報表示
- ログアウト機能

### バックエンド（server/）

#### ルーター定義 (`server/routers.ts`)

**Groups API:**
- `groups.list` - ユーザーのグループ一覧取得
- `groups.create` - グループ作成
- `groups.getById` - グループ詳細取得
- `groups.update` - グループ更新
- `groups.delete` - グループ削除
- `groups.getMembers` - メンバー一覧取得
- `groups.addMember` - メンバー追加
- `groups.removeMember` - メンバー削除

**Diaries API:**
- `diaries.listByGroup` - グループ内の日記一覧
- `diaries.create` - 日記投稿
- `diaries.getById` - 日記詳細取得
- `diaries.update` - 日記更新
- `diaries.delete` - 日記削除

#### データベースクエリ (`server/db.ts`)
- `createGroup()` - グループ作成
- `getGroupsByUserId()` - ユーザーのグループ取得
- `getGroupById()` - グループ詳細取得
- `updateGroup()` - グループ更新
- `deleteGroup()` - グループ削除
- `addGroupMember()` - メンバー追加
- `getGroupMembers()` - メンバー一覧取得
- `removeGroupMember()` - メンバー削除
- `createDiaryEntry()` - 日記作成
- `getDiaryEntriesByGroupId()` - グループの日記取得
- `getDiaryEntryById()` - 日記詳細取得
- `updateDiaryEntry()` - 日記更新
- `deleteDiaryEntry()` - 日記削除

### データベーススキーマ (`drizzle/schema.ts`)

**users テーブル**
- id (PK)
- openId (Manus OAuth ID)
- name
- email
- loginMethod
- role (user/admin)
- createdAt, updatedAt, lastSignedIn

**groups テーブル**
- id (PK)
- name
- description
- ownerId (FK: users.id)
- createdAt, updatedAt

**groupMembers テーブル**
- id (PK)
- groupId (FK: groups.id)
- userId (FK: users.id)
- role (member/admin)
- joinedAt

**diaryEntries テーブル**
- id (PK)
- groupId (FK: groups.id)
- userId (FK: users.id)
- title
- content
- imageUrl
- createdAt, updatedAt

---

## 認証フロー

1. **ログイン画面** → ユーザーが「ログイン」ボタンをタップ
2. **OAuth認証** → WebBrowserでManus OAuthを開く
3. **コールバック** → OAuth成功後、`app/oauth/callback.tsx`へリダイレクト
4. **トークン保存** → SecureStore（モバイル）またはクッキー（Web）に保存
5. **ホーム画面** → 認証済みユーザーとしてアクセス

---

## API通信フロー

1. **フロントエンド** → tRPCクライアント (`lib/trpc.ts`) でAPI呼び出し
2. **バックエンド** → tRPCルーター (`server/routers.ts`) で処理
3. **データベース** → Drizzle ORM (`server/db.ts`) でクエリ実行
4. **レスポンス** → JSON形式でフロントエンドに返却

---

## 技術スタック

| 層 | 技術 |
|---|---|
| **フロントエンド** | React Native 0.81, Expo SDK 54, TypeScript 5.9 |
| **バックエンド** | Node.js, Express, tRPC |
| **データベース** | MySQL, Drizzle ORM |
| **認証** | Manus OAuth, JWT |
| **API通信** | tRPC, Zod検証 |
| **UI/UX** | React Native Reanimated, Safe Area Context |
| **ビルド** | Metro, Expo Router |

---

## セットアップ手順

### 必須環境
- Node.js 22.13.0以上
- pnpm 9.0.0以上
- MySQL 8.0以上

### インストール
```bash
cd exchange_diary_app
pnpm install
```

### データベース初期化
```bash
pnpm db:push
```

### 開発サーバー起動
```bash
pnpm dev
```

### ビルド
```bash
pnpm build
```

---

## 主要な実装ポイント

### 1. 型安全なAPI通信
- tRPCで型定義を共有
- Zodスキーマでバリデーション
- 自動型推論

### 2. 認証管理
- `useAuth()` フックで認証状態管理
- protectedProcedureで認証必須エンドポイント
- 自動トークン更新

### 3. データベース設計
- 正規化されたスキーマ
- 外部キー制約
- タイムスタンプ自動管理

### 4. UI/UX
- iOS HIG準拠
- ダークモード対応
- レスポンシブデザイン
- アニメーション対応

---

## 拡張ポイント

### 短期（すぐに実装可能）
- [ ] 日記編集・削除機能
- [ ] 画像アップロード
- [ ] コメント機能
- [ ] いいね機能

### 中期（1-2週間）
- [ ] メンバー招待（メール）
- [ ] プッシュ通知
- [ ] 検索機能
- [ ] フィルタリング

### 長期（1ヶ月以上）
- [ ] リアルタイム同期（WebSocket）
- [ ] オフラインモード
- [ ] バックアップ機能
- [ ] 分析ダッシュボード

---

## トラブルシューティング

### ビルドエラー
```bash
pnpm clean
pnpm install
pnpm db:push
```

### 認証エラー
- 環境変数確認
- クッキー設定確認
- ブラウザキャッシュクリア

### データベース接続エラー
- MySQL接続確認
- DATABASE_URL確認
- ファイアウォール設定確認

---

## ライセンス

MIT License

---

## サポート

問題が発生した場合は、以下をご確認ください：
1. `server/README.md` - バックエンド詳細ドキュメント
2. `design.md` - UI/UX設計書
3. `todo.md` - 実装状況

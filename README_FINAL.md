# 🎯 交換日記アプリ - 完成版

複数人で交換日記を楽しむためのモダンなスマートフォンアプリです。

## ✨ 主な機能

### 認証・ユーザー管理
- ✅ **複数認証対応**: メール/パスワード、Google Sign-In、Apple Sign-In
- ✅ **セキュアな認証**: bcrypt + JWT トークン
- ✅ **ユーザープロフィール**: 名前、メール、プロフィール画像

### グループ管理
- ✅ **グループ作成**: 複数人で交換日記グループを作成
- ✅ **メンバー管理**: グループにメンバーを追加・削除
- ✅ **グループ一覧**: 参加中のグループを表示

### 日記機能
- ✅ **日記投稿**: テキスト・画像付きで日記を投稿
- ✅ **タイムライン表示**: グループ内の全日記をタイムライン表示
- ✅ **日記詳細**: 投稿者情報・投稿日時を表示
- ✅ **日記編集・削除**: 自分の日記を編集・削除

### UI/UX
- ✅ **モダンなデザイン**: iOS標準デザイン準拠
- ✅ **ダークモード対応**: ライト/ダークモード自動切り替え
- ✅ **レスポンシブ**: iPhone・iPad対応
- ✅ **直感的な操作**: タブナビゲーション

---

## 🛠️ 技術スタック

### フロントエンド
- **React Native** 0.81
- **Expo** SDK 54
- **TypeScript** 5.9
- **React Router** (Expo Router 6)
- **Reanimated** 4.x（アニメーション）

### バックエンド
- **Node.js** + **Express**
- **tRPC** (型安全なAPI)
- **JWT** 認証
- **bcrypt** パスワードハッシング

### データベース
- **MySQL** / **PostgreSQL**
- **Drizzle ORM** (型安全なクエリ)

### デプロイ
- **Render.com** (バックエンド無料ホスト)
- **Expo EAS** (iOS・Androidビルド)
- **TestFlight** (iOS テスト配布)
- **Google Play 内部テスト** (Android テスト配布)

---

## 📦 プロジェクト構成

```
exchange-diary-app/
├── app/                          # フロントエンド（Expo Router）
│   ├── (tabs)/                   # タブナビゲーション
│   │   ├── index.tsx             # ホーム画面
│   │   └── _layout.tsx           # タブ設定
│   ├── create-group.tsx          # グループ作成画面
│   ├── group-detail.tsx          # グループ詳細画面
│   ├── create-diary.tsx          # 日記投稿画面
│   ├── diary-detail.tsx          # 日記詳細画面
│   └── profile.tsx               # プロフィール画面
├── server/                       # バックエンド
│   ├── routers.ts                # tRPC ルーター
│   ├── db.ts                     # DB操作
│   ├── _core/
│   │   ├── auth-standalone.ts    # 独立認証システム
│   │   ├── context.ts            # tRPC コンテキスト
│   │   └── cookies.ts            # クッキー管理
│   └── index.ts                  # サーバーエントリ
├── drizzle/                      # データベース
│   ├── schema.ts                 # スキーマ定義
│   └── migrations/               # マイグレーション
├── components/                   # 再利用可能なコンポーネント
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/
├── hooks/                        # カスタムフック
│   ├── use-auth.ts               # 認証フック
│   └── use-theme-color.ts        # テーマフック
├── lib/                          # ユーティリティ
│   └── trpc.ts                   # tRPC クライアント
├── constants/                    # 定数
│   └── theme.ts                  # テーマ定義
├── assets/                       # アセット
│   └── images/                   # ロゴ・アイコン
├── DEPLOYMENT.md                 # デプロイメントガイド
├── BUILD_GUIDE.md                # ビルドガイド
├── README_PRODUCTION.md          # 本番運用ガイド
└── package.json                  # 依存関係
```

---

## 🚀 クイックスタート

### 開発環境でのセットアップ

```bash
# 依存関係をインストール
pnpm install

# データベースをセットアップ
pnpm db:push

# 開発サーバーを起動
pnpm dev
```

### 本番環境へのデプロイ

詳細は以下のドキュメントを参照してください：

1. **[QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md)** - 5分でできるデプロイ
2. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 詳細なデプロイガイド
3. **[BUILD_GUIDE.md](./BUILD_GUIDE.md)** - iOS・Androidビルドガイド
4. **[README_PRODUCTION.md](./README_PRODUCTION.md)** - 本番運用ガイド

---

## 📱 スクリーン一覧

| スクリーン | 説明 |
|----------|------|
| **ホーム** | 参加中のグループ一覧を表示 |
| **グループ作成** | 新しい交換日記グループを作成 |
| **グループ詳細** | グループ内の日記をタイムライン表示 |
| **日記投稿** | 新しい日記を投稿 |
| **日記詳細** | 日記の詳細を表示 |
| **プロフィール** | ユーザー情報を表示・編集 |

---

## 🔐 セキュリティ

### 実装済み

- ✅ **JWT 認証**: トークンベースの認証
- ✅ **パスワードハッシング**: bcrypt で安全に保管
- ✅ **HTTPS**: 本番環境で暗号化通信
- ✅ **環境変数管理**: 秘密鍵は環境変数で管理
- ✅ **CORS対応**: クロスオリジンリクエストを制御

### 推奨事項

- 定期的なセキュリティアップデート
- 強力なJWT秘密鍵の使用
- データベースバックアップの定期実施
- ユーザーデータの暗号化

---

## 📊 データベーススキーマ

### users テーブル
```sql
- id (PK)
- openId (OAuth用)
- email (ユニーク)
- name
- passwordHash (メール/パスワード認証用)
- googleId (Google Sign-In用)
- appleId (Apple Sign-In用)
- loginMethod
- role (user/admin)
- createdAt, updatedAt, lastSignedIn
```

### groups テーブル
```sql
- id (PK)
- name
- description
- ownerId (FK: users.id)
- createdAt, updatedAt
```

### groupMembers テーブル
```sql
- id (PK)
- groupId (FK: groups.id)
- userId (FK: users.id)
- role (member/admin)
- joinedAt
```

### diaryEntries テーブル
```sql
- id (PK)
- groupId (FK: groups.id)
- userId (FK: users.id)
- title
- content
- imageUrl
- createdAt, updatedAt
```

---

## 🧪 テスト

### ユニットテスト

```bash
# テストを実行
pnpm test

# テストをウォッチモードで実行
pnpm test:watch
```

### 統合テスト

```bash
# ローカルでアプリをテスト
pnpm ios    # iOS シミュレーター
pnpm android # Android エミュレーター
```

---

## 🐛 既知の問題・制限

- Render.com 無料枠はスリープ機能あり（15分無アクセスで停止）
- TestFlight は iOS 14.0 以上が必要
- Google Play 内部テストは 100 人まで

---

## 📝 ライセンス

MIT License

---

## 👥 サポート

### ドキュメント

- [QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md) - クイックスタート
- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイメント
- [BUILD_GUIDE.md](./BUILD_GUIDE.md) - ビルド
- [README_PRODUCTION.md](./README_PRODUCTION.md) - 本番運用

### 外部リソース

- [Expo ドキュメント](https://docs.expo.dev/)
- [React Native ドキュメント](https://reactnative.dev/)
- [Render.com ドキュメント](https://render.com/docs)
- [tRPC ドキュメント](https://trpc.io/)

---

## 🎉 次のステップ

1. **GitHub にプッシュ** - コードを GitHub にアップロード
2. **Render.com にデプロイ** - バックエンドを本番環境にデプロイ
3. **iOS ビルド** - TestFlight でテスト配布
4. **Android ビルド** - Google Play 内部テストで配布
5. **テスター招待** - 3人のテスターをテストに招待
6. **バグ修正** - テスターからのフィードバックを反映
7. **App Store/Google Play リリース** - 本番環境で公開

---

**最終更新**: 2025年12月17日

**開発者**: Manus AI

**バージョン**: 1.0.0


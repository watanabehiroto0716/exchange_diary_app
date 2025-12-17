# 交換日記アプリ - デプロイメントガイド

## 本番環境デプロイ手順

このドキュメントでは、交換日記アプリをRender.comに無料でデプロイする方法を説明します。

### 前提条件

- GitHub アカウント
- Render.com アカウント（無料）
- Apple Developer Program アカウント（iOS公開時）
- Google Play Developer Console アカウント（Android公開時）

---

## ステップ1: GitHubへのプッシュ

1. GitHubで新しいリポジトリを作成
2. ローカルで以下を実行：

```bash
git init
git add .
git commit -m "Initial commit: Exchange Diary App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/exchange-diary-app.git
git push -u origin main
```

---

## ステップ2: Render.comへのデプロイ

### 2.1 Render.comでの設定

1. [Render.com](https://render.com) にサインアップ
2. ダッシュボードから「New +」→「Web Service」を選択
3. GitHubリポジトリを接続
4. 以下の設定を入力：

| 項目 | 値 |
|------|-----|
| Name | exchange-diary-api |
| Environment | Node |
| Region | Singapore（またはお近くの地域） |
| Branch | main |
| Build Command | `pnpm install && pnpm db:push` |
| Start Command | `pnpm start` |
| Plan | Free |

### 2.2 環境変数の設定

Render.comの「Environment」セクションで以下を設定：

```
NODE_ENV=production
JWT_SECRET=<ランダムな長い文字列を生成>
PORT=3000
```

### 2.3 データベース設定

**オプション A: Render.com PostgreSQL（推奨）**

1. Render.comで「New +」→「PostgreSQL」を選択
2. 無料プランで作成
3. 接続文字列をコピーして `DATABASE_URL` に設定

**オプション B: PlanetScale MySQL（無料）**

1. [PlanetScale](https://planetscale.com) でアカウント作成
2. 新しいデータベースを作成
3. 接続文字列をコピー
4. Render.comの環境変数に設定

### 2.4 デプロイ開始

1. 「Create Web Service」をクリック
2. デプロイが自動的に開始
3. ログを確認してエラーがないか確認

---

## ステップ3: フロントエンド設定

### 3.1 APIエンドポイント更新

`lib/trpc.ts` でバックエンドURLを更新：

```typescript
const API_URL = "https://exchange-diary-api.onrender.com"; // Render.comのURL
```

### 3.2 ビルド設定

`app.config.ts` を更新：

```typescript
const env = {
  appName: 'Exchange Diary',
  appSlug: 'exchange-diary-app',
  logoUrl: '', // S3 URLがあれば設定
  scheme: 'exchangediary',
  iosBundleId: 'com.example.exchangediary',
  androidPackage: 'com.example.exchangediary',
};
```

---

## ステップ4: iOS TestFlight デプロイ

### 4.1 Apple Developer Program登録

1. [Apple Developer Program](https://developer.apple.com/programs/) に登録（$99/年）
2. Certificates, Identifiers & Profiles を設定

### 4.2 Expo EAS ビルド

```bash
# EAS CLIをインストール
npm install -g eas-cli

# ログイン
eas login

# iOS用ビルド
eas build --platform ios --auto-submit

# TestFlightにアップロード
eas submit --platform ios --latest
```

### 4.3 テスター招待

1. App Store Connect にログイン
2. 「Testflight」→「Internal Testing」を選択
3. テスターのメールアドレスを追加

---

## ステップ5: Android 内部テスト デプロイ

### 5.1 Google Play Console 登録

1. [Google Play Console](https://play.google.com/console) に登録（$25/回）
2. アプリを作成

### 5.2 Expo EAS ビルド

```bash
# Android用ビルド
eas build --platform android --auto-submit

# Google Play にアップロード
eas submit --platform android --latest
```

### 5.3 テスター招待

1. Google Play Console にログイン
2. 「Testing」→「Internal testing」を選択
3. テスターのGoogleアカウントを追加

---

## 環境変数リファレンス

| 環境変数 | 説明 | 例 |
|---------|------|-----|
| `NODE_ENV` | 実行環境 | `production` |
| `DATABASE_URL` | データベース接続文字列 | `postgresql://...` |
| `JWT_SECRET` | JWT署名用秘密鍵 | `your-secret-key-here` |
| `PORT` | サーバーポート | `3000` |

---

## トラブルシューティング

### デプロイが失敗する場合

1. **ビルドログを確認**
   ```bash
   eas logs --platform=ios
   ```

2. **依存関係をチェック**
   ```bash
   pnpm install
   ```

3. **環境変数を確認**
   - Render.com/EAS ダッシュボードで設定を確認

### データベース接続エラー

1. 接続文字列が正しいか確認
2. ファイアウォール設定を確認
3. データベースが起動しているか確認

### テスター招待が機能しない

1. テスターのメールアドレスが正しいか確認
2. TestFlight/内部テストが有効か確認
3. テスターがApple ID/Googleアカウントでログインしているか確認

---

## セキュリティ推奨事項

- ✅ `JWT_SECRET` は強力なランダム文字列を使用
- ✅ 本番環境では HTTPS を使用
- ✅ データベース接続文字列は環境変数で管理
- ✅ API キーは公開しない
- ✅ 定期的にセキュリティアップデートを確認

---

## サポート

問題が発生した場合は、以下をご確認ください：

- [Render.com ドキュメント](https://render.com/docs)
- [Expo EAS ドキュメント](https://docs.expo.dev/eas/)
- [Apple TestFlight ドキュメント](https://developer.apple.com/testflight/)
- [Google Play Console ヘルプ](https://support.google.com/googleplay/android-developer)

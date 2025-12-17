# 交換日記アプリ - iOS・Android ビルドガイド

## iOS ビルド（TestFlight）

### 前提条件

- Apple Developer Program アカウント（$99/年）
- Mac（Xcode が必要）
- Expo EAS CLI

### ステップ1: Apple Developer Program に登録

1. [Apple Developer Program](https://developer.apple.com/programs/) にアクセス
2. $99/年で登録
3. Certificates, Identifiers & Profiles を設定

### ステップ2: EAS ビルド設定

```bash
# EAS CLI をインストール
npm install -g eas-cli

# ログイン
eas login

# EAS 設定を初期化
eas build:configure --platform ios
```

### ステップ3: ビルド実行

```bash
# iOS 用 AAB ビルド（TestFlight 用）
eas build --platform ios --auto-submit

# または、ローカルでビルド
eas build --platform ios --local
```

### ステップ4: TestFlight にアップロード

```bash
# 最新ビルドを TestFlight にサブミット
eas submit --platform ios --latest
```

### ステップ5: TestFlight でテスター招待

1. [App Store Connect](https://appstoreconnect.apple.com) にログイン
2. 「My Apps」→「Exchange Diary」を選択
3. 「TestFlight」→「Internal Testing」をクリック
4. テスターのメールアドレスを追加
5. テスターが招待メールを受け取ります

---

## Android ビルド（内部テスト）

### 前提条件

- Google Play Developer Console アカウント（$25/回）
- Expo EAS CLI

### ステップ1: Google Play Console に登録

1. [Google Play Console](https://play.google.com/console) にアクセス
2. $25 で登録
3. 新しいアプリを作成

### ステップ2: 署名キーを生成

```bash
# 署名キーを生成（初回のみ）
eas build:configure --platform android

# キーストアを作成
eas credentials
```

### ステップ3: ビルド実行

```bash
# Android 用 AAB ビルド（Google Play 用）
eas build --platform android --auto-submit

# または、ローカルでビルド
eas build --platform android --local
```

### ステップ4: Google Play にアップロード

```bash
# 最新ビルドを Google Play にサブミット
eas submit --platform android --latest
```

### ステップ5: 内部テストでテスター招待

1. [Google Play Console](https://play.google.com/console) にログイン
2. 「Exchange Diary」アプリを選択
3. 「Testing」→「Internal testing」をクリック
4. テスターのメールアドレスを追加
5. テスターが招待リンクを受け取ります

---

## テスター招待メール テンプレート

### iOS テスター向け

```
件名: Exchange Diary - TestFlight テスト招待

こんにちは [テスター名] さん

Exchange Diary アプリの TestFlight テストに招待されました。

以下のリンクから TestFlight アプリをダウンロードしてください：
https://apps.apple.com/jp/app/testflight/id899247664

その後、以下のリンクからアプリをインストールできます：
[TestFlight 招待リンク]

ご不明な点があればお知らせください。

よろしくお願いします。
```

### Android テスター向け

```
件主: Exchange Diary - Google Play 内部テスト招待

こんにちは [テスター名] さん

Exchange Diary アプリの Google Play 内部テストに招待されました。

以下のリンクからアプリをインストールできます：
[Google Play 内部テスト リンク]

ご不明な点があればお知らせください。

よろしくお願いします。
```

---

## ビルド設定ファイル（app.config.ts）

```typescript
export default {
  name: "Exchange Diary",
  slug: "exchange-diary-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "exchangediary",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.example.exchangediary",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
    },
    package: "com.example.exchangediary",
  },
  web: {
    favicon: "./assets/images/favicon.png",
  },
};
```

---

## トラブルシューティング

### ビルドが失敗する場合

1. **ログを確認**
   ```bash
   eas logs --platform ios
   eas logs --platform android
   ```

2. **認証情報を確認**
   ```bash
   eas credentials
   ```

3. **キャッシュをクリア**
   ```bash
   eas build:cancel
   rm -rf .eas
   ```

### テスター招待が機能しない

| 問題 | 解決策 |
|------|--------|
| メールが届かない | スパムフォルダを確認 |
| リンクが無効 | TestFlight/内部テストが有効か確認 |
| アプリがインストールできない | デバイスの互換性を確認 |

### アプリがクラッシュする場合

1. **ログを確認**
   ```bash
   eas logs --platform ios --tail
   ```

2. **ローカルでテスト**
   ```bash
   npm run ios
   npm run android
   ```

3. **依存関係を確認**
   ```bash
   pnpm install
   ```

---

## セキュリティ推奨事項

- ✅ 署名キーは安全に保管
- ✅ テスター情報は機密扱い
- ✅ ビルド前に環境変数を確認
- ✅ 本番環境 API URL を使用

---

## 参考資料

- [Expo EAS Build ドキュメント](https://docs.expo.dev/eas-update/introduction/)
- [Apple TestFlight ドキュメント](https://developer.apple.com/testflight/)
- [Google Play Console ヘルプ](https://support.google.com/googleplay/android-developer)

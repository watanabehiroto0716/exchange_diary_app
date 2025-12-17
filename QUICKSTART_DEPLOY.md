# 交換日記アプリ - クイックスタート デプロイガイド

## 5分でできる本番環境デプロイ

### 必要なもの

- GitHub アカウント
- Render.com アカウント（無料）
- このプロジェクトのコード

---

## ステップ1: GitHub にプッシュ（2分）

```bash
# ローカルでリポジトリを初期化
git init
git add .
git commit -m "Exchange Diary App - Initial commit"

# GitHub で新しいリポジトリを作成してから：
git remote add origin https://github.com/YOUR_USERNAME/exchange-diary-app.git
git branch -M main
git push -u origin main
```

---

## ステップ2: Render.com にデプロイ（3分）

1. [Render.com](https://render.com) にサインアップ
2. ダッシュボードで「New +」→「Web Service」をクリック
3. GitHub リポジトリを接続
4. 以下を入力：
   - **Name**: `exchange-diary-api`
   - **Build Command**: `pnpm install && pnpm db:push`
   - **Start Command**: `pnpm start`
   - **Plan**: Free

5. 「Create Web Service」をクリック

### 環境変数を設定

デプロイ中に「Environment」セクションで以下を追加：

```
NODE_ENV=production
JWT_SECRET=<ランダムな長い文字列>
PORT=3000
```

### データベースを作成

1. Render.com で「New +」→「PostgreSQL」を選択
2. 無料プランで作成
3. 接続文字列をコピー
4. Web Service の `DATABASE_URL` に設定

---

## ステップ3: デプロイ完了

✅ Render.com がデプロイを完了すると、以下のURLでアクセス可能：

```
https://exchange-diary-api.onrender.com
```

---

## テスター招待（オプション）

### iOS テスター招待

1. Apple Developer Program に登録（$99/年）
2. `eas build --platform ios` でビルド
3. TestFlight でテスターを招待

### Android テスター招待

1. Google Play Console に登録（$25/回）
2. `eas build --platform android` でビルド
3. 内部テストでテスターを招待

---

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| デプロイが失敗 | Render.com のログを確認：「Logs」タブ |
| データベース接続エラー | `DATABASE_URL` が正しいか確認 |
| API が 502 エラー | サーバーが起動しているか確認：`pnpm start` |

---

## 詳細ドキュメント

詳しい手順は `DEPLOYMENT.md` を参照してください。

---

## サポート

- [Render.com ドキュメント](https://render.com/docs)
- [Expo EAS ドキュメント](https://docs.expo.dev/eas/)

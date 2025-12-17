#!/bin/bash

# 交換日記アプリ - テスター招待セットアップスクリプト
# このスクリプトは、3人のテスターをTestFlight・内部テストに招待するための準備を行います。

set -e

echo "=========================================="
echo "交換日記アプリ - テスター招待セットアップ"
echo "=========================================="
echo ""

# テスター情報を入力
echo "3人のテスター情報を入力してください。"
echo ""

for i in {1..3}; do
  echo "--- テスター $i ---"
  read -p "名前: " tester_name
  read -p "Googleアカウント（Android用）: " google_account
  read -p "Apple ID（iOS用）: " apple_id
  
  # テスター情報をファイルに保存
  echo "テスター$i: $tester_name" >> testers.txt
  echo "  Google: $google_account" >> testers.txt
  echo "  Apple: $apple_id" >> testers.txt
  echo "" >> testers.txt
done

echo ""
echo "=========================================="
echo "テスター情報を保存しました: testers.txt"
echo "=========================================="
echo ""
echo "次のステップ："
echo "1. GitHub にプッシュ"
echo "   git add . && git commit -m 'Add testers' && git push"
echo ""
echo "2. Render.com にデプロイ"
echo "   QUICKSTART_DEPLOY.md を参照"
echo ""
echo "3. iOS TestFlight に招待"
echo "   eas build --platform ios --auto-submit"
echo "   eas submit --platform ios --latest"
echo ""
echo "4. Android 内部テストに招待"
echo "   eas build --platform android --auto-submit"
echo "   eas submit --platform android --latest"
echo ""
echo "詳細は BUILD_GUIDE.md を参照してください。"

# デプロイガイド

## 現在の状態

**重要**: 現在、アプリケーションはlocalStorageを使用しており、Supabaseにはまだ接続されていません。

### データ保存の現状
- ユーザー情報: localStorage（ブラウザ内）
- ゲーム統計: localStorage（ブラウザ内）
- ゲーム履歴: 保存されていない

## Vercelへのデプロイ手順

### 1. 事前準備

1. GitHubリポジトリの作成
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Vercelアカウントの作成
- [Vercel](https://vercel.com)でアカウントを作成

### 2. Vercelでのデプロイ

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリをインポート
3. フレームワークは自動的にNext.jsが選択される
4. 環境変数の設定（Supabaseを使用する場合）：
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトのURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase のAnon Key

### 3. デプロイ

「Deploy」ボタンをクリックしてデプロイを開始

## Supabaseを使用する場合（オプション）

現在のアプリケーションをSupabaseに接続するには：

1. Supabaseプロジェクトを作成
2. `supabase/schema.sql`を実行してテーブルを作成
3. `.env.local`に認証情報を設定
4. コード内のlocalStorageをSupabaseに置き換える必要があります

### 注意事項

- 現在のままデプロイすると、各ユーザーのブラウザ内にデータが保存されます
- 異なるデバイスや異なるブラウザでは、データは共有されません
- Supabaseを使用すれば、どのデバイスからでも同じデータにアクセスできます

## デプロイ後の確認

1. デプロイURLにアクセス
2. ゲームが正常に動作することを確認
3. ユーザー登録・ログイン機能をテスト
4. ゲームプレイと統計の保存を確認

## トラブルシューティング

### ビルドエラーの場合
```bash
npm run build
```
でローカルでビルドを確認

### 環境変数の問題
Vercelの環境変数設定を確認

### その他の問題
Vercelのデプロイログを確認
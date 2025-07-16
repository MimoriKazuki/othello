# Supabaseセットアップガイド

このプロジェクトをSupabaseと連携させるための手順です。

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAnon Keyをメモ

## 2. データベースのセットアップ

1. SupabaseダッシュボードのSQL Editorを開く
2. `supabase/schema.sql`の内容をコピーして実行
3. テーブルが作成されたことを確認

## 3. 環境変数の設定

1. `.env.local.example`を`.env.local`にコピー
```bash
cp .env.local.example .env.local
```

2. `.env.local`を編集してSupabaseの認証情報を設定
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. 認証の設定（オプション）

Supabaseの認証機能を使用する場合：

1. Authentication → Settingsで認証プロバイダーを設定
2. Email認証を有効化
3. 必要に応じてソーシャルログインを設定

## 5. 動作確認

1. 開発サーバーを再起動
```bash
npm run dev
```

2. ブラウザの開発者ツールでエラーがないことを確認
3. ユーザー登録・ログイン機能をテスト

## トラブルシューティング

- **CORS エラー**: SupabaseダッシュボードでCORS設定を確認
- **認証エラー**: Anon Keyが正しいか確認
- **データベースエラー**: RLSポリシーが正しく設定されているか確認
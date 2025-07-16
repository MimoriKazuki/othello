# トラブルシューティングガイド

## よくあるエラーと解決方法

### 1. 統計情報の初期化に失敗しました

**エラー内容**:
```
Error: 統計情報の初期化に失敗しました: {}
```

**原因**:
- Supabaseの行レベルセキュリティ（RLS）ポリシーが適切に設定されていない
- user_statsテーブルのRLSが有効になっている

**解決方法**:

1. **Supabaseダッシュボードで修正**:
   ```sql
   -- SQL Editorで実行
   -- supabase/fix-policies.sql の内容を実行
   ```

2. **一時的な解決策（開発環境のみ）**:
   ```sql
   -- RLSを一時的に無効化
   ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
   ALTER TABLE game_history DISABLE ROW LEVEL SECURITY;
   ```

### 2. Supabaseクエリエラー

**エラー内容**:
```
Error: Supabaseクエリエラー: {}
```

**解決方法**:
1. `.env.local`ファイルの設定を確認
2. Supabase URLとAnon Keyが正しく設定されているか確認
3. `supabase/schema.sql`が実行されているか確認

### 3. currentUser is not defined

**エラー内容**:
```
ReferenceError: currentUser is not defined
```

**解決方法**:
1. ブラウザのキャッシュをクリア（Cmd+Shift+R / Ctrl+Shift+R）
2. Next.jsのキャッシュを削除:
   ```bash
   rm -rf .next
   npm run dev
   ```

### 4. メール認証エラー

**エラー内容**:
```
メールアドレスの確認が完了していません
```

**解決方法**:
1. Supabaseダッシュボード > Authentication > Settings
2. "Enable email confirmations" を OFF に設定
3. または `supabase/disable-email-confirm.sql` を実行

## データベース設定チェックリスト

- [ ] Supabaseプロジェクトが作成されている
- [ ] `.env.local`にSupabase URLとキーが設定されている
- [ ] `supabase/schema.sql`が実行されている
- [ ] RLSポリシーが適切に設定されている
- [ ] メール確認が無効化されている（必要に応じて）

## サポート

問題が解決しない場合は、以下の情報を含めて報告してください：
- エラーメッセージの全文
- ブラウザのコンソールログ
- Supabaseのログ（Dashboard > Logs）
- 実行した操作の手順
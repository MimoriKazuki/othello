# データベースセットアップ手順

## Supabaseでのテーブル作成

1. Supabaseダッシュボードにログイン
2. SQL Editorに移動
3. 以下のSQLを実行してテーブルを作成：

```sql
-- ユーザー情報テーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  age INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ユーザー統計テーブル
CREATE TABLE IF NOT EXISTS user_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_games INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  successful_doubts INTEGER DEFAULT 0,
  difficulty_stats JSONB DEFAULT '{
    "beginner": {"games": 0, "wins": 0, "losses": 0, "draws": 0},
    "intermediate": {"games": 0, "wins": 0, "losses": 0, "draws": 0},
    "advanced": {"games": 0, "wins": 0, "losses": 0, "draws": 0},
    "extreme": {"games": 0, "wins": 0, "losses": 0, "draws": 0}
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- 行レベルセキュリティ (RLS) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- ユーザーポリシー
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 統計ポリシー
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 更新時刻を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 環境変数の設定

`.env.local`に以下を設定：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## メール認証の無効化（オプション）

即座にプレイできるようにするため、メール認証を無効化：

1. Supabase Dashboard → Authentication → Providers
2. Email → Enable email confirmations をOFFに設定

## デバッグ方法

ブラウザのコンソールで以下のログを確認：
- "Loading stats for user: [user_id]" - 統計読み込み開始
- "Loaded stats: {stats, diffStats}" - 読み込まれた統計データ
- "Updating user stats: {...}" - 統計更新時のデータ

データが保存されない場合は、Supabaseのダッシュボードで：
1. Table Editorでテーブルが作成されているか確認
2. RLSポリシーが正しく設定されているか確認
3. API Logsでエラーがないか確認
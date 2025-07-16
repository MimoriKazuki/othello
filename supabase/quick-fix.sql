-- 緊急修正: RLSを一時的に無効化してデータベースエラーを回避

-- RLSを無効化
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_history DISABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view own game history" ON game_history;
DROP POLICY IF EXISTS "Anyone can create user" ON users;
DROP POLICY IF EXISTS "Users can create own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own game history" ON game_history;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;

-- テーブルへのフルアクセスを許可（開発環境用）
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON user_stats TO anon, authenticated;
GRANT ALL ON game_history TO anon, authenticated;

-- シーケンスへのアクセスも許可
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
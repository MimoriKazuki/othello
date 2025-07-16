-- RLSポリシーを修正して、ユーザーが自分の統計情報を作成できるようにする

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can create own stats" ON user_stats;

-- 新しいポリシーを作成（認証されたユーザーなら誰でも自分の統計を作成可能）
CREATE POLICY "Users can create own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ユーザー統計の更新ポリシーも追加
CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (user_id = auth.uid());

-- 既存のゲーム履歴ポリシーも修正
DROP POLICY IF EXISTS "Users can insert own game history" ON game_history;

CREATE POLICY "Users can insert own game history" ON game_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- デバッグ用：RLSを一時的に無効化する場合（開発環境のみ）
-- ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE game_history DISABLE ROW LEVEL SECURITY;
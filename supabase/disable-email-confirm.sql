-- メール確認を無効化するための設定
-- Supabaseダッシュボード > Authentication > Settings で以下を設定:
-- 1. "Enable email confirmations" をOFFにする
-- 2. "Confirm email" をOFFにする

-- または、以下のSQLを実行してユーザーのメール確認状態を更新
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 新規ユーザーの自動確認トリガー（オプション）
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_email();
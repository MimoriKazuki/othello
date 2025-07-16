// クライアント側で使用する認証関数（簡略版）
import { supabase } from './supabase'

// 登録後の統計情報初期化（クライアント側で実行）
export async function initializeUserStats(userId: string) {
  try {
    const { error } = await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        total_games: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        successful_doubts: 0,
        win_rate: 0
      })
      .select()
      .single()

    if (error && !error.message?.includes('duplicate')) {
      console.error('統計初期化エラー:', error)
    }
  } catch (error) {
    console.error('統計初期化エラー:', error)
  }
}
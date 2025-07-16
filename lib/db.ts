import { supabase } from './supabase'
import { User, UserStats } from '@/types/user'

// ユーザー情報を取得
export async function getUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // ユーザーが存在しない
        return null
      }
      throw error
    }
    
    return data ? {
      nickname: data.nickname,
      email: data.email,
      age: data.age,
      registeredAt: data.created_at
    } : null
  } catch (error) {
    console.error('ユーザー情報の取得に失敗しました:', error)
    return null
  }
}

// ユーザー統計を取得
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // 統計情報が存在しない場合は初期化
      if (error.code === 'PGRST116') {
        return await initializeUserStats(userId)
      }
      throw error
    }

    return data ? {
      totalGames: data.total_games,
      wins: data.wins,
      losses: data.losses,
      draws: data.draws,
      winRate: data.win_rate,
      successfulDoubts: data.successful_doubts
    } : null
  } catch (error) {
    console.error('ユーザー統計の取得に失敗しました:', error)
    return null
  }
}

// ユーザー統計を初期化
async function initializeUserStats(userId: string): Promise<UserStats> {
  try {
    const initialStats = {
      user_id: userId,
      total_games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      win_rate: 0,
      successful_doubts: 0
    }

    const { data, error } = await supabase
      .from('user_stats')
      .insert(initialStats)
      .select()
      .single()

    if (error) throw error

    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      successfulDoubts: 0
    }
  } catch (error) {
    console.error('ユーザー統計の初期化に失敗しました:', error)
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      successfulDoubts: 0
    }
  }
}

// ユーザー統計を更新
export async function updateUserStats(
  userId: string,
  result: 'win' | 'loss' | 'draw',
  successfulDoubt: boolean = false
): Promise<void> {
  try {
    // 現在の統計を取得
    const currentStats = await getUserStats(userId)
    if (!currentStats) {
      console.error('ユーザー統計が取得できませんでした')
      return
    }

    // 新しい統計を計算
    const newStats = {
      total_games: currentStats.totalGames + 1,
      wins: currentStats.wins + (result === 'win' ? 1 : 0),
      losses: currentStats.losses + (result === 'loss' ? 1 : 0),
      draws: currentStats.draws + (result === 'draw' ? 1 : 0),
      successful_doubts: currentStats.successfulDoubts + (successfulDoubt ? 1 : 0)
    }

    // 勝率を計算
    const winRate = newStats.total_games > 0 
      ? Math.round((newStats.wins / newStats.total_games) * 100 * 100) / 100
      : 0

    // データベースを更新
    const { error } = await supabase
      .from('user_stats')
      .update({ ...newStats, win_rate: winRate })
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase更新エラー:', error)
      throw error
    }
  } catch (error) {
    console.error('ユーザー統計の更新に失敗しました:', error)
    throw error // エラーを再スローして呼び出し元でハンドリングできるように
  }
}

// ゲーム履歴を保存
export async function saveGameHistory(
  userId: string,
  difficulty: string,
  result: 'win' | 'loss' | 'draw',
  blackCount: number,
  whiteCount: number,
  doubtSuccess: number = 0
): Promise<void> {
  try {
    const { error } = await supabase
      .from('game_history')
      .insert({
        user_id: userId,
        difficulty,
        result,
        black_count: blackCount,
        white_count: whiteCount,
        doubt_success: doubtSuccess
      })

    if (error) throw error
  } catch (error) {
    console.error('ゲーム履歴の保存に失敗しました:', error)
  }
}

// 全体統計を取得
export async function getOverallStats() {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('total_games, wins, losses, draws, successful_doubts')

    if (error) {
      // PGRST116: テーブルが空の場合のエラーを特別に処理
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return {
          totalGames: 0,
          totalWins: 0,
          totalLosses: 0,
          totalDraws: 0,
          totalSuccessfulDoubts: 0
        }
      }
      console.error('Supabaseクエリエラー:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalDraws: 0,
        totalSuccessfulDoubts: 0
      }
    }

    // 集計
    const stats = data.reduce((acc, curr) => ({
      totalGames: acc.totalGames + (curr.total_games || 0),
      totalWins: acc.totalWins + (curr.wins || 0),
      totalLosses: acc.totalLosses + (curr.losses || 0),
      totalDraws: acc.totalDraws + (curr.draws || 0),
      totalSuccessfulDoubts: acc.totalSuccessfulDoubts + (curr.successful_doubts || 0)
    }), {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      totalSuccessfulDoubts: 0
    })

    return stats
  } catch (error) {
    console.error('全体統計の取得に失敗しました:', error)
    // デフォルト値を返す
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      totalSuccessfulDoubts: 0
    }
  }
}

// ローカルストレージからSupabaseへデータ移行（初回ログイン時用）
export async function migrateLocalDataToSupabase(userId: string, email: string): Promise<void> {
  try {
    // ローカルストレージから既存の統計を取得
    const localStatsKey = `userStats_${email}`
    const localStats = localStorage.getItem(localStatsKey)
    
    if (localStats) {
      const stats = JSON.parse(localStats)
      
      // Supabaseの統計を更新
      const { error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          total_games: stats.totalGames || 0,
          wins: stats.wins || 0,
          losses: stats.losses || 0,
          draws: stats.draws || 0,
          win_rate: stats.winRate || 0,
          successful_doubts: stats.successfulDoubts || 0
        })

      if (!error) {
        // 移行成功後、ローカルストレージから削除
        localStorage.removeItem(localStatsKey)
      }
    }
  } catch (error) {
    console.error('データ移行に失敗しました:', error)
  }
}
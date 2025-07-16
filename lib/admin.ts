import { supabase } from './supabase'

// 管理者メールアドレスのリスト（環境変数から取得）
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []

// 管理者かどうかをチェック
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser()
    
    if (!user.user || user.user.id !== userId) {
      return false
    }
    
    // メールアドレスで管理者かチェック
    return ADMIN_EMAILS.includes(user.user.email || '')
  } catch (error) {
    console.error('管理者チェックエラー:', error)
    return false
  }
}

// 全ユーザー情報を取得（管理者のみ）
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_stats (
          total_games,
          wins,
          losses,
          draws,
          win_rate,
          successful_doubts
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error)
    return []
  }
}

// ユーザー数の統計を取得
export async function getUserCountStats() {
  try {
    // 総ユーザー数
    const { count: totalUsers, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (countError) throw countError
    
    // 今日の新規ユーザー数
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayUsers, error: todayError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    
    if (todayError) throw todayError
    
    // 今週の新規ユーザー数
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)
    
    const { count: weekUsers, error: weekError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString())
    
    if (weekError) throw weekError
    
    // 今月の新規ユーザー数
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    monthAgo.setHours(0, 0, 0, 0)
    
    const { count: monthUsers, error: monthError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthAgo.toISOString())
    
    if (monthError) throw monthError
    
    return {
      totalUsers: totalUsers || 0,
      todayUsers: todayUsers || 0,
      weekUsers: weekUsers || 0,
      monthUsers: monthUsers || 0
    }
  } catch (error) {
    console.error('ユーザー数統計取得エラー:', error)
    return {
      totalUsers: 0,
      todayUsers: 0,
      weekUsers: 0,
      monthUsers: 0
    }
  }
}

// 日別ユーザー登録数を取得（グラフ用）
export async function getDailyUserRegistrations(days: number = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)
    
    const { data, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // 日別に集計
    const dailyCounts: Record<string, number> = {}
    const dates: string[] = []
    
    // 全日付を初期化
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      dailyCounts[dateStr] = 0
      dates.push(dateStr)
    }
    
    // データを集計
    data?.forEach(user => {
      const dateStr = user.created_at.split('T')[0]
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++
      }
    })
    
    return dates.map(date => ({
      date,
      count: dailyCounts[date]
    }))
  } catch (error) {
    console.error('日別登録数取得エラー:', error)
    return []
  }
}

// ゲーム統計を取得
export async function getGameStats() {
  try {
    const { data, error } = await supabase
      .from('game_history')
      .select('difficulty, result')
    
    if (error) throw error
    
    // 難易度別・結果別に集計
    const stats = {
      byDifficulty: {
        beginner: { total: 0, wins: 0, losses: 0, draws: 0 },
        intermediate: { total: 0, wins: 0, losses: 0, draws: 0 },
        advanced: { total: 0, wins: 0, losses: 0, draws: 0 },
        extreme: { total: 0, wins: 0, losses: 0, draws: 0 }
      },
      total: { games: 0, wins: 0, losses: 0, draws: 0 }
    }
    
    data?.forEach(game => {
      const difficulty = game.difficulty as keyof typeof stats.byDifficulty
      if (stats.byDifficulty[difficulty]) {
        stats.byDifficulty[difficulty].total++
        stats.byDifficulty[difficulty][game.result + 's' as 'wins' | 'losses' | 'draws']++
      }
      
      stats.total.games++
      stats.total[game.result + 's' as 'wins' | 'losses' | 'draws']++
    })
    
    return stats
  } catch (error) {
    console.error('ゲーム統計取得エラー:', error)
    return null
  }
}
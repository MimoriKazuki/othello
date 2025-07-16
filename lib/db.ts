import { supabase } from './supabase'

export interface UserStats {
  userId: string
  totalGames: number
  wins: number
  losses: number
  draws: number
  successfulDoubts: number
}

export interface DifficultyStats {
  beginner: { games: number; wins: number; losses: number; draws: number }
  intermediate: { games: number; wins: number; losses: number; draws: number }
  advanced: { games: number; wins: number; losses: number; draws: number }
  extreme: { games: number; wins: number; losses: number; draws: number }
}

export interface PlayerRanking {
  rank: number | null
  totalPlayers: number
  percentile: number
  betterThan: number
}

export interface GlobalStats {
  totalGames: number
  totalWins: number
  totalLosses: number
  totalDraws: number
  totalSuccessfulDoubts: number
  totalPlayers: number
}

export async function updateUserStats(
  userId: string,
  result: 'win' | 'loss' | 'draw',
  doubtSuccess: boolean = false,
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'extreme'
) {
  try {
    // 現在の統計を取得
    const { data: currentStats, error: fetchError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    // 難易度別の統計を更新
    const difficultyStats = currentStats?.difficulty_stats || {
      beginner: { games: 0, wins: 0, losses: 0, draws: 0 },
      intermediate: { games: 0, wins: 0, losses: 0, draws: 0 },
      advanced: { games: 0, wins: 0, losses: 0, draws: 0 },
      extreme: { games: 0, wins: 0, losses: 0, draws: 0 }
    }
    
    if (difficulty && difficultyStats[difficulty]) {
      difficultyStats[difficulty].games += 1
      if (result === 'win') difficultyStats[difficulty].wins += 1
      else if (result === 'loss') difficultyStats[difficulty].losses += 1
      else if (result === 'draw') difficultyStats[difficulty].draws += 1
    }

    // 統計を更新
    const updates = {
      user_id: userId,
      total_games: (currentStats?.total_games || 0) + 1,
      wins: (currentStats?.wins || 0) + (result === 'win' ? 1 : 0),
      losses: (currentStats?.losses || 0) + (result === 'loss' ? 1 : 0),
      draws: (currentStats?.draws || 0) + (result === 'draw' ? 1 : 0),
      successful_doubts: (currentStats?.successful_doubts || 0) + (doubtSuccess ? 1 : 0),
      difficulty_stats: difficultyStats,
      updated_at: new Date().toISOString()
    }

    const { error: upsertError } = await supabase
      .from('user_stats')
      .upsert(updates)
    
    console.log('Updating user stats:', {
      userId,
      result,
      difficulty,
      doubtSuccess,
      updates
    })

    if (upsertError) {
      throw upsertError
    }

    return updates
  } catch (error) {
    console.error('Failed to update user stats:', error)
    return null
  }
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが存在しない場合は初期値を返す
        return {
          userId,
          totalGames: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          successfulDoubts: 0
        }
      }
      throw error
    }

    return {
      userId: data.user_id,
      totalGames: data.total_games,
      wins: data.wins,
      losses: data.losses,
      draws: data.draws,
      successfulDoubts: data.successful_doubts
    }
  } catch (error) {
    console.error('Failed to get user stats:', error)
    return null
  }
}

export async function getUserDifficultyStats(userId: string): Promise<DifficultyStats | null> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('difficulty_stats')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが存在しない場合は初期値を返す
        return {
          beginner: { games: 0, wins: 0, losses: 0, draws: 0 },
          intermediate: { games: 0, wins: 0, losses: 0, draws: 0 },
          advanced: { games: 0, wins: 0, losses: 0, draws: 0 },
          extreme: { games: 0, wins: 0, losses: 0, draws: 0 }
        }
      }
      throw error
    }

    return data.difficulty_stats || {
      beginner: { games: 0, wins: 0, losses: 0, draws: 0 },
      intermediate: { games: 0, wins: 0, losses: 0, draws: 0 },
      advanced: { games: 0, wins: 0, losses: 0, draws: 0 },
      extreme: { games: 0, wins: 0, losses: 0, draws: 0 }
    }
  } catch (error) {
    console.error('Failed to get difficulty stats:', error)
    return null
  }
}

export async function getOverallStats() {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('total_games, wins, losses, draws, successful_doubts')

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalDraws: 0,
        totalSuccessfulDoubts: 0,
        totalPlayers: 0
      }
    }

    const totals = data.reduce((acc, stat) => ({
      totalGames: acc.totalGames + stat.total_games,
      totalWins: acc.totalWins + stat.wins,
      totalLosses: acc.totalLosses + stat.losses,
      totalDraws: acc.totalDraws + stat.draws,
      totalSuccessfulDoubts: acc.totalSuccessfulDoubts + stat.successful_doubts
    }), {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      totalSuccessfulDoubts: 0
    })

    return {
      ...totals,
      totalPlayers: data.length
    }
  } catch (error) {
    console.error('Failed to get overall stats:', error)
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      totalSuccessfulDoubts: 0,
      totalPlayers: 0
    }
  }
}

export async function getUserRanking(userId: string) {
  try {
    const { data: allStats, error } = await supabase
      .from('user_stats')
      .select('user_id, wins, total_games')
      .gt('total_games', 0)
      .order('wins', { ascending: false })

    if (error) throw error
    if (!allStats || allStats.length === 0) return null

    // 勝率でソート
    const sortedByWinRate = allStats
      .map(stat => ({
        ...stat,
        winRate: stat.total_games > 0 ? stat.wins / stat.total_games : 0
      }))
      .sort((a, b) => b.winRate - a.winRate)

    const userRank = sortedByWinRate.findIndex(stat => stat.user_id === userId) + 1
    const totalPlayers = sortedByWinRate.length
    const percentile = userRank > 0 ? Math.round(((totalPlayers - userRank + 1) / totalPlayers) * 100) : 0

    return {
      rank: userRank || null,
      totalPlayers,
      percentile,
      betterThan: userRank > 0 ? Math.round(((totalPlayers - userRank) / totalPlayers) * 100) : 0
    }
  } catch (error) {
    console.error('Failed to get user ranking:', error)
    return null
  }
}
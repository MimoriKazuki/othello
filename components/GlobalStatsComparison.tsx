'use client'

import { useEffect, useState } from 'react'
import { getOverallStats, getUserRanking, GlobalStats, PlayerRanking } from '@/lib/db'

interface GlobalStatsComparisonProps {
  userId: string
  userStats: {
    totalGames: number
    wins: number
    winRate: number
  }
}

export default function GlobalStatsComparison({ userId, userStats }: GlobalStatsComparisonProps) {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [ranking, setRanking] = useState<PlayerRanking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        const [stats, rank] = await Promise.all([
          getOverallStats(),
          getUserRanking(userId)
        ])
        setGlobalStats(stats)
        setRanking(rank)
      } catch (error) {
        console.error('Failed to load global stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGlobalStats()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-white">🌍 全プレイヤーとの比較</h3>
        <p className="text-center text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (!globalStats || !ranking) {
    return null
  }

  const globalWinRate = globalStats.totalGames > 0 
    ? Math.round((globalStats.totalWins / globalStats.totalGames) * 100) 
    : 0

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-white">🌍 全プレイヤーとの比較</h3>
      
      {/* ランキング表示 */}
      {ranking.rank && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              第 {ranking.rank} 位
            </div>
            <p className="text-gray-400">
              全 {ranking.totalPlayers} 人中
            </p>
            <div className="mt-3 space-y-2">
              <div className="bg-gray-700 rounded-full h-2 relative overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-full transition-all duration-1000"
                  style={{ width: `${ranking.percentile}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">
                上位 {ranking.percentile}% のプレイヤーです！
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 統計比較 */}
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-400 mb-3">勝率比較</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white">あなた</span>
                <span className="text-white font-bold">{userStats.winRate}%</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${userStats.winRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">全体平均</span>
                <span className="text-gray-400">{globalWinRate}%</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${globalWinRate}%` }}
                />
              </div>
            </div>
          </div>
          {userStats.winRate > globalWinRate && (
            <p className="text-green-400 text-sm mt-3 text-center">
              平均より {userStats.winRate - globalWinRate}% 高い勝率です！
            </p>
          )}
        </div>

        {/* 全体統計 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-400 mb-3">全体統計</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {globalStats.totalPlayers.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">総プレイヤー数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {globalStats.totalGames.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">総試合数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {globalStats.totalSuccessfulDoubts.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">総ダウト成功</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">
                {globalWinRate}%
              </div>
              <div className="text-xs text-gray-500">平均勝率</div>
            </div>
          </div>
        </div>

        {ranking.rank && ranking.betterThan > 50 && (
          <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 rounded-lg p-4 border border-yellow-700/50">
            <p className="text-center text-yellow-400 font-bold">
              🏆 あなたは全プレイヤーの {ranking.betterThan}% より強いです！
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
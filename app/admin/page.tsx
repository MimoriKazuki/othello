'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isAdmin, getAllUsers, getUserCountStats, getDailyUserRegistrations, getGameStats } from '@/lib/admin'
import LoadingSpinner from '@/components/LoadingSpinner'
import Header from '@/components/Header'

interface UserData {
  id: string
  email: string
  nickname: string
  age: number
  created_at: string
  user_stats: {
    total_games: number
    wins: number
    losses: number
    draws: number
    win_rate: number
    successful_doubts: number
  }[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [userCountStats, setUserCountStats] = useState({
    totalUsers: 0,
    todayUsers: 0,
    weekUsers: 0,
    monthUsers: 0
  })
  const [dailyRegistrations, setDailyRegistrations] = useState<{ date: string; count: number }[]>([])
  const [gameStats, setGameStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'games'>('overview')

  useEffect(() => {
    const checkAuth = async () => {
      if (!authLoading && user) {
        const adminStatus = await isAdmin(user.id)
        if (!adminStatus) {
          router.push('/')
          return
        }
        setIsAuthorized(true)
        await loadData()
      } else if (!authLoading && !user) {
        router.push('/')
      }
    }
    
    checkAuth()
  }, [user, authLoading, router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersData, countStats, dailyData, gameData] = await Promise.all([
        getAllUsers(),
        getUserCountStats(),
        getDailyUserRegistrations(30),
        getGameStats()
      ])
      
      setUsers(usersData as UserData[])
      setUserCountStats(countStats)
      setDailyRegistrations(dailyData)
      setGameStats(gameData)
    } catch (error) {
      console.error('データ読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                概要
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ユーザー一覧
              </button>
              <button
                onClick={() => setActiveTab('games')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'games'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ゲーム統計
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* ユーザー数統計 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">総ユーザー数</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{userCountStats.totalUsers}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">今日の新規</h3>
                    <p className="mt-2 text-3xl font-bold text-green-600">+{userCountStats.todayUsers}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">今週の新規</h3>
                    <p className="mt-2 text-3xl font-bold text-blue-600">+{userCountStats.weekUsers}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">今月の新規</h3>
                    <p className="mt-2 text-3xl font-bold text-purple-600">+{userCountStats.monthUsers}</p>
                  </div>
                </div>

                {/* 日別登録グラフ */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">過去30日間の新規登録数</h3>
                  <div className="h-64 flex items-end space-x-1">
                    {dailyRegistrations.map((day, index) => {
                      const maxCount = Math.max(...dailyRegistrations.map(d => d.count), 1)
                      const height = (day.count / maxCount) * 100
                      return (
                        <div
                          key={day.date}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors relative group"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.date}: {day.count}人
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    日付（古い → 新しい）
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ユーザー
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        年齢
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        登録日
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ゲーム数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        勝率
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ダウト成功
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => {
                      const stats = user.user_stats[0] || {
                        total_games: 0,
                        wins: 0,
                        losses: 0,
                        draws: 0,
                        win_rate: 0,
                        successful_doubts: 0
                      }
                      return (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.nickname}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.age}歳
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(user.created_at).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stats.total_games}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{stats.win_rate}%</div>
                            <div className="text-xs text-gray-500">
                              {stats.wins}勝 {stats.losses}敗 {stats.draws}分
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stats.successful_doubts}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'games' && gameStats && (
              <div className="space-y-6">
                {/* 全体統計 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">全体ゲーム統計</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">総ゲーム数</p>
                      <p className="text-2xl font-bold">{gameStats.total.games}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">プレイヤー勝利</p>
                      <p className="text-2xl font-bold text-green-600">{gameStats.total.wins}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">AI勝利</p>
                      <p className="text-2xl font-bold text-red-600">{gameStats.total.losses}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">引き分け</p>
                      <p className="text-2xl font-bold text-gray-600">{gameStats.total.draws}</p>
                    </div>
                  </div>
                </div>

                {/* 難易度別統計 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">難易度別統計</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(gameStats.byDifficulty).map(([difficulty, stats]: [string, any]) => (
                      <div key={difficulty} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 capitalize mb-2">
                          {difficulty === 'beginner' ? '初級' :
                           difficulty === 'intermediate' ? '中級' :
                           difficulty === 'advanced' ? '上級' : '鬼'}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>ゲーム数: {stats.total}</p>
                          <p>勝利: {stats.wins} ({stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0}%)</p>
                          <p>敗北: {stats.losses}</p>
                          <p>引分: {stats.draws}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </>
  )
}
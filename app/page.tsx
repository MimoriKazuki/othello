'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/hooks/useGameState'
import { Difficulty } from '@/types/game'
import GameBoard from '@/components/GameBoard'
import DoubtButton from '@/components/DoubtButton'
import GameOverModal from '@/components/GameOverModal'
import AuthModal from '@/components/AuthModal'
import GlobalStatsComparison from '@/components/GlobalStatsComparison'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
    gameState,
    gameStats,
    difficultyStats,
    gameStarted,
    turn,
    message,
    validMoves,
    handlePlayerMove,
    handleDoubt,
    startNewGame
  } = useGameState()
  
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty | null>(null)

  const canDoubt = gameState.isPlayerTurn && turn > 2 && gameState.lastMove !== null

  const handleDifficultySelect = (difficulty: Difficulty) => {
    // 上級・極限モードの場合は登録チェック
    if ((difficulty === 'advanced' || difficulty === 'extreme') && !user) {
      setPendingDifficulty(difficulty)
      setAuthMode('register')
      setShowAuthModal(true)
      return
    }
    
    startNewGame(difficulty)
  }
  
  const handleAuthSuccess = (authUser: any) => {
    setShowAuthModal(false)
    
    // 認証後、保留中の難易度でゲームを開始
    if (pendingDifficulty) {
      startNewGame(pendingDifficulty)
      setPendingDifficulty(null)
    }
  }

  const handleBackToHome = () => {
    window.location.reload()
  }
  
  const handleLogout = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!gameStarted) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* 背景のアニメーション効果 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-600/20 to-transparent rounded-full filter blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-red-600/20 to-transparent rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-600/10 to-transparent rounded-full filter blur-3xl animate-pulse-slow" />
        </div>
        
        {/* ヘッダー */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-red-400">
                    ダウトオセロ
                  </h1>
                </div>
                
                <div className="flex items-center gap-4">
                  {user ? (
                    <>
                      <span className="text-white font-medium hidden sm:block">ようこそ、{user.email}</span>
                      <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-full transition-all duration-200 transform hover:scale-105 font-medium"
                      >
                        ログアウト
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setAuthMode('login')
                          setShowAuthModal(true)
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-full transition-all duration-200 transform hover:scale-105 font-medium"
                      >
                        ログイン
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode('register')
                          setShowAuthModal(true)
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white rounded-full transition-all duration-200 transform hover:scale-105 font-bold shadow-lg"
                      >
                        新規登録
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center max-w-2xl mx-auto relative z-10 pt-20">
          <h1 className="text-6xl sm:text-8xl font-black text-center mb-8 relative hover-3d">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-red-400 tracking-wider animate-gradient">
              ダウトオセロ
            </span>
            <div className="absolute inset-0 text-center blur-xl opacity-50">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-red-400 text-6xl sm:text-8xl font-black">ダウトオセロ</span>
            </div>
          </h1>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed opacity-90 max-w-lg mx-auto">
            <span className="inline-block transform hover:scale-105 transition-transform duration-200">
              AIは時々ズルをします。怪しい手を見つけたら「DOUBT!」で勝利を掴め！
            </span>
          </p>
          
          <div className="bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-gray-700/50">
            <h2 className="text-3xl font-black mb-6 text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-wider">難易度を選択</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'beginner', label: '初級', desc: 'AIは弱く、不正も少ない', color: 'gray' },
                { key: 'intermediate', label: '中級', desc: 'バランスの取れた難易度', color: 'gray' },
                { key: 'advanced', label: '上級', desc: 'AIは強く、不正も多い', requiresAuth: true, color: 'gray' },
                { key: 'extreme', label: '鬼', desc: '最強AI、不正頻発', requiresAuth: true, color: 'red' }
              ].map(({ key, label, desc, requiresAuth, color }) => (
                <button
                  key={key}
                  onClick={() => handleDifficultySelect(key as Difficulty)}
                  className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
                    border-2 relative overflow-hidden shadow-lg hover:shadow-2xl ${
                      color === 'red' 
                        ? 'bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 hover:from-gray-800 hover:via-red-900 hover:to-gray-800 border-red-800 hover:border-red-600' 
                        : 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border-gray-600 hover:border-gray-500'
                    }`}
                >
                  {/* 光沢エフェクト */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  
                  {color === 'red' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/20 to-transparent animate-pulse" />
                  )}
                  <div className={`text-xl font-bold mb-2 relative z-10 ${
                    color === 'red' ? 'text-red-400' : 'text-white'
                  }`}>
                    {label}
                    {color === 'red' && <span className="ml-2 animate-bounce">👹</span>}
                  </div>
                  <div className="text-sm text-gray-400 relative z-10">{desc}</div>
                  {requiresAuth && !user && (
                    <span className={`absolute top-2 right-2 text-xs font-black px-3 py-1 rounded-full animate-pulse ${
                      color === 'red' 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-white to-gray-100 text-black shadow-lg'
                    }`}>
                      要ログイン
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {user && (
            <>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-xl mb-6">
                <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">✨ あなたの戦績</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{gameStats.totalGames}</div>
                    <div className="text-sm text-gray-400">総試合数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">{gameStats.wins}</div>
                    <div className="text-sm text-gray-400">勝利</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500">{gameStats.losses}</div>
                    <div className="text-sm text-gray-400">敗北</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-500">{gameStats.successfulDoubts}</div>
                    <div className="text-sm text-gray-400">ダウト成功</div>
                  </div>
                </div>
              </div>
              
              {difficultyStats && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-xl">
                  <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">🎮 難易度別の戦績</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'beginner', label: '初級', color: 'blue' },
                      { key: 'intermediate', label: '中級', color: 'green' },
                      { key: 'advanced', label: '上級', color: 'yellow' },
                      { key: 'extreme', label: '鬼', color: 'red' }
                    ].map(({ key, label, color }) => {
                      const stats = difficultyStats[key] || { games: 0, wins: 0, losses: 0, draws: 0 }
                      const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0
                      
                      return (
                        <div key={key} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-bold text-${color}-400`}>{label}</h4>
                            <span className="text-sm text-gray-400">{stats.games}試合</span>
                          </div>
                          {stats.games > 0 ? (
                            <>
                              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                                <div>
                                  <div className="text-lg font-bold text-green-400">{stats.wins}</div>
                                  <div className="text-xs text-gray-500">勝利</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-red-400">{stats.losses}</div>
                                  <div className="text-xs text-gray-500">敗北</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-gray-400">{stats.draws}</div>
                                  <div className="text-xs text-gray-500">引分</div>
                                </div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
                                  style={{ width: `${winRate}%` }}
                                />
                              </div>
                              <p className="text-center text-sm text-gray-400 mt-1">勝率 {winRate}%</p>
                            </>
                          ) : (
                            <p className="text-center text-gray-500 text-sm">まだプレイしていません</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* 全プレイヤーとの比較 */}
              {gameStats.totalGames > 0 && (
                <GlobalStatsComparison 
                  userId={user.id}
                  userStats={{
                    totalGames: gameStats.totalGames,
                    wins: gameStats.wins,
                    winRate: Math.round((gameStats.wins / gameStats.totalGames) * 100)
                  }}
                />
              )}
            </>
          )}
          
          {!user && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
              <div className="text-center">
                <h3 className="text-2xl font-black mb-3 text-white">🌍 全世界ランキングに参加しよう！</h3>
                <p className="text-gray-300 mb-4 text-lg">
                  世界中のプレイヤーと競い合い、<br/>
                  あなたの実力を証明しましょう
                </p>
                <ul className="text-sm text-gray-400 mb-6 space-y-2">
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-yellow-400">🏆</span> 
                    <span>リアルタイム世界ランキング</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-red-400">👹</span>
                    <span>上級・鬼モードに挑戦</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-blue-400">📈</span>
                    <span>詳細な統計と成長記録</span>
                  </li>
                </ul>
                <button
                  onClick={() => {
                    setAuthMode('register')
                    setShowAuthModal(true)
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-white to-gray-100 text-black font-black rounded-full hover:from-gray-100 hover:to-white transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-xl hover:shadow-2xl animate-pulse hover:animate-none"
                >
                  今すぐ参加する
                </button>
              </div>
            </div>
          )}
          
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          mode={authMode}
          pendingDifficulty={pendingDifficulty || undefined}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* ゲーム中のヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-red-400">
                  ダウトオセロ
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                {user && (
                  <>
                    <span className="text-white font-medium hidden sm:block">{user.email}</span>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-full transition-all duration-200 transform hover:scale-105 font-medium"
                    >
                      ログアウト
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ゲーム中の背景エフェクト */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-green-500/10 to-transparent rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-red-500/10 to-transparent rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full filter blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className="text-center mb-6 relative z-10 pt-20">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">ダウトオセロ</h1>
        <div className="text-lg text-gray-300">
          難易度: {{
            beginner: '初級',
            intermediate: '中級', 
            advanced: '上級',
            extreme: '鬼'
          }[gameState.difficulty]} | ターン: {turn}
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 mb-6 border-2 border-gray-700 shadow-xl">
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-black rounded-full border-2 border-gray-700 shadow-lg"></div>
              <span className="text-2xl font-bold text-white">{gameState.blackCount}</span>
            </div>
            <p className="text-sm text-gray-400">あなた</p>
          </div>
          
          <span className="text-gray-500 text-2xl">VS</span>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white rounded-full border-2 border-gray-300 shadow-lg"></div>
              <span className="text-2xl font-bold text-white">{gameState.whiteCount}</span>
            </div>
            <p className="text-sm text-gray-400">CPU</p>
          </div>
        </div>
        
        <p className="text-center text-white font-semibold">{message}</p>
      </div>

      <div className="mb-6">
        <GameBoard
          board={gameState.board}
          validMoves={validMoves}
          lastMove={gameState.lastMove}
          onCellClick={handlePlayerMove}
          isPlayerTurn={gameState.isPlayerTurn}
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <DoubtButton
          onClick={handleDoubt}
          disabled={!canDoubt}
        />
        
        <button
          onClick={handleBackToHome}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white
            rounded-xl transition-all duration-200 transform hover:scale-105
            border border-gray-600"
        >
          ホームに戻る
        </button>
      </div>

      <GameOverModal
        winner={gameState.winner}
        blackCount={gameState.blackCount}
        whiteCount={gameState.whiteCount}
        onNewGame={handleBackToHome}
        doubtSuccess={gameState.doubtSuccess}
      />
    </main>
  )
}
'use client'

import { useGameState } from '@/hooks/useGameState'
import { Difficulty } from '@/types/game'
import GameBoard from '@/components/GameBoard'
import DoubtButton from '@/components/DoubtButton'
import GameOverModal from '@/components/GameOverModal'

export default function Home() {
  const {
    gameState,
    gameStats,
    gameStarted,
    turn,
    message,
    validMoves,
    handlePlayerMove,
    handleDoubt,
    startNewGame
  } = useGameState()

  const canDoubt = gameState.currentPlayer === 'black' && !gameState.isPlayerTurn && turn > 2

  const handleDifficultySelect = (difficulty: Difficulty) => {
    startNewGame(difficulty)
  }

  const handleBackToHome = () => {
    window.location.reload()
  }

  if (!gameStarted) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-6xl sm:text-8xl font-black text-center mb-8 text-white">
            ダウトオセロ
          </h1>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            AIは時々ズルをします。怪しい手を見つけたら「DOUBT!」で勝利を掴め！
          </p>
          
          <div className="bg-gray-900 rounded-3xl p-8 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">難易度を選択</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'beginner', label: '初級', desc: 'AIは弱く、不正も少ない' },
                { key: 'intermediate', label: '中級', desc: 'バランスの取れた難易度' },
                { key: 'advanced', label: '上級', desc: 'AIは強く、不正も多い' },
                { key: 'extreme', label: '極限', desc: '最強AI、不正頻発' }
              ].map(({ key, label, desc }) => (
                <button
                  key={key}
                  onClick={() => handleDifficultySelect(key as Difficulty)}
                  className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl
                    transition-all duration-200 transform hover:scale-105
                    border border-gray-600 hover:border-gray-500"
                >
                  <div className="text-xl font-bold mb-2">{label}</div>
                  <div className="text-sm text-gray-400">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {(gameStats.totalGames > 0) && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-white">戦績</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{gameStats.totalGames}</div>
                  <div className="text-sm text-gray-400">試合数</div>
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
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-white mb-2">ダウトオセロ</h1>
        <div className="text-lg text-gray-300">
          難易度: {{
            beginner: '初級',
            intermediate: '中級', 
            advanced: '上級',
            extreme: '極限'
          }[gameState.difficulty]} | ターン: {turn}
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-700">
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gray-900 rounded-full border-2 border-gray-600"></div>
              <span className="text-2xl font-bold text-white">{gameState.blackCount}</span>
            </div>
            <p className="text-sm text-gray-400">あなた</p>
          </div>
          
          <span className="text-gray-500 text-2xl">VS</span>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-400"></div>
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
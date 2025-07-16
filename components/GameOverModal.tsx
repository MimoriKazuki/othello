'use client'

import { Player } from '@/types/game'

interface GameOverModalProps {
  winner: Player | 'draw' | null
  blackCount: number
  whiteCount: number
  onNewGame: () => void
  doubtSuccess?: number
}

export default function GameOverModal({ 
  winner, 
  blackCount, 
  whiteCount, 
  onNewGame,
  doubtSuccess = 0
}: GameOverModalProps) {
  if (!winner) return null

  const isPlayerWin = winner === 'black'
  const isDraw = winner === 'draw'

  const shareText = isPlayerWin 
    ? `ダウトオセロで勝利！🎉\n結果: ${blackCount} - ${whiteCount}\n${doubtSuccess > 0 ? `ダウト成功！ 🎯\n` : ''}`
    : isDraw
    ? `ダウトオセロで引き分け！🤝\n結果: ${blackCount} - ${whiteCount}`
    : `ダウトオセロで惜敗... 😢\n結果: ${blackCount} - ${whiteCount}`

  const handleShare = (platform: string) => {
    const gameUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const shareTextWithUrl = `${shareText}\n\n今すぐプレイ: ${gameUrl}`
    
    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextWithUrl)}&hashtags=ダウトオセロ,オセロ`,
          '_blank',
          'width=600,height=400'
        )
        break
      default:
        navigator.clipboard.writeText(shareTextWithUrl).then(() => {
          alert('結果をコピーしました！Instagramストーリーに貼り付けてシェアしてください。')
        })
        break
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-4 border-white rounded-3xl shadow-2xl p-10 max-w-md w-full animate-bounce-in">
        <h2 className="text-4xl font-black text-center mb-6 text-white">
          {isPlayerWin ? '勝利！' : isDraw ? '引き分け' : '敗北'}
        </h2>
        
        {blackCount > 0 && whiteCount === 0 && isPlayerWin && (
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-white">
              ダウト成功による勝利！
            </p>
          </div>
        )}
        
        <div className="text-center mb-8">
          <p className="text-2xl font-bold mb-6 text-gray-300">
            {isPlayerWin 
              ? 'おめでとうございます！' 
              : isDraw 
              ? '互角の勝負でした！' 
              : 'もう一度挑戦しましょう！'}
          </p>
          
          <div className="bg-black rounded-2xl p-6 border border-gray-600">
            <div className="flex justify-center items-center gap-10 text-3xl font-black">
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-900 rounded-full shadow-lg mb-2 border-2 border-gray-600"></div>
                  <span className="text-white text-4xl">{blackCount}</span>
                </div>
                <p className="text-base text-gray-400 font-semibold mt-2">あなた</p>
              </div>
              
              <span className="text-gray-500 text-4xl">VS</span>
              
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border-4 border-gray-400 rounded-full shadow-lg mb-2"></div>
                  <span className="text-white text-4xl">{whiteCount}</span>
                </div>
                <p className="text-base text-gray-400 font-semibold mt-2">CPU</p>
              </div>
            </div>
          </div>
        </div>

        {/* SNSシェアボタン */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <p className="text-sm text-gray-300 font-semibold mb-3 text-center">結果をシェア</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 px-6 transition-all duration-200 transform hover:scale-105 border border-gray-600"
              title="Xでシェア"
            >
              <span className="font-bold">X</span>
            </button>
            <button
              onClick={() => handleShare('instagram')}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 px-6 transition-all duration-200 transform hover:scale-105 border border-gray-600"
              title="Instagramでシェア"
            >
              <span className="font-bold">Instagram</span>
            </button>
          </div>
        </div>
        
        <button
          onClick={onNewGame}
          className="w-full py-4 px-8 bg-white text-black font-black rounded-xl
            hover:bg-gray-200 transition-all duration-200 text-xl shadow-lg
            transform hover:scale-105 active:scale-95"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  )
}
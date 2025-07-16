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
  const isDoubtWin = isPlayerWin && doubtSuccess > 0
  const isDoubtLoss = !isPlayerWin && !isDraw && blackCount > 0 && whiteCount > 0

  const shareText = isDoubtWin
    ? `【ダウトオセロ】\nAIの不正を見破った！🎯\n\n相手の不正を見抜く新感覚オセロゲーム！\nあなたもAIのズルを見破れるか？\n\nスコア: ${blackCount} - ${whiteCount}で勝利！`
    : isPlayerWin 
    ? `【ダウトオセロ】\n${blackCount} - ${whiteCount}で勝利！🎉\n\nAIが時々ズルをする新感覚オセロ！\n不正を見破れば一発逆転も！？\n\nあなたも挑戦してみませんか？`
    : isDoubtLoss
    ? `【ダウトオセロ】\nダウト失敗で敗北... 😱\n\nAIの正当な手を疑ってしまった！\n見極めが難しい新感覚オセロゲーム\n\nリベンジする？ ${blackCount} - ${whiteCount}`
    : isDraw
    ? `【ダウトオセロ】\n引き分け！🤝 ${blackCount} - ${whiteCount}\n\nAIが不正をする新感覚オセロ！\n次はダウトで一発逆転を狙おう！`
    : `【ダウトオセロ】\n${blackCount} - ${whiteCount}で惜敗... 😢\n\nでもAIの不正を見破れば逆転可能！\n新感覚オセロで頭脳バトル！\n\n今すぐリベンジ！`

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
        
        {isDoubtWin && (
          <p className="text-center text-xl font-bold text-yellow-400 mb-6">
            ダウト成功！
          </p>
        )}
        
        {isDoubtLoss && (
          <p className="text-center text-xl font-bold text-red-400 mb-6">
            ダウト失敗
          </p>
        )}
        
        <div className="text-center mb-8">
          <div className="bg-black rounded-2xl p-6 border border-gray-600">
            <div className="flex justify-center items-center gap-10 text-3xl font-black">
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-900 rounded-full shadow-lg mb-2 border-2 border-gray-600"></div>
                  <span className="text-white text-4xl">{blackCount}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">あなた</p>
              </div>
              
              <span className="text-gray-500 text-4xl">VS</span>
              
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border-4 border-gray-400 rounded-full shadow-lg mb-2"></div>
                  <span className="text-white text-4xl">{whiteCount}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">CPU</p>
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
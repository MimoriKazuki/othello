'use client'

import { useState, useCallback, useEffect } from 'react'
import { GameState, Position, ValidMove, Difficulty, CheatAction } from '@/types/game'
import {
  createInitialBoard,
  getValidMoves,
  makeMove,
  countStones,
  isGameOver,
  getWinner,
  getOpponentColor
} from '@/utils/gameLogic'
import { getAIMove } from '@/utils/ai'
import { shouldCheat, performCheat, detectCheat } from '@/utils/cheating'
import { useAuth } from './useAuth'
import { updateUserStats } from '@/lib/db'

export function useGameState() {
  const { user } = useAuth()
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    successfulDoubts: 0
  })
  const [difficultyStats, setDifficultyStats] = useState<any>(null)
  
  const [gameStarted, setGameStarted] = useState(false)
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'black',
    blackCount: 2,
    whiteCount: 2,
    lastMove: null,
    isGameOver: false,
    winner: null,
    difficulty: 'beginner',
    cheatingHistory: [],
    doubtSuccess: 0,
    isPlayerTurn: true
  })

  const [turn, setTurn] = useState(1)
  const [message, setMessage] = useState('あなたのターンです')
  const [lastCheat, setLastCheat] = useState<CheatAction | null>(null)
  const [boardBeforeAI, setBoardBeforeAI] = useState(gameState.board)

  const updateGameState = useCallback((board: typeof gameState.board, nextPlayer: 'black' | 'white' | null, lastMove: Position | null) => {
    const { black, white } = countStones(board)
    const gameOver = isGameOver(board)
    
    setGameState(prev => ({
      ...prev,
      board,
      currentPlayer: nextPlayer || prev.currentPlayer,
      blackCount: black,
      whiteCount: white,
      lastMove,
      isGameOver: gameOver,
      winner: gameOver ? getWinner(board) : null,
      isPlayerTurn: nextPlayer === 'black'
    }))
  }, [])

  const handlePlayerMove = useCallback((row: number, col: number) => {
    if (!gameState.isPlayerTurn || gameState.isGameOver) return

    const validMoves = getValidMoves(gameState.board, 'black')
    const move = validMoves.find(m => m.row === row && m.col === col)
    
    if (!move) return

    const newBoard = makeMove(gameState.board, move, 'black')
    setBoardBeforeAI(newBoard)
    
    const whiteMoves = getValidMoves(newBoard, 'white')
    const nextPlayer = whiteMoves.length > 0 ? 'white' : 'black'
    
    updateGameState(newBoard, nextPlayer, { row, col })
    setTurn(prev => prev + 1)
    
    if (nextPlayer === 'white') {
      setMessage('CPUが考えています...')
    } else {
      setMessage('CPUの手がありません。あなたのターンです。')
    }
  }, [gameState.board, gameState.isPlayerTurn, gameState.isGameOver, updateGameState])

  const handleAIMove = useCallback(() => {
    if (gameState.currentPlayer !== 'white' || gameState.isGameOver) return

    setTimeout(() => {
      const aiMove = getAIMove(gameState.board, gameState.difficulty)
      if (!aiMove) {
        const blackMoves = getValidMoves(gameState.board, 'black')
        const nextPlayer = blackMoves.length > 0 ? 'black' : 'white'
        updateGameState(gameState.board, nextPlayer, null)
        setMessage(nextPlayer === 'black' ? 'あなたのターンです' : 'ゲーム終了')
        return
      }

      let newBoard: typeof gameState.board
      let cheatAction: CheatAction | null = null

      if (shouldCheat(gameState.difficulty, turn)) {
        const cheatResult = performCheat(gameState.board, aiMove, turn, gameState.difficulty)
        newBoard = cheatResult.newBoard
        cheatAction = cheatResult.cheatAction
        setLastCheat(cheatAction)
        
        setGameState(prev => ({
          ...prev,
          cheatingHistory: [...prev.cheatingHistory, cheatAction!]
        }))
      } else {
        newBoard = makeMove(gameState.board, aiMove, 'white')
        setLastCheat(null)
      }

      const blackMoves = getValidMoves(newBoard, 'black')
      const nextPlayer = blackMoves.length > 0 ? 'black' : 'white'
      
      updateGameState(newBoard, nextPlayer, { row: aiMove.row, col: aiMove.col })
      setTurn(prev => prev + 1)
      
      if (nextPlayer === 'black') {
        setMessage('あなたのターンです')
      } else {
        setMessage('あなたの手がありません。CPUのターンです。')
      }
    }, 1000)
  }, [gameState.board, gameState.currentPlayer, gameState.isGameOver, gameState.difficulty, turn, updateGameState])

  const handleDoubt = useCallback(() => {
    if (!gameState.isPlayerTurn) return

    if (lastCheat) {
      // ダウト成功！AIが不正をしていた - プレイヤーの勝利
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        winner: 'black',
        doubtSuccess: prev.doubtSuccess + 1
      }))

      // ランダムな演出メッセージを選択
      const messages = [
        '🎉 ブラボー！AIの悪巧みを見破りました！あなたの完璧な勝利です！',
        '🕵️ 名探偵登場！AIの不正を暴きました！真実はいつもひとつ！',
        '⚔️ 正義の剣がAIの闇を断ち切った！あなたが真のチャンピオンです！',
        '🎭 AI「バレたか…まさか気づかれるとは…」あなたの勝利です！',
        '🎆 ダウト成功！AIが震え上がっています！完璧なプレイでした！',
        '🏆 見事！AIのズルを発見！あなたの洞察力の勝利です！',
        '🚀 AI「マサカ...人間に見破られるなんて...」大勝利です！',
        '⚡ 電撃的勝利！AIの不正はあなたの前では無力でした！'
      ]
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setMessage(randomMessage)
      
      // 勝利エフェクトを追加
      if (typeof window !== 'undefined') {
        // 背景を一瞬金色に
        const body = document.body
        body.style.transition = 'background-color 0.5s'
        const originalBg = body.style.backgroundColor
        body.style.backgroundColor = '#ffd700'
        setTimeout(() => {
          body.style.backgroundColor = originalBg
        }, 500)
        
        // 紙吹雪エフェクト（簡易版）
        for (let i = 0; i < 20; i++) {
          const confetti = document.createElement('div')
          confetti.textContent = ['🎉', '🎆', '✨', '🎊'][Math.floor(Math.random() * 4)]
          confetti.style.position = 'fixed'
          confetti.style.left = Math.random() * 100 + '%'
          confetti.style.top = '-20px'
          confetti.style.fontSize = '30px'
          confetti.style.zIndex = '9999'
          confetti.style.transition = 'all 2s ease-out'
          confetti.style.pointerEvents = 'none'
          document.body.appendChild(confetti)
          
          // アニメーション
          setTimeout(() => {
            confetti.style.top = '100vh'
            confetti.style.transform = `rotate(${Math.random() * 720}deg)`
            confetti.style.opacity = '0'
          }, 10)
          
          // 削除
          setTimeout(() => {
            confetti.remove()
          }, 2000)
        }
      }
      
      // 統計を更新
      setGameStats(prev => {
        const newStats = {
          ...prev,
          totalGames: prev.totalGames + 1,
          wins: prev.wins + 1,
          successfulDoubts: prev.successfulDoubts + 1
        }
        localStorage.setItem('othelloStats', JSON.stringify(newStats))
        return newStats
      })
      
      // ログインユーザーの場合はDBにも保存
      if (user) {
        updateUserStats(user.id, 'win', true, gameState.difficulty)
      }
    } else {
      // ダウト失敗！AIは正当な手を打っていた - プレイヤーの負け
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        winner: 'white'
      }))

      setMessage('ダウト失敗！ AIは正当な手を打っていました。あなたの負けです。')
      
      // 統計を更新
      setGameStats(prev => {
        const newStats = {
          ...prev,
          totalGames: prev.totalGames + 1,
          losses: prev.losses + 1
        }
        localStorage.setItem('othelloStats', JSON.stringify(newStats))
        return newStats
      })
      
      // ログインユーザーの場合はDBにも保存
      if (user) {
        updateUserStats(user.id, 'loss', false, gameState.difficulty)
      }
    }
  }, [lastCheat, gameState.isPlayerTurn, user])

  const startNewGame = useCallback((difficulty: Difficulty) => {
    const initialBoard = createInitialBoard()
    setGameState({
      board: initialBoard,
      currentPlayer: 'black',
      blackCount: 2,
      whiteCount: 2,
      lastMove: null,
      isGameOver: false,
      winner: null,
      difficulty,
      cheatingHistory: [],
      doubtSuccess: 0,
      isPlayerTurn: true
    })
    setTurn(1)
    setMessage('あなたのターンです')
    setGameStarted(true)
    setLastCheat(null)
    setBoardBeforeAI(initialBoard)
  }, [])

  // ゲーム終了時の統計更新
  useEffect(() => {
    if (gameState.isGameOver && gameState.winner !== null && gameStarted) {
      const updateStats = () => {
        const result = gameState.winner === 'black' ? 'win' : 
                       gameState.winner === 'white' ? 'loss' : 'draw'
        
        if (result === 'win') {
          setGameStats(prev => {
            const newStats = { ...prev, totalGames: prev.totalGames + 1, wins: prev.wins + 1 }
            localStorage.setItem('othelloStats', JSON.stringify(newStats))
            return newStats
          })
          if (user) {
            updateUserStats(user.id, 'win', gameState.doubtSuccess > 0, gameState.difficulty)
          }
        } else if (result === 'loss') {
          setGameStats(prev => {
            const newStats = { ...prev, totalGames: prev.totalGames + 1, losses: prev.losses + 1 }
            localStorage.setItem('othelloStats', JSON.stringify(newStats))
            return newStats
          })
          if (user) {
            updateUserStats(user.id, 'loss', false, gameState.difficulty)
          }
        } else if (result === 'draw') {
          setGameStats(prev => {
            const newStats = { ...prev, totalGames: prev.totalGames + 1, draws: prev.draws + 1 }
            localStorage.setItem('othelloStats', JSON.stringify(newStats))
            return newStats
          })
          if (user) {
            updateUserStats(user.id, 'draw', false, gameState.difficulty)
          }
        }
      }
      
      updateStats()
    }
  }, [gameState.isGameOver, gameState.winner, gameStarted, user, gameState.doubtSuccess])

  // 統計の読み込み
  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        // ログインユーザーの場合はDBから読み込み
        try {
          const { getUserStats, getUserDifficultyStats } = await import('@/lib/db')
          console.log('Loading stats for user:', user.id)
          const [stats, diffStats] = await Promise.all([
            getUserStats(user.id),
            getUserDifficultyStats(user.id)
          ])
          console.log('Loaded stats:', { stats, diffStats })
          
          if (stats) {
            setGameStats({
              totalGames: stats.totalGames,
              wins: stats.wins,
              losses: stats.losses,
              draws: stats.draws,
              successfulDoubts: stats.successfulDoubts
            })
          }
          
          if (diffStats) {
            setDifficultyStats(diffStats)
          }
        } catch (error) {
          console.error('Failed to load user stats:', error)
        }
      } else {
        // 未ログインの場合はローカルストレージから読み込み
        const saved = localStorage.getItem('othelloStats')
        if (saved) {
          try {
            setGameStats(JSON.parse(saved))
          } catch (e) {
            console.error('Failed to parse game stats:', e)
          }
        }
        // 未ログインユーザーは難易度別統計はnull
        setDifficultyStats(null)
      }
    }
    
    loadStats()
  }, [user])

  // AI moves
  useEffect(() => {
    if (gameState.currentPlayer === 'white' && !gameState.isGameOver) {
      handleAIMove()
    }
  }, [gameState.currentPlayer, gameState.isGameOver, handleAIMove])

  const validMoves = getValidMoves(gameState.board, gameState.currentPlayer)

  return {
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
  }
}
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

export function useGameState() {
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    successfulDoubts: 0
  })
  
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
        const cheatResult = performCheat(gameState.board, aiMove, turn)
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
    if (!lastCheat || gameState.currentPlayer !== 'black') return

    // ダウト成功
    const newBoard = createInitialBoard()
    newBoard.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        if (boardBeforeAI[rowIndex][colIndex]) {
          newBoard[rowIndex][colIndex] = boardBeforeAI[rowIndex][colIndex]
        }
      })
    })

    // AIの石をすべて取る
    newBoard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 'white') {
          newBoard[rowIndex][colIndex] = 'black'
        }
      })
    })

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      isGameOver: true,
      winner: 'black',
      doubtSuccess: prev.doubtSuccess + 1,
      blackCount: 64,
      whiteCount: 0
    }))

    setMessage('ダウト成功！ あなたの勝利です！')
    
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
  }, [lastCheat, gameState.currentPlayer, boardBeforeAI])

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
        } else if (result === 'loss') {
          setGameStats(prev => {
            const newStats = { ...prev, totalGames: prev.totalGames + 1, losses: prev.losses + 1 }
            localStorage.setItem('othelloStats', JSON.stringify(newStats))
            return newStats
          })
        } else if (result === 'draw') {
          setGameStats(prev => {
            const newStats = { ...prev, totalGames: prev.totalGames + 1, draws: prev.draws + 1 }
            localStorage.setItem('othelloStats', JSON.stringify(newStats))
            return newStats
          })
        }
      }
      
      updateStats()
    }
  }, [gameState.isGameOver, gameState.winner, gameStarted])

  // 統計の読み込み
  useEffect(() => {
    const saved = localStorage.getItem('othelloStats')
    if (saved) {
      try {
        setGameStats(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse game stats:', e)
      }
    }
  }, [])

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
    gameStarted,
    turn,
    message,
    validMoves,
    handlePlayerMove,
    handleDoubt,
    startNewGame
  }
}
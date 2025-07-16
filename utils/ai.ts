import { CellState, Player, ValidMove, Difficulty } from '@/types/game'
import { getValidMoves, countStones, makeMove, getOpponentColor } from './gameLogic'

export function getAIMove(board: CellState[][], difficulty: Difficulty): ValidMove | null {
  const validMoves = getValidMoves(board, 'white')
  
  if (validMoves.length === 0) return null
  
  switch (difficulty) {
    case 'beginner':
      return getRandomMove(validMoves)
    case 'intermediate':
      return getCornerOrRandomMove(board, validMoves)
    case 'advanced':
      return getBestMove(board, validMoves, 2)
    case 'extreme':
      return getBestMove(board, validMoves, 4)
    default:
      return getRandomMove(validMoves)
  }
}

function getRandomMove(validMoves: ValidMove[]): ValidMove {
  return validMoves[Math.floor(Math.random() * validMoves.length)]
}

function getCornerOrRandomMove(board: CellState[][], validMoves: ValidMove[]): ValidMove {
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: 7 },
    { row: 7, col: 0 },
    { row: 7, col: 7 }
  ]
  
  const cornerMoves = validMoves.filter(move => 
    corners.some(corner => corner.row === move.row && corner.col === move.col)
  )
  
  if (cornerMoves.length > 0) {
    return getRandomMove(cornerMoves)
  }
  
  return getRandomMove(validMoves)
}

function getBestMove(board: CellState[][], validMoves: ValidMove[], depth: number): ValidMove {
  let bestMove = validMoves[0]
  let bestScore = -Infinity
  
  for (const move of validMoves) {
    const newBoard = makeMove(board, move, 'white')
    const score = minimax(newBoard, depth - 1, false, -Infinity, Infinity)
    
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  
  return bestMove
}

function minimax(
  board: CellState[][],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  if (depth === 0) {
    return evaluateBoard(board)
  }
  
  const player: Player = isMaximizing ? 'white' : 'black'
  const validMoves = getValidMoves(board, player)
  
  if (validMoves.length === 0) {
    return evaluateBoard(board)
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of validMoves) {
      const newBoard = makeMove(board, move, player)
      const eval_ = minimax(newBoard, depth - 1, false, alpha, beta)
      maxEval = Math.max(maxEval, eval_)
      alpha = Math.max(alpha, eval_)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of validMoves) {
      const newBoard = makeMove(board, move, player)
      const eval_ = minimax(newBoard, depth - 1, true, alpha, beta)
      minEval = Math.min(minEval, eval_)
      beta = Math.min(beta, eval_)
      if (beta <= alpha) break
    }
    return minEval
  }
}

function evaluateBoard(board: CellState[][]): number {
  const { black, white } = countStones(board)
  
  // 基本的な石の数の差
  let score = white - black
  
  // 角の価値を高く評価
  const corners = [
    [0, 0], [0, 7], [7, 0], [7, 7]
  ]
  
  for (const [row, col] of corners) {
    if (board[row][col] === 'white') score += 10
    else if (board[row][col] === 'black') score -= 10
  }
  
  // 辺の価値を評価
  const edges = [
    [0, 2], [0, 3], [0, 4], [0, 5],
    [7, 2], [7, 3], [7, 4], [7, 5],
    [2, 0], [3, 0], [4, 0], [5, 0],
    [2, 7], [3, 7], [4, 7], [5, 7]
  ]
  
  for (const [row, col] of edges) {
    if (board[row][col] === 'white') score += 3
    else if (board[row][col] === 'black') score -= 3
  }
  
  return score
}
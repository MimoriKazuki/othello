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
      return getExtremeMove(board, validMoves)
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

function getExtremeMove(board: CellState[][], validMoves: ValidMove[]): ValidMove {
  let bestMove = validMoves[0]
  let bestScore = -Infinity
  
  // 極限まで深い探索とより高度な評価
  for (const move of validMoves) {
    const newBoard = makeMove(board, move, 'white')
    const score = minimaxExtreme(newBoard, 12, false, -Infinity, Infinity)
    
    // ゲーム序盤・中盤の特別な戦略
    const gamePhase = getGamePhase(board)
    const positionScore = evaluatePosition(move, gamePhase, board)
    const finalScore = score + positionScore
    
    if (finalScore > bestScore) {
      bestScore = finalScore
      bestMove = move
    }
  }
  
  return bestMove
}

function minimaxExtreme(
  board: CellState[][],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  if (depth === 0) {
    return evaluateBoardUltimate(board)
  }
  
  const player: Player = isMaximizing ? 'white' : 'black'
  const validMoves = getValidMoves(board, player)
  
  if (validMoves.length === 0) {
    // パスの場合は相手のターンで評価
    const opponent = getOpponentColor(player)
    const opponentMoves = getValidMoves(board, opponent)
    if (opponentMoves.length === 0) {
      // ゲーム終了
      return evaluateBoardUltimate(board) * 1000
    }
    return -minimaxExtreme(board, depth - 1, !isMaximizing, alpha, beta)
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of validMoves) {
      const newBoard = makeMove(board, move, player)
      const eval_ = minimaxExtreme(newBoard, depth - 1, false, alpha, beta)
      maxEval = Math.max(maxEval, eval_)
      alpha = Math.max(alpha, eval_)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of validMoves) {
      const newBoard = makeMove(board, move, player)
      const eval_ = minimaxExtreme(newBoard, depth - 1, true, alpha, beta)
      minEval = Math.min(minEval, eval_)
      beta = Math.min(beta, eval_)
      if (beta <= alpha) break
    }
    return minEval
  }
}

function evaluateBoardUltimate(board: CellState[][]): number {
  const { black, white } = countStones(board)
  let score = 0
  
  // ゲームフェーズに応じた評価戦略
  const totalStones = black + white
  const gameProgress = totalStones / 64
  
  // 序盤〜中盤は石の数を少なく保つ戦略
  if (gameProgress < 0.7) {
    score = -1 * (white - black)
  } else if (gameProgress < 0.85) {
    score = 0.5 * (white - black)
  } else {
    // 終盤は石を多く取る
    score = 10 * (white - black)
  }
  
  // 位置評価マトリックス（究極版）
  const positionValues = [
    [1000, -300,  50,  10,  10,  50, -300, 1000],
    [-300, -500, -20, -20, -20, -20, -500, -300],
    [  50,  -20,   5,   1,   1,   5,  -20,   50],
    [  10,  -20,   1,   0,   0,   1,  -20,   10],
    [  10,  -20,   1,   0,   0,   1,  -20,   10],
    [  50,  -20,   5,   1,   1,   5,  -20,   50],
    [-300, -500, -20, -20, -20, -20, -500, -300],
    [1000, -300,  50,  10,  10,  50, -300, 1000]
  ]
  
  // 各マスの価値を評価
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === 'white') {
        score += positionValues[row][col]
      } else if (board[row][col] === 'black') {
        score -= positionValues[row][col]
      }
    }
  }
  
  // 安定石（絶対に取られない石）の評価
  const whiteStable = countStableStones(board, 'white')
  const blackStable = countStableStones(board, 'black')
  score += (whiteStable - blackStable) * 50
  
  // 可動性（次に打てる手の数）の評価
  const whiteMobility = getValidMoves(board, 'white').length
  const blackMobility = getValidMoves(board, 'black').length
  score += (whiteMobility - blackMobility) * 20
  
  // エッジの制御
  score += evaluateEdgeControl(board) * 30
  
  // パリティ（最後に打つ権利）の評価
  const emptyCount = board.flat().filter(cell => cell === null).length
  if (emptyCount < 20 && emptyCount % 2 === 0) {
    score += 100 // 白が最後に打てる
  }
  
  return score
}

function getGamePhase(board: CellState[][]): 'opening' | 'midgame' | 'endgame' {
  const { black, white } = countStones(board)
  const totalStones = black + white
  
  if (totalStones < 20) return 'opening'
  if (totalStones < 50) return 'midgame'
  return 'endgame'
}

function evaluatePosition(move: ValidMove, phase: 'opening' | 'midgame' | 'endgame', board: CellState[][]): number {
  let score = 0
  
  // 角を取る手は常に最優先
  const corners = [[0, 0], [0, 7], [7, 0], [7, 7]]
  if (corners.some(([r, c]) => r === move.row && c === move.col)) {
    return 5000
  }
  
  // 角の隣（C-square、X-square）は避ける
  const dangerousSquares = [
    [0, 1], [1, 0], [1, 1], // 左上角の周辺
    [0, 6], [1, 6], [1, 7], // 右上角の周辺
    [6, 0], [6, 1], [7, 1], // 左下角の周辺
    [6, 6], [6, 7], [7, 6]  // 右下角の周辺
  ]
  
  if (dangerousSquares.some(([r, c]) => r === move.row && c === move.col)) {
    // 対応する角が既に自分の石なら問題ない
    const cornerMap: { [key: string]: [number, number] } = {
      '0,1': [0, 0], '1,0': [0, 0], '1,1': [0, 0],
      '0,6': [0, 7], '1,6': [0, 7], '1,7': [0, 7],
      '6,0': [7, 0], '6,1': [7, 0], '7,1': [7, 0],
      '6,6': [7, 7], '6,7': [7, 7], '7,6': [7, 7]
    }
    const corner = cornerMap[`${move.row},${move.col}`]
    if (corner && board[corner[0]][corner[1]] !== 'white') {
      score -= phase === 'opening' ? 1000 : 500
    }
  }
  
  // 辺の良い位置を評価
  const goodEdges = [
    [0, 3], [0, 4], [3, 0], [4, 0],
    [3, 7], [4, 7], [7, 3], [7, 4]
  ]
  if (goodEdges.some(([r, c]) => r === move.row && c === move.col)) {
    score += 100
  }
  
  // 危険な辺の位置を避ける
  const badEdges = [
    [0, 2], [0, 5], [2, 0], [5, 0],
    [2, 7], [5, 7], [7, 2], [7, 5]
  ]
  if (badEdges.some(([r, c]) => r === move.row && c === move.col)) {
    // 対応する角が空いている場合のみペナルティ
    const edgeCornerMap: { [key: string]: [number, number] } = {
      '0,2': [0, 0], '0,5': [0, 7],
      '2,0': [0, 0], '5,0': [7, 0],
      '2,7': [0, 7], '5,7': [7, 7],
      '7,2': [7, 0], '7,5': [7, 7]
    }
    const corner = edgeCornerMap[`${move.row},${move.col}`]
    if (corner && board[corner[0]][corner[1]] === null) {
      score -= 300
    }
  }
  
  // 序盤は中央付近を避ける
  if (phase === 'opening') {
    const centerDistance = Math.abs(move.row - 3.5) + Math.abs(move.col - 3.5)
    score += centerDistance * 20
  }
  
  // 終盤は確実な石数確保を優先
  if (phase === 'endgame') {
    const newBoard = makeMove(board, move, 'white')
    const futureFlips = move.flippedPositions.length
    score += futureFlips * 50
  }
  
  return score
}

function countStableStones(board: CellState[][], player: Player): number {
  let count = 0
  
  // 簡易的に角から連続する石を安定石とみなす
  const corners = [
    { row: 0, col: 0, dRow: 1, dCol: 1 },
    { row: 0, col: 7, dRow: 1, dCol: -1 },
    { row: 7, col: 0, dRow: -1, dCol: 1 },
    { row: 7, col: 7, dRow: -1, dCol: -1 }
  ]
  
  for (const corner of corners) {
    if (board[corner.row][corner.col] === player) {
      count++
      
      // 角から辺に沿って安定石を数える
      // 横方向
      let col = corner.col + corner.dCol
      while (col >= 0 && col < 8 && board[corner.row][col] === player) {
        count++
        col += corner.dCol
      }
      
      // 縦方向
      let row = corner.row + corner.dRow
      while (row >= 0 && row < 8 && board[row][corner.col] === player) {
        count++
        row += corner.dRow
      }
    }
  }
  
  return count
}

function evaluateEdgeControl(board: CellState[][]): number {
  let score = 0
  
  // 上辺
  for (let col = 0; col < 8; col++) {
    if (board[0][col] === 'white') score += 2
    else if (board[0][col] === 'black') score -= 2
  }
  
  // 下辺
  for (let col = 0; col < 8; col++) {
    if (board[7][col] === 'white') score += 2
    else if (board[7][col] === 'black') score -= 2
  }
  
  // 左辺
  for (let row = 1; row < 7; row++) {
    if (board[row][0] === 'white') score += 2
    else if (board[row][0] === 'black') score -= 2
  }
  
  // 右辺
  for (let row = 1; row < 7; row++) {
    if (board[row][7] === 'white') score += 2
    else if (board[row][7] === 'black') score -= 2
  }
  
  return score
}

function evaluateBlocking(board: CellState[][], move: ValidMove): number {
  let blockingScore = 0
  const newBoard = makeMove(board, move, 'white')
  
  // プレイヤーの次の手を分析
  const playerMoves = getValidMoves(newBoard, 'black')
  
  // プレイヤーが角を取れる場合、それをブロック
  const corners = [[0, 0], [0, 7], [7, 0], [7, 7]]
  for (const playerMove of playerMoves) {
    if (corners.some(([r, c]) => r === playerMove.row && c === playerMove.col)) {
      // この手でプレイヤーが角を取れなくなるかチェック
      const blockedCorner = !playerMoves.some(m => 
        corners.some(([r, c]) => r === m.row && c === m.col)
      )
      if (blockedCorner) {
        blockingScore += 2000
      }
    }
  }
  
  // プレイヤーの選択肢を減らす
  const currentPlayerMoves = getValidMoves(board, 'black').length
  const afterPlayerMoves = playerMoves.length
  
  if (afterPlayerMoves === 0) {
    blockingScore += 1000 // パスを強制
  } else if (afterPlayerMoves < currentPlayerMoves) {
    blockingScore += (currentPlayerMoves - afterPlayerMoves) * 100
  }
  
  // プレイヤーの良い手を制限
  let goodMovesBlocked = 0
  for (const playerMove of playerMoves) {
    const moveScore = evaluatePosition(playerMove, getGamePhase(newBoard), newBoard)
    if (moveScore < 0) {
      goodMovesBlocked++
    }
  }
  blockingScore += goodMovesBlocked * 50
  
  return blockingScore
}
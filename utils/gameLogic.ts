import { CellState, Player, Position, ValidMove } from '@/types/game'

export function createInitialBoard(): CellState[][] {
  const board: CellState[][] = Array(8).fill(null).map(() => Array(8).fill(null))
  
  // 初期配置
  board[3][3] = 'white'
  board[3][4] = 'black'
  board[4][3] = 'black'
  board[4][4] = 'white'
  
  return board
}

export function getOpponentColor(player: Player): Player {
  return player === 'black' ? 'white' : 'black'
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

export function getValidMoves(board: CellState[][], player: Player): ValidMove[] {
  const validMoves: ValidMove[] = []
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ]

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] !== null) continue

      const flippedPositions: Position[] = []

      for (const [dRow, dCol] of directions) {
        const tempFlipped: Position[] = []
        let currentRow = row + dRow
        let currentCol = col + dCol

        while (isValidPosition(currentRow, currentCol) && 
               board[currentRow][currentCol] === getOpponentColor(player)) {
          tempFlipped.push({ row: currentRow, col: currentCol })
          currentRow += dRow
          currentCol += dCol
        }

        if (isValidPosition(currentRow, currentCol) && 
            board[currentRow][currentCol] === player && 
            tempFlipped.length > 0) {
          flippedPositions.push(...tempFlipped)
        }
      }

      if (flippedPositions.length > 0) {
        validMoves.push({ row, col, flippedPositions })
      }
    }
  }

  return validMoves
}

export function makeMove(board: CellState[][], move: ValidMove, player: Player): CellState[][] {
  const newBoard = board.map(row => [...row])
  
  // 石を置く
  newBoard[move.row][move.col] = player
  
  // 石をひっくり返す
  move.flippedPositions.forEach(pos => {
    newBoard[pos.row][pos.col] = player
  })
  
  return newBoard
}

export function countStones(board: CellState[][]): { black: number; white: number } {
  let black = 0
  let white = 0
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === 'black') black++
      else if (board[row][col] === 'white') white++
    }
  }
  
  return { black, white }
}

export function isGameOver(board: CellState[][]): boolean {
  const blackMoves = getValidMoves(board, 'black')
  const whiteMoves = getValidMoves(board, 'white')
  
  return blackMoves.length === 0 && whiteMoves.length === 0
}

export function getWinner(board: CellState[][]): Player | 'draw' | null {
  if (!isGameOver(board)) return null
  
  const { black, white } = countStones(board)
  
  if (black > white) return 'black'
  if (white > black) return 'white'
  return 'draw'
}
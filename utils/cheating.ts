import { CellState, Player, ValidMove, Difficulty, CheatAction, Position } from '@/types/game'
import { getValidMoves, makeMove, getOpponentColor } from './gameLogic'

export function shouldCheat(difficulty: Difficulty, turn: number): boolean {
  const cheatProbability = {
    beginner: 0.1,
    intermediate: 0.2,
    advanced: 0.3,
    extreme: 0.4
  }
  
  // 序盤は不正しにくく、中盤以降に不正しやすくする
  const turnMultiplier = Math.min(turn / 10, 1)
  const probability = cheatProbability[difficulty] * turnMultiplier
  
  return Math.random() < probability
}

export function performCheat(
  board: CellState[][],
  validMove: ValidMove,
  turn: number
): { newBoard: CellState[][]; cheatAction: CheatAction } {
  const cheatTypes = ['extra_flip', 'skip_flip']
  const cheatType = cheatTypes[Math.floor(Math.random() * cheatTypes.length)]
  
  let newBoard = board.map(row => [...row])
  let cheatAction: CheatAction
  
  // 石を置く
  newBoard[validMove.row][validMove.col] = 'white'
  
  if (cheatType === 'extra_flip') {
    // 正規の石をひっくり返す
    validMove.flippedPositions.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    // 追加で不正に石をひっくり返す
    const extraFlips = findExtraFlips(newBoard, validMove)
    extraFlips.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    cheatAction = {
      turn,
      type: 'extra_flip',
      position: validMove,
      description: `追加で${extraFlips.length}個の石を不正にひっくり返しました`
    }
  } else {
    // 一部の石をひっくり返さない
    const skipCount = Math.min(Math.floor(validMove.flippedPositions.length / 2), 2)
    const flipsToPerform = validMove.flippedPositions.slice(0, -skipCount)
    
    flipsToPerform.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    cheatAction = {
      turn,
      type: 'skip_flip',
      position: validMove,
      description: `${skipCount}個の石をひっくり返すのを忘れました`
    }
  }
  
  return { newBoard, cheatAction }
}

function findExtraFlips(board: CellState[][], move: ValidMove): Position[] {
  const extraFlips: Position[] = []
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ]
  
  // 隣接する黒い石を探して不正にひっくり返す
  for (const [dRow, dCol] of directions) {
    const checkRow = move.row + dRow
    const checkCol = move.col + dCol
    
    if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8 &&
        board[checkRow][checkCol] === 'black' &&
        !move.flippedPositions.some(pos => pos.row === checkRow && pos.col === checkCol)) {
      extraFlips.push({ row: checkRow, col: checkCol })
      break // 1つだけ追加で不正する
    }
  }
  
  return extraFlips
}

export function detectCheat(
  originalBoard: CellState[][],
  newBoard: CellState[][],
  validMove: ValidMove
): boolean {
  // 正しい手を実行した場合のボードを計算
  const correctBoard = makeMove(originalBoard, validMove, 'white')
  
  // 実際のボードと比較
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (correctBoard[row][col] !== newBoard[row][col]) {
        return true // 不正が検出された
      }
    }
  }
  
  return false
}
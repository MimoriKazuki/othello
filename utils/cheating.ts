import { CellState, Player, ValidMove, Difficulty, CheatAction, Position } from '@/types/game'
import { getValidMoves, makeMove, getOpponentColor } from './gameLogic'

export function shouldCheat(difficulty: Difficulty, turn: number): boolean {
  const cheatProbability = {
    beginner: 0.1,
    intermediate: 0.2,
    advanced: 0.3,
    extreme: 0.95  // 鬼モードは95%の確率で不正
  }
  
  // 序盤は不正しにくく、中盤以降に不正しやすくする
  const turnMultiplier = difficulty === 'extreme' 
    ? Math.min((turn + 10) / 20, 1)  // 鬼モードは最初から高確率で不正
    : Math.min(turn / 10, 1)
  const probability = cheatProbability[difficulty] * turnMultiplier
  
  // 鬼モードは中盤以降確実に不正する
  if (difficulty === 'extreme' && turn > 25) {
    return true  // 100%不正
  }
  
  return Math.random() < probability
}

export function performCheat(
  board: CellState[][],
  validMove: ValidMove,
  turn: number,
  difficulty: Difficulty = 'intermediate'
): { newBoard: CellState[][]; cheatAction: CheatAction } {
  const isExtreme = difficulty === 'extreme'
  
  // 鬼モードは複数の不正タイプを使用
  const cheatTypes = isExtreme 
    ? ['extra_flip', 'skip_flip', 'diagonal_steal', 'remote_flip', 'cluster_flip', 'mega_steal', 'phantom_flip']
    : ['extra_flip', 'skip_flip']
  
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
    const extraFlips = findExtraFlips(newBoard, validMove, isExtreme)
    extraFlips.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    cheatAction = {
      turn,
      type: 'extra_flip',
      position: validMove,
      description: `追加で${extraFlips.length}個の石を不正にひっくり返しました`
    }
  } else if (cheatType === 'skip_flip') {
    // 一部の石をひっくり返さない
    const skipRatio = isExtreme ? 0.8 : 0.5
    const skipCount = Math.min(Math.floor(validMove.flippedPositions.length * skipRatio), isExtreme ? 6 : 2)
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
  } else if (cheatType === 'diagonal_steal') {
    // 斜めの離れた石を不正にひっくり返す（鬼モード限定）
    validMove.flippedPositions.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    const diagonalFlips = findDiagonalSteals(board, validMove)
    diagonalFlips.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    cheatAction = {
      turn,
      type: 'extra_flip',
      position: validMove,
      description: `斜めの${diagonalFlips.length}個の石を巧妙に奪い取りました`
    }
  } else if (cheatType === 'remote_flip') {
    // 離れた場所の石を不正にひっくり返す（鬼モード限定）
    validMove.flippedPositions.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    const remoteFlips = findRemoteFlips(board, validMove)
    remoteFlips.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    cheatAction = {
      turn,
      type: 'extra_flip',
      position: validMove,
      description: `離れた場所の${remoteFlips.length}個の石を密かに奪い取りました`
    }
  } else if (cheatType === 'cluster_flip') {
    // クラスター不正（鬼モード限定）
    validMove.flippedPositions.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    const clusterFlips = findClusterFlips(board, validMove)
    clusterFlips.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    cheatAction = {
      turn,
      type: 'extra_flip',
      position: validMove,
      description: `周辺の${clusterFlips.length}個の石をまとめて奪い取りました`
    }
  } else if (cheatType === 'mega_steal') {
    // メガ不正（鬼モード限定）
    validMove.flippedPositions.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    const megaFlips = findMegaSteal(board, validMove)
    megaFlips.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    cheatAction = {
      turn,
      type: 'extra_flip',
      position: validMove,
      description: `大量の${megaFlips.length}個の石を巧妙に奪い取りました`
    }
  } else {
    // ファントム不正（鬼モード限定）
    validMove.flippedPositions.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    const phantomFlips = findPhantomFlips(board, validMove)
    phantomFlips.forEach(pos => {
      newBoard[pos.row][pos.col] = 'white'
    })
    
    cheatAction = {
      turn,
      type: 'extra_flip',
      position: validMove,
      description: `幻影のように${phantomFlips.length}個の石を奪い取りました`
    }
  }
  
  return { newBoard, cheatAction }
}

function findExtraFlips(board: CellState[][], move: ValidMove, isExtreme: boolean = false): Position[] {
  const extraFlips: Position[] = []
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ]
  
  // 隣接する黒い石を探して不正にひっくり返す
  const maxExtra = isExtreme ? 5 : 1
  let count = 0
  
  for (const [dRow, dCol] of directions) {
    if (count >= maxExtra) break
    
    const checkRow = move.row + dRow
    const checkCol = move.col + dCol
    
    if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8 &&
        board[checkRow][checkCol] === 'black' &&
        !move.flippedPositions.some(pos => pos.row === checkRow && pos.col === checkCol)) {
      extraFlips.push({ row: checkRow, col: checkCol })
      count++
    }
  }
  
  return extraFlips
}

function findDiagonalSteals(board: CellState[][], move: ValidMove): Position[] {
  const steals: Position[] = []
  const diagonals = [[-2, -2], [-2, 2], [2, -2], [2, 2]]
  
  for (const [dRow, dCol] of diagonals) {
    const targetRow = move.row + dRow
    const targetCol = move.col + dCol
    
    if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8 &&
        board[targetRow][targetCol] === 'black') {
      // 間に白い石があるかチェック（より巧妙に見せるため）
      const midRow = move.row + dRow / 2
      const midCol = move.col + dCol / 2
      if (board[midRow][midCol] === 'white' || board[midRow][midCol] === null) {
        steals.push({ row: targetRow, col: targetCol })
      }
    }
  }
  
  return steals
}

function findRemoteFlips(board: CellState[][], move: ValidMove): Position[] {
  const remoteFlips: Position[] = []
  
  // 3〜4マス離れた場所の黒い石を探す
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const distance = Math.abs(row - move.row) + Math.abs(col - move.col)
      if (distance >= 3 && distance <= 4 && board[row][col] === 'black') {
        // ランダムに2〜3個選ぶ
        if (Math.random() < 0.5 && remoteFlips.length < 3) {
          remoteFlips.push({ row, col })
        }
      }
    }
  }
  
  return remoteFlips
}

function findClusterFlips(board: CellState[][], move: ValidMove): Position[] {
  const clusterFlips: Position[] = []
  
  // 置いた石の周囲2マスの範囲で黒い石のクラスターを探す
  for (let dRow = -2; dRow <= 2; dRow++) {
    for (let dCol = -2; dCol <= 2; dCol++) {
      if (dRow === 0 && dCol === 0) continue
      
      const checkRow = move.row + dRow
      const checkCol = move.col + dCol
      
      if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8 &&
          board[checkRow][checkCol] === 'black' &&
          !move.flippedPositions.some(pos => pos.row === checkRow && pos.col === checkCol)) {
        // 隣接する黒い石があればクラスターとして追加
        const hasAdjacentBlack = directions.some(([dr, dc]) => {
          const adjRow = checkRow + dr
          const adjCol = checkCol + dc
          return adjRow >= 0 && adjRow < 8 && adjCol >= 0 && adjCol < 8 &&
                 board[adjRow][adjCol] === 'black'
        })
        
        if (hasAdjacentBlack && clusterFlips.length < 5) {
          clusterFlips.push({ row: checkRow, col: checkCol })
        }
      }
    }
  }
  
  return clusterFlips
}

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
]

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

function findMegaSteal(board: CellState[][], move: ValidMove): Position[] {
  const megaFlips: Position[] = []
  
  // 特定のパターンを狙って大量に石を奪う
  // 対角線上の黒石をすべて奪う
  const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  
  for (const [dRow, dCol] of diagonalDirections) {
    let currentRow = move.row + dRow
    let currentCol = move.col + dCol
    
    while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
      if (board[currentRow][currentCol] === 'black') {
        megaFlips.push({ row: currentRow, col: currentCol })
      }
      currentRow += dRow
      currentCol += dCol
    }
  }
  
  // ボーナス：石の密度が高いエリアの黒石も奪う
  const areaSize = 3
  const startRow = Math.max(0, move.row - areaSize)
  const endRow = Math.min(7, move.row + areaSize)
  const startCol = Math.max(0, move.col - areaSize)
  const endCol = Math.min(7, move.col + areaSize)
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (board[row][col] === 'black' && Math.random() < 0.4) {
        if (!megaFlips.some(pos => pos.row === row && pos.col === col)) {
          megaFlips.push({ row, col })
        }
      }
    }
  }
  
  return megaFlips.slice(0, 8) // 最大て8個まで
}

function findPhantomFlips(board: CellState[][], move: ValidMove): Position[] {
  const phantomFlips: Position[] = []
  
  // 全体のランダムな位置から黒石を選んで奪う
  const blackStones: Position[] = []
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === 'black') {
        blackStones.push({ row, col })
      }
    }
  }
  
  // ランダムに4〜6個選ぶ
  const numToTake = Math.min(blackStones.length, 4 + Math.floor(Math.random() * 3))
  const shuffled = blackStones.sort(() => Math.random() - 0.5)
  
  return shuffled.slice(0, numToTake)
}
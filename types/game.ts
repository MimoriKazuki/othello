export type Player = 'black' | 'white'
export type CellState = Player | null
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'extreme'

export interface Position {
  row: number
  col: number
}

export interface ValidMove extends Position {
  flippedPositions: Position[]
}

export interface GameState {
  board: CellState[][]
  currentPlayer: Player
  blackCount: number
  whiteCount: number
  lastMove: Position | null
  isGameOver: boolean
  winner: Player | 'draw' | null
  difficulty: Difficulty
  cheatingHistory: CheatAction[]
  doubtSuccess: number
  isPlayerTurn: boolean
}

export interface CheatAction {
  turn: number
  type: 'invalid_move' | 'extra_flip' | 'skip_flip'
  position: Position
  description: string
}
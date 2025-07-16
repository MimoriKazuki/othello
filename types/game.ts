export type Player = 'black' | 'white' | null;
export type Board = Player[][];
export type Position = { row: number; col: number };
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'extreme';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  blackCount: number;
  whiteCount: number;
  lastMove: Position | null;
  isGameOver: boolean;
  winner: Player | 'draw' | null;
  difficulty: Difficulty;
  cheatingHistory: CheatAction[];
  doubtSuccess: number;
  isPlayerTurn: boolean;
}

export interface CheatAction {
  turn: number;
  originalBoard: Board;
  cheatedBoard: Board;
  positions: Position[];
  timestamp: number;
}

export interface ValidMove {
  position: Position;
  flippedPositions: Position[];
}
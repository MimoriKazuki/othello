import { Board, Player, Position, ValidMove } from '@/types/game';

const BOARD_SIZE = 8;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

export function createInitialBoard(): Board {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';
  return board;
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getOpponentColor(player: Player): Player {
  return player === 'black' ? 'white' : player === 'white' ? 'black' : null;
}

export function getFlippedPositions(
  board: Board,
  position: Position,
  player: Player
): Position[] {
  if (!player || board[position.row][position.col] !== null) {
    return [];
  }

  const opponent = getOpponentColor(player);
  const flipped: Position[] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const directionalFlips: Position[] = [];
    let r = position.row + dr;
    let c = position.col + dc;

    while (isValidPosition(r, c) && board[r][c] === opponent) {
      directionalFlips.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    if (isValidPosition(r, c) && board[r][c] === player && directionalFlips.length > 0) {
      flipped.push(...directionalFlips);
    }
  }

  return flipped;
}

export function isValidMove(board: Board, position: Position, player: Player): boolean {
  return getFlippedPositions(board, position, player).length > 0;
}

export function getValidMoves(board: Board, player: Player): ValidMove[] {
  const validMoves: ValidMove[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const position = { row, col };
      const flippedPositions = getFlippedPositions(board, position, player);
      
      if (flippedPositions.length > 0) {
        validMoves.push({ position, flippedPositions });
      }
    }
  }

  return validMoves;
}

export function makeMove(board: Board, move: ValidMove, player: Player): Board {
  const newBoard = board.map(row => [...row]);
  newBoard[move.position.row][move.position.col] = player;
  
  for (const pos of move.flippedPositions) {
    newBoard[pos.row][pos.col] = player;
  }
  
  return newBoard;
}

export function countStones(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;
  
  for (const row of board) {
    for (const cell of row) {
      if (cell === 'black') black++;
      else if (cell === 'white') white++;
    }
  }
  
  return { black, white };
}

export function isGameOver(board: Board): boolean {
  const blackMoves = getValidMoves(board, 'black');
  const whiteMoves = getValidMoves(board, 'white');
  return blackMoves.length === 0 && whiteMoves.length === 0;
}

export function getWinner(board: Board): Player | 'draw' {
  const { black, white } = countStones(board);
  if (black > white) return 'black';
  if (white > black) return 'white';
  return 'draw';
}
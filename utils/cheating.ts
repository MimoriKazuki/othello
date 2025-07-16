import { Board, Player, Position, Difficulty, CheatAction } from '@/types/game';
import { isValidPosition } from './gameLogic';

const CHEAT_PROBABILITY: Record<Difficulty, number> = {
  beginner: 0.15,    // 15% chance per turn
  intermediate: 0.25, // 25% chance per turn
  advanced: 0.35,     // 35% chance per turn
  extreme: 0.45       // 45% chance per turn
};

const MAX_CHEATS_PER_GAME: Record<Difficulty, number> = {
  beginner: 2,
  intermediate: 3,
  advanced: 4,
  extreme: 6
};

const CHEAT_SUBTLETY: Record<Difficulty, number> = {
  beginner: 1,    // Very obvious (1-2 stones)
  intermediate: 2, // Somewhat subtle (1-3 stones)
  advanced: 3,     // Very subtle (1-2 stones in less obvious positions)
  extreme: 4       // Almost unnoticeable (1 stone in strategic positions)
};

export function shouldCheat(
  difficulty: Difficulty,
  turn: number,
  previousCheats: CheatAction[]
): boolean {
  // Don't cheat in the first 10 turns
  if (turn < 10) return false;
  
  // Check if max cheats reached
  if (previousCheats.length >= MAX_CHEATS_PER_GAME[difficulty]) return false;
  
  // Don't cheat twice in a row
  if (previousCheats.length > 0) {
    const lastCheat = previousCheats[previousCheats.length - 1];
    if (turn - lastCheat.turn < 3) return false;
  }
  
  return Math.random() < CHEAT_PROBABILITY[difficulty];
}

export function performCheat(
  board: Board,
  difficulty: Difficulty,
  turn: number
): CheatAction | null {
  const originalBoard = board.map(row => [...row]);
  const cheatedBoard = board.map(row => [...row]);
  const positions: Position[] = [];
  
  const subtlety = CHEAT_SUBTLETY[difficulty];
  const maxStones = difficulty === 'beginner' ? 2 : difficulty === 'extreme' ? 1 : 3;
  const numStones = Math.min(Math.floor(Math.random() * 2) + 1, maxStones);
  
  // Choose positions to cheat based on difficulty
  const cheatPositions = getCheatPositions(board, difficulty, numStones);
  
  for (const pos of cheatPositions) {
    if (cheatedBoard[pos.row][pos.col] === 'black') {
      cheatedBoard[pos.row][pos.col] = 'white';
      positions.push(pos);
    }
  }
  
  // If no stones were actually changed, don't count it as a cheat
  if (positions.length === 0) return null;
  
  return {
    turn,
    originalBoard,
    cheatedBoard,
    positions,
    timestamp: Date.now()
  };
}

function getCheatPositions(
  board: Board,
  difficulty: Difficulty,
  numStones: number
): Position[] {
  const positions: Position[] = [];
  const blackStones: Position[] = [];
  
  // Collect all black stones
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === 'black') {
        blackStones.push({ row, col });
      }
    }
  }
  
  if (blackStones.length === 0) return positions;
  
  // Filter positions based on difficulty
  let candidatePositions = blackStones;
  
  if (difficulty === 'beginner') {
    // Choose obvious positions (any black stone)
    candidatePositions = blackStones;
  } else if (difficulty === 'intermediate') {
    // Prefer edge and non-corner positions
    candidatePositions = blackStones.filter(pos => 
      !isCorner(pos) || Math.random() < 0.3
    );
  } else if (difficulty === 'advanced') {
    // Prefer internal positions
    candidatePositions = blackStones.filter(pos => 
      !isCorner(pos) && !isEdge(pos)
    );
    if (candidatePositions.length === 0) candidatePositions = blackStones;
  } else if (difficulty === 'extreme') {
    // Choose the most subtle positions
    candidatePositions = blackStones.filter(pos => {
      // Prefer positions that are surrounded by other stones
      let surroundedCount = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r = pos.row + dr;
          const c = pos.col + dc;
          if (isValidPosition(r, c) && board[r][c] !== null) {
            surroundedCount++;
          }
        }
      }
      return surroundedCount >= 4;
    });
    if (candidatePositions.length === 0) candidatePositions = blackStones;
  }
  
  // Randomly select from candidates
  const shuffled = [...candidatePositions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(numStones, shuffled.length));
}

function isCorner(pos: Position): boolean {
  return (pos.row === 0 || pos.row === 7) && (pos.col === 0 || pos.col === 7);
}

function isEdge(pos: Position): boolean {
  return pos.row === 0 || pos.row === 7 || pos.col === 0 || pos.col === 7;
}

export function detectCheat(
  currentBoard: Board,
  previousBoard: Board,
  lastCheat: CheatAction | null
): boolean {
  if (!lastCheat) return false;
  
  // Check if the boards match the cheat action
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (currentBoard[row][col] !== lastCheat.cheatedBoard[row][col]) {
        return false;
      }
    }
  }
  
  return true;
}
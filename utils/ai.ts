import { Board, Player, ValidMove, Difficulty } from '@/types/game';
import { getValidMoves, makeMove, countStones, getOpponentColor } from './gameLogic';

const CORNER_POSITIONS = [
  { row: 0, col: 0 }, { row: 0, col: 7 },
  { row: 7, col: 0 }, { row: 7, col: 7 }
];

const EDGE_POSITIONS = [
  { row: 0, col: 1 }, { row: 0, col: 6 },
  { row: 1, col: 0 }, { row: 1, col: 7 },
  { row: 6, col: 0 }, { row: 6, col: 7 },
  { row: 7, col: 1 }, { row: 7, col: 6 }
];

export function getAIMove(board: Board, player: Player, difficulty: Difficulty): ValidMove | null {
  const validMoves = getValidMoves(board, player);
  if (validMoves.length === 0) return null;

  switch (difficulty) {
    case 'beginner':
      return getRandomMove(validMoves);
    case 'intermediate':
      return getIntermediateMove(board, player, validMoves);
    case 'advanced':
      return getAdvancedMove(board, player, validMoves);
    case 'extreme':
      return getExtremeMove(board, player, validMoves);
    default:
      return getRandomMove(validMoves);
  }
}

function getRandomMove(validMoves: ValidMove[]): ValidMove {
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

function getIntermediateMove(board: Board, player: Player, validMoves: ValidMove[]): ValidMove {
  // Prioritize moves that flip more pieces
  const sortedMoves = [...validMoves].sort((a, b) => 
    b.flippedPositions.length - a.flippedPositions.length
  );
  
  // 70% chance to pick the best move, 30% random
  return Math.random() < 0.7 ? sortedMoves[0] : getRandomMove(validMoves);
}

function getAdvancedMove(board: Board, player: Player, validMoves: ValidMove[]): ValidMove {
  // Prioritize corners
  const cornerMoves = validMoves.filter(move => 
    CORNER_POSITIONS.some(corner => 
      corner.row === move.position.row && corner.col === move.position.col
    )
  );
  if (cornerMoves.length > 0) return cornerMoves[0];

  // Avoid giving corners to opponent
  const safeMoves = validMoves.filter(move => !givesCornerToOpponent(board, move, player));
  if (safeMoves.length > 0) {
    return safeMoves.reduce((best, move) => 
      move.flippedPositions.length > best.flippedPositions.length ? move : best
    );
  }

  // Otherwise, pick the move that flips the most pieces
  return validMoves.reduce((best, move) => 
    move.flippedPositions.length > best.flippedPositions.length ? move : best
  );
}

function getExtremeMove(board: Board, player: Player, validMoves: ValidMove[]): ValidMove {
  // Use minimax algorithm with depth 3
  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const newBoard = makeMove(board, move, player);
    const score = minimax(newBoard, 3, false, player, -Infinity, Infinity);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  player: Player,
  alpha: number,
  beta: number
): number {
  if (depth === 0) {
    return evaluateBoard(board, player);
  }

  const currentPlayer = isMaximizing ? player : getOpponentColor(player);
  const validMoves = getValidMoves(board, currentPlayer);

  if (validMoves.length === 0) {
    const opponentMoves = getValidMoves(board, getOpponentColor(currentPlayer));
    if (opponentMoves.length === 0) {
      return evaluateBoard(board, player) * 100;
    }
    return minimax(board, depth, !isMaximizing, player, alpha, beta);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of validMoves) {
      const newBoard = makeMove(board, move, currentPlayer);
      const evaluation = minimax(newBoard, depth - 1, false, player, alpha, beta);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of validMoves) {
      const newBoard = makeMove(board, move, currentPlayer);
      const evaluation = minimax(newBoard, depth - 1, true, player, alpha, beta);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function evaluateBoard(board: Board, player: Player): number {
  const { black, white } = countStones(board);
  const stoneCount = player === 'black' ? black - white : white - black;
  
  let positionScore = 0;
  const weights = [
    [100, -20, 10, 5, 5, 10, -20, 100],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [10, -2, -1, -1, -1, -1, -2, 10],
    [5, -2, -1, -1, -1, -1, -2, 5],
    [5, -2, -1, -1, -1, -1, -2, 5],
    [10, -2, -1, -1, -1, -1, -2, 10],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [100, -20, 10, 5, 5, 10, -20, 100]
  ];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j] === player) {
        positionScore += weights[i][j];
      } else if (board[i][j] === getOpponentColor(player)) {
        positionScore -= weights[i][j];
      }
    }
  }

  return stoneCount + positionScore * 0.1;
}

function givesCornerToOpponent(board: Board, move: ValidMove, player: Player): boolean {
  const newBoard = makeMove(board, move, player);
  const opponentMoves = getValidMoves(newBoard, getOpponentColor(player));
  
  return opponentMoves.some(oppMove => 
    CORNER_POSITIONS.some(corner => 
      corner.row === oppMove.position.row && corner.col === oppMove.position.col
    )
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Board, Position, ValidMove } from '@/types/game';

interface GameBoardProps {
  board: Board;
  validMoves: ValidMove[];
  lastMove: Position | null;
  onCellClick: (row: number, col: number) => void;
  isPlayerTurn: boolean;
}

export default function GameBoard({
  board,
  validMoves,
  lastMove,
  onCellClick,
  isPlayerTurn
}: GameBoardProps) {
  const [animatedCells, setAnimatedCells] = useState<Set<string>>(new Set());
  const [previousBoard, setPreviousBoard] = useState<Board>(board);

  useEffect(() => {
    const newAnimatedCells = new Set<string>();
    
    // Find cells that changed
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] !== previousBoard[row][col] && board[row][col] !== null) {
          newAnimatedCells.add(`${row}-${col}`);
        }
      }
    }
    
    setAnimatedCells(newAnimatedCells);
    setPreviousBoard(board.map(row => [...row]));
    
    // Clear animations after animation completes
    const timer = setTimeout(() => {
      setAnimatedCells(new Set());
    }, 600);
    
    return () => clearTimeout(timer);
  }, [board]);
  const isValidMove = (row: number, col: number) => {
    return validMoves.some(move => 
      move.position.row === row && move.position.col === col
    );
  };

  const isLastMove = (row: number, col: number) => {
    return lastMove && lastMove.row === row && lastMove.col === col;
  };

  return (
    <div className="inline-block">
      <div className="bg-green-900 p-1 rounded-lg shadow-xl">
        <div className="grid grid-cols-8 gap-[1px]">
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
                  bg-green-600 flex items-center justify-center cursor-pointer
                  transition-all duration-200 relative
                  ${isPlayerTurn && isValidMove(rowIndex, colIndex) ? 'hover:bg-green-500' : ''}
                  ${isLastMove(rowIndex, colIndex) ? 'ring-2 md:ring-4 ring-yellow-400 ring-inset' : ''}
                `}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {cell && (
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full shadow-lg
                      transition-all duration-300 transform
                      ${cell === 'black' ? 'bg-gray-900' : 'bg-white'}
                      ${isLastMove(rowIndex, colIndex) ? 'scale-110' : ''}
                      ${animatedCells.has(`${rowIndex}-${colIndex}`) ? 'stone-place' : ''}
                    `}
                  />
                )}
                {isPlayerTurn && isValidMove(rowIndex, colIndex) && !cell && (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-green-400 opacity-50" />
                )}
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  );
}
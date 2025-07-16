'use client'

import { CellState, Position, ValidMove } from '@/types/game'

interface GameBoardProps {
  board: CellState[][]
  validMoves: ValidMove[]
  lastMove: Position | null
  onCellClick: (row: number, col: number) => void
  isPlayerTurn: boolean
}

export default function GameBoard({ 
  board, 
  validMoves, 
  lastMove, 
  onCellClick, 
  isPlayerTurn 
}: GameBoardProps) {
  const isValidMove = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col)
  }

  const isLastMove = (row: number, col: number) => {
    return lastMove?.row === row && lastMove?.col === col
  }

  return (
    <div className="inline-block bg-gray-800 p-2 rounded-2xl shadow-2xl board-container">
      <div className="grid grid-cols-8 gap-1">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer
                transition-all duration-200 hover:bg-gray-600
                ${isValidMove(rowIndex, colIndex) && isPlayerTurn ? 'ring-2 ring-white ring-opacity-50' : ''}
                ${isLastMove(rowIndex, colIndex) ? 'ring-2 ring-yellow-400' : ''}
              `}
              onClick={() => onCellClick(rowIndex, colIndex)}
            >
              {cell && (
                <div
                  className={`
                    w-8 h-8 rounded-full shadow-lg stone-place
                    ${cell === 'black' ? 'bg-gray-900 border-2 border-gray-600' : 'bg-white border-2 border-gray-300'}
                  `}
                />
              )}
              {isValidMove(rowIndex, colIndex) && isPlayerTurn && !cell && (
                <div className="w-6 h-6 rounded-full bg-gray-500 opacity-50" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
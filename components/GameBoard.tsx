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
    <div className="inline-block relative">
      {/* 3D風の影 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-black rounded-3xl transform translate-y-2 -translate-x-2 blur-xl opacity-50" />
      
      <div className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-800 p-6 rounded-3xl shadow-2xl board-container border-2 border-green-600">
        {/* 内側の光沢エフェクト */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-400/10 to-transparent rounded-3xl pointer-events-none" />
        
        <div className="grid grid-cols-8 gap-1 bg-gradient-to-br from-green-900 to-green-950 p-2 rounded-2xl relative">
          {/* グリッドの影 */}
          <div className="absolute inset-0 bg-black/20 rounded-2xl" />
          
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  relative w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer
                  transition-all duration-300 transform
                  ${cell ? '' : 'hover:scale-110 hover:rotate-3'}
                  ${isValidMove(rowIndex, colIndex) && isPlayerTurn && !cell ? 'hover:shadow-lg hover:shadow-yellow-400/50' : ''}
                `}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {/* セルの背景 */}
                <div className={`
                  absolute inset-0 rounded-lg transition-all duration-300
                  ${isValidMove(rowIndex, colIndex) && isPlayerTurn && !cell
                    ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-inner'
                    : 'bg-gradient-to-br from-green-600 to-green-700'
                  }
                  ${isLastMove(rowIndex, colIndex) ? 'ring-2 ring-red-400 ring-offset-1 ring-offset-green-900' : ''}
                `} />
                
                {/* ホバーエフェクト */}
                {!cell && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent to-green-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                )}
                
                {/* 石 */}
                {cell && (
                  <div className="relative z-10">
                    <div
                      className={`
                        w-10 h-10 rounded-full stone-place transform transition-all duration-300
                        ${cell === 'black' 
                          ? 'bg-gradient-to-br from-gray-800 via-black to-gray-900 shadow-lg shadow-black/50' 
                          : 'bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-lg shadow-gray-400/50'
                        }
                      `}
                    >
                      {/* 石の光沢 */}
                      <div className={`
                        absolute inset-0 rounded-full
                        ${cell === 'black'
                          ? 'bg-gradient-to-tr from-transparent via-gray-600/20 to-transparent'
                          : 'bg-gradient-to-tr from-transparent via-white/60 to-transparent'
                        }
                      `} />
                    </div>
                  </div>
                )}
                
                {/* 有効な手のインジケーター */}
                {isValidMove(rowIndex, colIndex) && isPlayerTurn && !cell && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 animate-pulse-slow" />
                      <div className="absolute inset-0 w-6 h-6 rounded-full bg-yellow-400 animate-ping" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
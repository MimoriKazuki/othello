'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GameBoard from '@/components/GameBoard';
import PlayerInfo from '@/components/PlayerInfo';
import DoubtButton from '@/components/DoubtButton';
import GameStatus from '@/components/GameStatus';
import GameOverModal from '@/components/GameOverModal';
import { useGameState } from '@/hooks/useGameState';
import { Difficulty } from '@/types/game';
import { User } from '@/types/user';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const difficulty = (searchParams.get('difficulty') || 'beginner') as Difficulty;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const {
    gameState,
    turn,
    message,
    validMoves,
    handlePlayerMove,
    handleDoubt,
    startNewGame
  } = useGameState();

  // 難易度が変わったらゲームを開始
  useEffect(() => {
    startNewGame(difficulty);
    
    // 現在のユーザー情報を取得
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, [difficulty, startNewGame]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <GameOverModal
        winner={gameState.winner}
        blackCount={gameState.blackCount}
        whiteCount={gameState.whiteCount}
        onNewGame={() => {
          router.push('/');
        }}
        doubtSuccess={gameState.doubtSuccess}
        difficulty={difficulty}
      />
      
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 mb-6 flex items-center justify-between border border-gray-700">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">
              ダウトオセロ
            </h1>
            <div className="flex items-center gap-4">
              <span className="bg-gray-700 text-white px-4 py-1 rounded-full text-sm font-bold border border-gray-600">
                難易度: {difficulty === 'beginner' ? '初級' : 
                       difficulty === 'intermediate' ? '中級' :
                       difficulty === 'advanced' ? '上級' : '鬼'}
              </span>
              <span className="bg-gray-700 text-white px-4 py-1 rounded-full text-sm font-bold border border-gray-600">
                ターン: {turn}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gray-700 text-white font-black rounded-2xl
              hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-xl border border-gray-600"
          >
            QUIT
          </button>
        </div>

        {/* Main Game Area */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
            {/* Game Board */}
            <div>
              <GameBoard
                board={gameState.board}
                validMoves={validMoves}
                lastMove={gameState.lastMove}
                onCellClick={handlePlayerMove}
                isPlayerTurn={gameState.isPlayerTurn}
              />
            </div>

            {/* Game Status */}
            <div className="flex flex-col gap-6">
              {/* Score Display */}
              <div className="bg-white bg-opacity-90 rounded-2xl p-6">
                <h3 className="text-gray-900 text-xl font-bold mb-4">スコア</h3>
                <div className="space-y-4">
                  <div className={`flex items-center gap-4 p-3 rounded-lg ${
                    gameState.currentPlayer === 'black' ? 'bg-gray-200 border-2 border-gray-800' : 'bg-gray-50'
                  }`}>
                    <div className="w-12 h-12 bg-gray-900 rounded-full shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold">{currentUser?.nickname || 'あなた'}</p>
                      <p className="text-gray-900 text-2xl font-black">{gameState.blackCount}</p>
                    </div>
                    {gameState.currentPlayer === 'black' && (
                      <span className="text-gray-900 text-sm font-bold">YOUR TURN</span>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-4 p-3 rounded-lg ${
                    gameState.currentPlayer === 'white' ? 'bg-gray-200 border-2 border-gray-800' : 'bg-gray-50'
                  }`}>
                    <div className="w-12 h-12 bg-white border-4 border-gray-300 rounded-full shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold">{'CPU'}</p>
                      <p className="text-gray-900 text-2xl font-black">{gameState.whiteCount}</p>
                    </div>
                    {gameState.currentPlayer === 'white' && (
                      <span className="text-gray-900 text-sm font-bold">CPU TURN</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-300">
                <p className="text-gray-900 text-center font-bold text-lg">
                  {message}
                </p>
              </div>

              {/* Success Counter */}
              {gameState.doubtSuccess > 0 && (
                <div className="bg-gray-800 rounded-2xl p-4 text-center border border-gray-600">
                  <p className="text-white font-bold">
                    ダウト成功: {gameState.doubtSuccess}回
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Doubt Button - Fixed Position */}
        <div className="fixed bottom-8 right-8 z-50">
          <DoubtButton
            onClick={handleDoubt}
            disabled={gameState.isGameOver}
          />
          
          {!gameState.isGameOver && gameState.currentPlayer === 'white' && turn <= 3 && (
            <div className="absolute -top-20 right-0 bg-white text-black rounded-xl shadow-2xl p-4 border border-gray-300">
              <p className="font-black text-lg whitespace-nowrap">
                怪しいと思ったら<br/>今すぐダウト！
              </p>
            </div>
          )}
        </div>
      </div>
      </main>
    </>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-center">読み込み中...</p>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
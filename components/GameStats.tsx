'use client';

import React from 'react';

interface GameStatsProps {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  successfulDoubts: number;
}

export default function GameStats({
  totalGames,
  wins,
  losses,
  draws,
  successfulDoubts
}: GameStatsProps) {
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">ゲーム統計</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">総ゲーム数</span>
          <span className="font-semibold text-gray-900">{totalGames}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">勝利</span>
          <span className="font-semibold text-green-600">{wins}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">敗北</span>
          <span className="font-semibold text-red-600">{losses}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">引き分け</span>
          <span className="font-semibold text-gray-600">{draws}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">勝率</span>
            <span className="font-bold text-blue-600">{winRate}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">ダウト成功数</span>
          <span className="font-semibold text-purple-600">{successfulDoubts}</span>
        </div>
      </div>
    </div>
  );
}
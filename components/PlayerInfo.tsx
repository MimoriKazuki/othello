'use client';

import React from 'react';
import { Player } from '@/types/game';

interface PlayerInfoProps {
  player: Player;
  stoneCount: number;
  isCurrentTurn: boolean;
  label: string;
}

export default function PlayerInfo({
  player,
  stoneCount,
  isCurrentTurn,
  label
}: PlayerInfoProps) {
  return (
    <div
      className={`
        p-4 rounded-lg shadow-md transition-all duration-300
        ${isCurrentTurn ? 'bg-blue-100 scale-105' : 'bg-gray-100'}
      `}
    >
      <h3 className="text-lg font-bold mb-2">{label}</h3>
      <div className="flex items-center gap-4">
        <div
          className={`
            w-8 h-8 rounded-full shadow
            ${player === 'black' ? 'bg-gray-900' : 'bg-white'}
          `}
        />
        <span className="text-2xl font-bold">{stoneCount}</span>
      </div>
      {isCurrentTurn && (
        <div className="mt-2 text-sm text-blue-600 font-semibold">
          あなたのターン
        </div>
      )}
    </div>
  );
}
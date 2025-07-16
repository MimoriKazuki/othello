'use client';

import React from 'react';

interface GameStatusProps {
  message: string;
  turn: number;
  doubtSuccess: number;
}

export default function GameStatus({ message, turn, doubtSuccess }: GameStatusProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">ゲーム状況</h3>
      <div className="space-y-2 text-sm">
        <div>ターン: {turn}</div>
        <div>ダウト成功: {doubtSuccess}回</div>
        <div className="mt-3 font-semibold text-blue-600">{message}</div>
      </div>
    </div>
  );
}
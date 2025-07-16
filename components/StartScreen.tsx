'use client';

import React from 'react';
import { Difficulty } from '@/types/game';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">
          ダウトオセロ
        </h1>
        
        <p className="text-center text-gray-600 mb-8">
          難易度を選んでゲームを開始してください
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => onStart('beginner')}
            className="w-full py-4 px-6 bg-green-500 text-white font-bold rounded-lg
              hover:bg-green-600 transition-colors duration-200 text-lg
              transform hover:scale-105 transition-transform"
          >
            初級
            <span className="block text-sm font-normal mt-1">
              AIは弱く、不正も見つけやすい
            </span>
          </button>
          
          <button
            onClick={() => onStart('intermediate')}
            className="w-full py-4 px-6 bg-blue-500 text-white font-bold rounded-lg
              hover:bg-blue-600 transition-colors duration-200 text-lg
              transform hover:scale-105 transition-transform"
          >
            中級
            <span className="block text-sm font-normal mt-1">
              AIは普通の強さで、不正もそこそこ
            </span>
          </button>
          
          <button
            onClick={() => onStart('advanced')}
            className="w-full py-4 px-6 bg-purple-500 text-white font-bold rounded-lg
              hover:bg-purple-600 transition-colors duration-200 text-lg
              transform hover:scale-105 transition-transform"
          >
            上級
            <span className="block text-sm font-normal mt-1">
              AIは強く、不正も巧妙
            </span>
          </button>
          
          <button
            onClick={() => onStart('extreme')}
            className="w-full py-4 px-6 bg-red-500 text-white font-bold rounded-lg
              hover:bg-red-600 transition-colors duration-200 text-lg
              transform hover:scale-105 transition-transform"
          >
            鬼
            <span className="block text-sm font-normal mt-1">
              AIは最強、不正はほぼ見抜けない
            </span>
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-700 text-center">
            <span className="font-bold text-yellow-700">ヒント：</span>
            <br />
            AIは時々不正を行います。
            <br />
            怪しいと思ったら「ダウト！」しましょう
          </p>
        </div>
      </div>
    </div>
  );
}
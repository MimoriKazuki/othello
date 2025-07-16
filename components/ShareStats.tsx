'use client';

import React from 'react';
import { UserStats } from '@/types/user';

interface ShareStatsProps {
  stats: UserStats;
  nickname?: string;
}

export default function ShareStats({ stats, nickname }: ShareStatsProps) {
  const shareText = nickname 
    ? `${nickname}のダウトオセロ成績\n🎮 総ゲーム: ${stats.totalGames}\n🏆 勝率: ${stats.winRate}%\n✅ 勝利: ${stats.wins}\n❌ 敗北: ${stats.losses}\n🎯 ダウト成功: ${stats.successfulDoubts}`
    : `ダウトオセロ成績\n🎮 総ゲーム: ${stats.totalGames}\n🏆 勝率: ${stats.winRate}%\n✅ 勝利: ${stats.wins}\n❌ 敗北: ${stats.losses}\n🎯 ダウト成功: ${stats.successfulDoubts}`;
  
  const gameUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareTextWithUrl = `${shareText}\n\n今すぐプレイ: ${gameUrl}`;
  
  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextWithUrl)}&hashtags=ダウトオセロ,オセロ`;
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  
  const handleInstagramShare = () => {
    // Instagramは直接シェアAPIがないため、テキストをコピー
    navigator.clipboard.writeText(shareTextWithUrl).then(() => {
      alert('成績をコピーしました！Instagramストーリーに貼り付けてシェアしてください。');
    });
  };
  
  
  return (
    <div className="bg-gray-800 rounded-3xl p-6 mt-6 text-white border border-gray-600">
      <h3 className="text-2xl font-black mb-4 text-center text-white">
        SHARE YOUR SCORE
      </h3>
      
      <p className="text-sm mb-4 text-center opacity-90">
        成績をSNSでシェアしよう！
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleTwitterShare}
          className="bg-gray-700 hover:bg-gray-600 rounded-2xl py-4 px-6 
            transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 border border-gray-600"
        >
          <span className="font-black text-lg">X</span>
        </button>
        
        <button
          onClick={handleInstagramShare}
          className="bg-gray-700 hover:bg-gray-600
            rounded-2xl py-4 px-6 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 border border-gray-600"
        >
          <span className="font-black text-lg">Instagram</span>
        </button>
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { Difficulty } from '@/types/game';

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
  disabled: boolean;
}

const difficulties: { value: Difficulty; label: string; description: string }[] = [
  { value: 'beginner', label: '初級', description: '明らかな不正・1-2回' },
  { value: 'intermediate', label: '中級', description: '巧妙な不正・2-3回' },
  { value: 'advanced', label: '上級', description: '非常に巧妙・3-4回' },
  { value: 'extreme', label: '鬼', description: 'ほぼ気づけない・4-6回' }
];

export default function DifficultySelector({
  currentDifficulty,
  onSelect,
  disabled
}: DifficultySelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3">難易度選択</h3>
      <div className="grid grid-cols-2 gap-2">
        {difficulties.map(({ value, label, description }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            disabled={disabled}
            className={`
              p-3 rounded-lg transition-all duration-200
              ${currentDifficulty === value 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="font-bold">{label}</div>
            <div className="text-xs mt-1 opacity-80">{description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
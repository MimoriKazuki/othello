'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
        <p className="text-gray-700 mb-6">
          申し訳ございません。何か問題が発生しました。
        </p>
        <button
          onClick={reset}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg
            hover:bg-blue-700 transition-colors duration-200"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
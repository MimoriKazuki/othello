'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@/types/game';
import { User, UserStats } from '@/types/user';
import RegisterForm from '@/components/RegisterForm';
import ShareStats from '@/components/ShareStats';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getOverallStats } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import AdminButton from '@/components/AdminButton';
import Header from '@/components/Header';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    successfulDoubts: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty | null>(null);
  // const [currentUser, setCurrentUser] = useState<User | null>(null); // Supabase認証を使用するため不要
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [overallStats, setOverallStats] = useState({
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    totalSuccessfulDoubts: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user) {
          // Supabaseからユーザー統計を取得
          const stats = await getUserStats(user.id);
          if (stats) {
            setGameStats({
              totalGames: stats.totalGames,
              wins: stats.wins,
              losses: stats.losses,
              draws: stats.draws,
              successfulDoubts: stats.successfulDoubts
            });
            setUserStats(stats);
          }
        } else {
          // ログインしていない場合はlocalStorageから読み込む
          const saved = localStorage.getItem('othelloStats');
          if (saved) {
            try {
              setGameStats(JSON.parse(saved));
            } catch (e) {
              console.error('Failed to parse game stats:', e);
            }
          }
        }
        
        // 全体統計を取得
        try {
          const overall = await getOverallStats();
          setOverallStats(overall);
        } catch (statsError) {
          console.error('全体統計の取得に失敗:', statsError);
          // デフォルト値を設定
          setOverallStats({
            totalGames: 0,
            totalWins: 0,
            totalLosses: 0,
            totalDraws: 0,
            totalSuccessfulDoubts: 0
          });
        }
      } catch (error) {
        console.error('統計の読み込みに失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadStats();
    }
  }, [user, authLoading]);

  const handleDifficultySelect = (difficulty: Difficulty) => {
    // 上級・鬼モードの場合は登録チェック
    if ((difficulty === 'advanced' || difficulty === 'extreme') && !user) {
      setPendingDifficulty(difficulty);
      setAuthMode('register');
      setShowAuthModal(true);
      return;
    }
    
    router.push(`/game?difficulty=${difficulty}`);
  };
  
  const handleAuthSuccess = (authUser: any) => {
    setShowAuthModal(false);
    
    // 認証後、保留中の難易度でゲームを開始
    if (pendingDifficulty) {
      setTimeout(() => {
        router.push(`/game?difficulty=${pendingDifficulty}`);
      }, 1000);
    }
  };
  
  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('@/lib/auth');
      await logoutUser();
      setUserStats(null);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const winRate = gameStats.totalGames > 0 ? Math.round((gameStats.wins / gameStats.totalGames) * 100) : 0;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-center">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black overflow-hidden relative flex items-center justify-center p-4">
      {/* シンプルな背景 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      </div>
      <div className="max-w-4xl w-full relative z-10">
        <h1 className="text-6xl sm:text-8xl font-black text-center mb-8 text-white">
          ダウトオセロ
        </h1>
        
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 border border-gray-700">
          <h2 className="text-4xl font-black text-white mb-8 text-center">難易度選択</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleDifficultySelect('beginner')}
              className="p-8 bg-gray-800 backdrop-blur-sm rounded-2xl hover:bg-gray-700
                transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-gray-600 group"
            >
              <h3 className="text-3xl font-black text-white mb-2">初級</h3>
              <p className="text-gray-300 text-sm">明らかな不正・1-2回</p>
            </button>
            
            <button
              onClick={() => handleDifficultySelect('intermediate')}
              className="p-8 bg-gray-800 backdrop-blur-sm rounded-2xl hover:bg-gray-700
                transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-gray-600 group"
            >
              <h3 className="text-3xl font-black text-white mb-2">中級</h3>
              <p className="text-gray-300 text-sm">巧妙な不正・2-3回</p>
            </button>
            
            <button
              onClick={() => handleDifficultySelect('advanced')}
              className="p-8 bg-gray-800 backdrop-blur-sm rounded-2xl hover:bg-gray-700
                transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-gray-600 relative group"
            >
              <h3 className="text-3xl font-black text-white mb-2">上級</h3>
              <p className="text-gray-300 text-sm">非常に巧妙・3-4回</p>
              {!user && (
                <span className="absolute top-2 right-2 bg-white text-black text-xs font-black px-3 py-1 rounded-full">
                  要ログイン
                </span>
              )}
            </button>
            
            <button
              onClick={() => handleDifficultySelect('extreme')}
              className="p-8 bg-gray-800 backdrop-blur-sm rounded-2xl hover:bg-gray-700
                transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-gray-600 relative group"
            >
              <h3 className="text-3xl font-black text-white mb-2">鬼</h3>
              <p className="text-gray-300 text-sm">ほぼ気づけない・4-6回</p>
              {!user && (
                <span className="absolute top-2 right-2 bg-white text-black text-xs font-black px-3 py-1 rounded-full">
                  要ログイン
                </span>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          
          <div className="text-center mb-8">
            <p className="text-white font-black text-2xl">あなたのターンです</p>
          </div>
          
          <button
            onClick={() => handleDifficultySelect('beginner')}
            className="w-full py-5 px-8 bg-white text-black font-black rounded-2xl
              hover:bg-gray-200 transition-all duration-200 text-2xl
              transform hover:scale-105 shadow-2xl mb-10"
          >
            新しいゲーム
          </button>
          
          <h3 className="text-2xl font-black text-white mb-6 text-center">
            {user && userStats ? `${user.user_metadata?.nickname || user.email}の統計` : '全体統計'}
          </h3>
          
          <div className="bg-white rounded-2xl p-6 space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <>
                {	/* ユーザーがログインしている場合はユーザーの統計を表示 */}
                {user && userStats ? (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">総ゲーム数</span>
                      <span className="font-black text-gray-900 text-xl">{userStats.totalGames}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">勝利</span>
                      <span className="font-black text-gray-900 text-xl">{userStats.wins}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">敗北</span>
                      <span className="font-black text-gray-900 text-xl">{userStats.losses}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">引き分け</span>
                      <span className="font-black text-gray-700 text-xl">{userStats.draws}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">勝率</span>
                      <span className="font-black text-gray-900 text-2xl">{userStats.winRate}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-700 font-semibold">ダウト成功数</span>
                      <span className="font-black text-gray-900 text-xl">{userStats.successfulDoubts}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">総ゲーム数</span>
                      <span className="font-black text-gray-900 text-xl">{gameStats.totalGames}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">勝利</span>
                      <span className="font-black text-gray-900 text-xl">{gameStats.wins}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">敗北</span>
                      <span className="font-black text-gray-900 text-xl">{gameStats.losses}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">引き分け</span>
                      <span className="font-black text-gray-700 text-xl">{gameStats.draws}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold">勝率</span>
                      <span className="font-black text-gray-900 text-2xl">{winRate}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-700 font-semibold">ダウト成功数</span>
                      <span className="font-black text-gray-900 text-xl">{gameStats.successfulDoubts}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          
          {	/* SNS共有ボタン */}
          {user && userStats && userStats.totalGames > 0 && (
            <ShareStats stats={userStats} nickname={user.user_metadata?.nickname || user.email || 'プレイヤー'} />
          )}
          
          {	/* 未ログインユーザーへの登録促進 */}
          {!user && (
            <div className="bg-gray-800 rounded-2xl p-6 mt-6 border border-gray-600">
              <h3 className="text-xl font-black text-white mb-3 text-center">
                登録してもっと楽しもう！
              </h3>
              <ul className="text-white space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>あなた専用の勝率・成績を保存</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🎮</span>
                  <span>上級・鬼モードに挑戦可能</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📊</span>
                  <span>SNSで成績をシェアできる</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  setPendingDifficulty('beginner');
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="w-full py-3 px-6 bg-white text-black font-black rounded-xl
                  hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
              >
                今すぐ登録（無料）
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setPendingDifficulty(null);
          }}
          onSuccess={handleAuthSuccess}
          mode={authMode}
        />
      )}
        <AdminButton />
      </div>
    </>
  );
}
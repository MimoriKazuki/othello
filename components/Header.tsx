'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { logoutUser } from '@/lib/auth'
import AuthModal from './AuthModal'

export default function Header() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push('/')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    router.refresh()
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div 
              onClick={() => router.push('/')}
              className="flex items-center cursor-pointer"
            >
              <h1 className="text-xl sm:text-2xl font-black text-white">
                ダウトオセロ
              </h1>
            </div>

            {/* ナビゲーション */}
            <nav className="flex items-center gap-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block text-white text-sm">
                        <span className="opacity-70">ようこそ、</span>
                        <span className="font-bold">{user.user_metadata?.nickname || user.email}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-colors border border-gray-600"
                      >
                        ログアウト
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAuthMode('login')
                          setShowAuthModal(true)
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-colors border border-gray-600"
                      >
                        ログイン
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode('register')
                          setShowAuthModal(true)
                        }}
                        className="px-4 py-2 bg-white hover:bg-gray-200 text-black text-sm font-bold rounded-lg transition-colors"
                      >
                        新規登録
                      </button>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* ヘッダーの高さ分のスペーサー */}
      <div className="h-16" />

      {/* 認証モーダル */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          mode={authMode}
        />
      )}
    </>
  )
}
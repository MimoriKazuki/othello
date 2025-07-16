'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
  mode: 'login' | 'register'
  pendingDifficulty?: string
}

export default function AuthModal({ isOpen, onClose, onSuccess, mode: initialMode, pendingDifficulty }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // initialModeが変更されたらmodeも更新
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        // バリデーション
        if (!email || !password || !nickname || !age) {
          setError('すべての項目を入力してください')
          setLoading(false)
          return
        }

        if (password.length < 8) {
          setError('パスワードは8文字以上にしてください')
          setLoading(false)
          return
        }

        if (!/^[a-zA-Z0-9ぁ-んァ-ヶー一-龠]+$/.test(nickname)) {
          setError('ニックネームは英数字と日本語のみ使用できます')
          setLoading(false)
          return
        }

        const ageNum = parseInt(age)
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
          setError('年齢は1〜150の数字で入力してください')
          setLoading(false)
          return
        }

        // Supabaseで登録
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nickname,
              age: ageNum
            }
          }
        })

        if (signUpError) {
          setError('登録に失敗しました: ' + signUpError.message)
          setLoading(false)
          return
        }

        if (data.user) {
          // ユーザー情報をusersテーブルに保存
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              nickname,
              age: ageNum
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
          }

          // 統計情報を初期化
          const { error: statsError } = await supabase
            .from('user_stats')
            .insert({
              user_id: data.user.id,
              total_games: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              successful_doubts: 0
            })

          if (statsError) {
            console.error('Stats initialization error:', statsError)
          }

          onSuccess(data.user)
        }
      } else {
        // ログイン
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          setError('ログインに失敗しました: ' + signInError.message)
          setLoading(false)
          return
        }

        if (data.user) {
          onSuccess(data.user)
        }
      }
    } catch (err) {
      setError('エラーが発生しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700">
        <h2 className="text-3xl font-black text-white mb-6 text-center">
          {mode === 'register' ? '新規登録' : 'ログイン'}
        </h2>

        {pendingDifficulty && mode === 'register' && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <p className="text-gray-300 text-sm">
              {pendingDifficulty === 'extreme' ? '鬼' : '上級'}モードをプレイするには登録が必要です
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
              required
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-gray-300 mb-2">ニックネーム</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">年齢</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                  min="1"
                  max="150"
                  required
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? '処理中...' : mode === 'register' ? '登録する' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {mode === 'register' ? 'すでにアカウントをお持ちの方' : '新規登録はこちら'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 text-gray-400 hover:text-white transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
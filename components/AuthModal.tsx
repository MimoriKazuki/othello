'use client'

import { useState } from 'react'
import { registerUser, loginUser, userRegistrationSchema, loginSchema } from '@/lib/auth'
import { initializeUserStats } from '@/lib/auth-client'
import { z } from 'zod'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
  mode: 'login' | 'register'
}

export default function AuthModal({ isOpen, onClose, onSuccess, mode: initialMode }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    age: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setLoading(true)

    try {
      if (mode === 'register') {
        const data = {
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
          age: parseInt(formData.age)
        }
        
        // クライアント側バリデーション
        try {
          userRegistrationSchema.parse(data)
        } catch (err) {
          if (err instanceof z.ZodError) {
            const errors: Record<string, string> = {}
            err.issues.forEach(issue => {
              if (issue.path && issue.path[0]) {
                errors[issue.path[0].toString()] = issue.message
              }
            })
            setFieldErrors(errors)
            setLoading(false)
            return
          }
        }

        const result = await registerUser(data)
        if (result.user) {
          // メール確認なしで登録完了
          // 統計情報を初期化（エラーがあっても続行）
          await initializeUserStats(result.user.id)
          onSuccess(result.user)
          onClose()
        }
      } else {
        const data = {
          email: formData.email,
          password: formData.password
        }
        
        // クライアント側バリデーション
        try {
          loginSchema.parse(data)
        } catch (err) {
          if (err instanceof z.ZodError) {
            const errors: Record<string, string> = {}
            err.issues.forEach(issue => {
              if (issue.path && issue.path[0]) {
                errors[issue.path[0].toString()] = issue.message
              }
            })
            setFieldErrors(errors)
            setLoading(false)
            return
          }
        }

        const result = await loginUser(data)
        if (result.user) {
          onSuccess(result.user)
          onClose()
        }
      }
    } catch (err: any) {
      // エラーメッセージを日本語化
      if (err?.message) {
        setError(err.message)
      } else {
        setError('予期しないエラーが発生しました。もう一度お試しください。')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // フィールドエラーをクリア
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">
          {mode === 'login' ? 'ログイン' : '新規登録'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-800/50 border ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors`}
              placeholder="example@email.com"
              required
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-800/50 border ${
                fieldErrors.password ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors`}
              placeholder={mode === 'register' ? '8文字以上、大文字小文字数字を含む' : 'パスワード'}
              required
              disabled={loading}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-1">
                  ニックネーム
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-gray-800/50 border ${
                    fieldErrors.nickname ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors`}
                  placeholder="表示名"
                  required
                  disabled={loading}
                />
                {fieldErrors.nickname && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.nickname}</p>
                )}
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
                  年齢
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-gray-800/50 border ${
                    fieldErrors.age ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors`}
                  placeholder="年齢"
                  min="1"
                  max="150"
                  required
                  disabled={loading}
                />
                {fieldErrors.age && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.age}</p>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white hover:bg-gray-200 disabled:bg-gray-700 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '処理中...' : (mode === 'login' ? 'ログイン' : '登録')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? 'アカウントをお持ちでない方は' : '既にアカウントをお持ちの方は'}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
                setFieldErrors({})
                setFormData({ email: '', password: '', nickname: '', age: '' })
              }}
              className="text-gray-400 hover:text-white ml-1 font-medium underline"
              disabled={loading}
            >
              {mode === 'login' ? '新規登録' : 'ログイン'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
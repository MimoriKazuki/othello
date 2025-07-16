'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface QuickLoginFormProps {
  onSuccess: () => void
  difficulty?: string
}

export default function QuickLoginForm({ onSuccess, difficulty }: QuickLoginFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleQuickLogin = async () => {
    setLoading(true)
    
    try {
      // シンプルなメール認証（パスワードなし）
      const testEmail = email || `test${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      
      // まずログインを試みる
      let { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      // ログイン失敗なら新規登録
      if (loginError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              nickname: 'プレイヤー' + Date.now(),
              age: 20
            }
          }
        })
        
        if (!signUpError && signUpData.user) {
          // 登録成功
          onSuccess()
        }
      } else if (loginData.user) {
        // ログイン成功
        onSuccess()
      }
    } catch (error) {
      console.error('認証エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-4">
        テストプレイの場合は、そのまま「今すぐプレイ」をクリック
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="メールアドレス（オプション）"
        className="w-full px-4 py-2 border rounded-lg mb-4"
      />
      <button
        onClick={handleQuickLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? '処理中...' : '今すぐプレイ'}
      </button>
    </div>
  )
}
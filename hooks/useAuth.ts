'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, getSession } from '@/lib/auth'
import { migrateLocalDataToSupabase } from '@/lib/db'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初期セッションチェック
    const checkSession = async () => {
      try {
        const session = await getSession()
        if (session?.user) {
          setUser(session.user)
          // ローカルデータの移行
          await migrateLocalDataToSupabase(session.user.id, session.user.email!)
        }
      } catch (error) {
        console.error('セッションチェックエラー:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          if (event === 'SIGNED_IN') {
            // ログイン時にローカルデータを移行
            await migrateLocalDataToSupabase(session.user.id, session.user.email!)
          }
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
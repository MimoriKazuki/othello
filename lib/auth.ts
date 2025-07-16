import { supabase } from './supabase'
import { z } from 'zod'

// バリデーションスキーマ
export const userRegistrationSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .min(5, 'メールアドレスは5文字以上必要です')
    .max(255, 'メールアドレスは255文字以内にしてください'),
  nickname: z.string()
    .min(2, 'ニックネームは2文字以上必要です')
    .max(50, 'ニックネームは50文字以内にしてください')
    .regex(/^[a-zA-Z0-9ぁ-んァ-ヶー一-龠々\s]+$/, 'ニックネームに使用できない文字が含まれています'),
  age: z.number()
    .int('年齢は整数で入力してください')
    .min(1, '年齢は1歳以上である必要があります')
    .max(150, '年齢は150歳以下である必要があります'),
  password: z.string()
    .min(8, 'パスワードは8文字以上必要です')
    .max(100, 'パスワードは100文字以内にしてください')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'パスワードは大文字、小文字、数字を含む必要があります')
})

export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください')
})

// ログイン試行を記録するMap（メモリ内）
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

// レート制限のチェック
export function checkRateLimit(email: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now()
  const attempt = loginAttempts.get(email)
  
  if (!attempt) {
    return { allowed: true }
  }

  // 15分でリセット
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(email)
    return { allowed: true }
  }

  // 5回以上の試行で制限
  if (attempt.count >= 5) {
    const remainingTime = Math.ceil((15 * 60 * 1000 - (now - attempt.lastAttempt)) / 1000 / 60)
    return { allowed: false, remainingTime }
  }

  return { allowed: true }
}

// ログイン試行を記録
export function recordLoginAttempt(email: string, success: boolean) {
  if (success) {
    loginAttempts.delete(email)
    return
  }

  const attempt = loginAttempts.get(email) || { count: 0, lastAttempt: Date.now() }
  attempt.count++
  attempt.lastAttempt = Date.now()
  loginAttempts.set(email, attempt)
}

// ユーザー登録
export async function registerUser(data: z.infer<typeof userRegistrationSchema>) {
  try {
    // 入力値の検証
    const validatedData = userRegistrationSchema.parse(data)

    // Supabase Authでユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          nickname: validatedData.nickname,
          age: validatedData.age
        }
      }
    })

    if (authError) {
      // エラーメッセージを日本語化
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        throw new Error('このメールアドレスは既に登録されています')
      }
      if (authError.message.includes('Invalid email')) {
        throw new Error('有効なメールアドレスを入力してください')
      }
      if (authError.message.includes('Password')) {
        throw new Error('パスワードは8文字以上で、大文字・小文字・数字を含む必要があります')
      }
      throw new Error('登録に失敗しました。もう一度お試しください。')
    }

    if (!authData.user) {
      throw new Error('ユーザー登録に失敗しました')
    }

    // データベース保存をtry-catchでラップ
    try {
      // ユーザー情報を保存
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: validatedData.email,
          nickname: validatedData.nickname,
          age: validatedData.age
        })

      if (dbError && !dbError.message?.includes('duplicate')) {
        console.error('ユーザー保存エラー:', dbError)
      }

      // 統計情報を初期化
      const { error: statsError } = await supabase
        .from('user_stats')
        .insert({
          user_id: authData.user.id,
          total_games: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          successful_doubts: 0,
          win_rate: 0
        })

      if (statsError && !statsError.message?.includes('duplicate')) {
        console.error('統計初期化エラー:', statsError)
      }
    } catch (dbErr) {
      // データベースエラーがあってもユーザー登録は成功とする
      console.error('データベース処理エラー:', dbErr)
    }

    return { user: authData.user, session: authData.session }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message)
    }
    throw error
  }
}

// ログイン
export async function loginUser(data: z.infer<typeof loginSchema>) {
  try {
    // 入力値の検証
    const validatedData = loginSchema.parse(data)

    // レート制限チェック
    const rateLimit = checkRateLimit(validatedData.email)
    if (!rateLimit.allowed) {
      throw new Error(`ログイン試行回数が上限に達しました。${rateLimit.remainingTime}分後に再試行してください。`)
    }

    // Supabase Authでログイン
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    })

    if (authError) {
      recordLoginAttempt(validatedData.email, false)
      // エラーメッセージを日本語化
      if (authError.message.includes('Invalid login credentials') || authError.message.includes('invalid')) {
        throw new Error('メールアドレスまたはパスワードが正しくありません')
      }
      if (authError.message.includes('Email not confirmed')) {
        throw new Error('メールアドレスの確認が完了していません。確認メールをご確認ください。')
      }
      throw new Error('ログインに失敗しました。もう一度お試しください。')
    }

    recordLoginAttempt(validatedData.email, true)
    return { user: authData.user, session: authData.session }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message)
    }
    throw error
  }
}

// ログアウト
export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 現在のユーザー取得
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // データベースからユーザー情報を取得
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    console.error('ユーザー情報の取得に失敗しました:', error)
    return null
  }

  return userData
}

// セッションの確認
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// パスワードリセットメール送信
export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  if (error) throw error
}

// パスワード更新
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (error) throw error
}
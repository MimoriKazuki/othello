import { createClient } from '@supabase/supabase-js'

// 環境変数から設定を読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabaseクライアントのシングルトンインスタンス
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// データベースの型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nickname: string
          age: number
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          nickname: string
          age: number
        }
        Update: {
          email?: string
          nickname?: string
          age?: number
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_games: number
          wins: number
          losses: number
          draws: number
          successful_doubts: number
          win_rate: number
          updated_at: string
        }
        Insert: {
          user_id: string
          total_games?: number
          wins?: number
          losses?: number
          draws?: number
          successful_doubts?: number
          win_rate?: number
        }
        Update: {
          total_games?: number
          wins?: number
          losses?: number
          draws?: number
          successful_doubts?: number
          win_rate?: number
        }
      }
      game_history: {
        Row: {
          id: string
          user_id: string
          difficulty: string
          result: 'win' | 'loss' | 'draw'
          black_count: number
          white_count: number
          doubt_success: number
          played_at: string
        }
        Insert: {
          user_id: string
          difficulty: string
          result: 'win' | 'loss' | 'draw'
          black_count: number
          white_count: number
          doubt_success: number
        }
        Update: {
          difficulty?: string
          result?: 'win' | 'loss' | 'draw'
          black_count?: number
          white_count?: number
          doubt_success?: number
        }
      }
    }
  }
}
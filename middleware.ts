import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 保護されたルートのチェック
  const protectedRoutes = ['/game/advanced', '/game/extreme']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    // 未ログインユーザーをホームページにリダイレクト
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set('message', 'このモードをプレイするにはログインが必要です')
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/game/:path*']
}
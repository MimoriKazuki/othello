import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ダウトオセロ - AIの不正を見破れ！',
  description: 'AIが時々ズルをする新感覚オセロゲーム。不正を見破って一発逆転を狙え！',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-black text-white">{children}</body>
    </html>
  )
}
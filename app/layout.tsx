import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"] });

const siteConfig = {
  name: 'ダウトオセロ - AIの不正を見破る新感覚リバーシゲーム',
  description: 'ダウトオセロは、AIが時々不正を行う新感覚のオセロゲームです。相手の不正を見抜いて「ダウト！」を宣言し、勝利を目指しましょう。初級から鬼レベルまで4つの難易度で挑戦できます。',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://doubt-othello.vercel.app',
  ogImage: '/og-image.png',
  keywords: 'オセロ,リバーシ,ダウト,ゲーム,AI,パズル,ボードゲーム,無料ゲーム,オンラインゲーム,頭脳ゲーム'
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: 'ダウトオセロ開発チーム' }],
  creator: 'ダウトオセロ開発チーム',
  publisher: 'ダウトオセロ',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: 'ダウトオセロ',
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'ダウトオセロ - AIの不正を見破る新感覚リバーシゲーム',
      }
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@doubt_othello',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteConfig.url,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ダウトオセロ',
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: 'GameApplication',
  genre: 'ボードゲーム',
  browserRequirements: 'HTML5対応ブラウザ',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',
    reviewCount: '127',
  },
  author: {
    '@type': 'Organization',
    name: 'ダウトオセロ開発チーム',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.className} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
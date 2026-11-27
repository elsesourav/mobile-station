import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import React from 'react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { CartProvider } from '@/components/CartContext'
import { BehaviorProvider } from '@/context/BehaviorContext'
import { CustomerAuthProvider } from '@/context/CustomerAuthContext'
import { HeaderScrollProvider } from '@/context/HeaderScrollContext'
import '../styles/globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${MOBILE_STATION_BRAND.name} — Smartphones, Laptops, Tablets, Audio & Tech Accessories`,
    template: `%s | ${MOBILE_STATION_BRAND.name}`,
  },
  description:
    'Shop factory-sealed smartphones, tablets, laptops, TWS earphones, mechanical keyboards, mice, GaN chargers & certified tech accessories with 18% GST Tax Invoice, Official Brand Warranty & Open-Box Delivery. Flagship hub in Muzaffarpur, Bihar.',
  applicationName: MOBILE_STATION_BRAND.name,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: MOBILE_STATION_BRAND.name,
    title: `${MOBILE_STATION_BRAND.name} — Genuine Electronics & Tech Accessories`,
    description: MOBILE_STATION_BRAND.tagline,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mobile Station — Smartphones, Tablets, Laptops, Audio & Peripherals',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: MOBILE_STATION_BRAND.palette.obsidian,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-surface-canvas text-ink-primary antialiased">
        <CustomerAuthProvider>
          <BehaviorProvider>
            <CartProvider>
              <HeaderScrollProvider>{children}</HeaderScrollProvider>
            </CartProvider>
          </BehaviorProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  )
}

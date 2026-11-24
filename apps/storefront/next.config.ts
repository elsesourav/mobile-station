import type { NextConfig } from 'next'
import path from 'path'
import { withSentryConfig } from '@sentry/nextjs/config'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL:
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://localhost:9000',
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_SITE_NAME:
      process.env.NEXT_PUBLIC_SITE_NAME ?? 'Mobile Station',
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'ekbuxdbd',
    NEXT_PUBLIC_SENTRY_DSN:
      process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN ?? '',
  },
  async rewrites() {
    const backendUrl = (
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://127.0.0.1:9000'
    ).replace(/\/$/, '')
    return [
      {
        source: '/medusa/store/:path*',
        destination: `${backendUrl}/store/:path*`,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'mobile-station',
  project: 'mobile-station-storefront',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  silent: !process.env.CI,
})

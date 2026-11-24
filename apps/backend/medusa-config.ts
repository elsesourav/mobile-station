import './src/instrument'
import { loadEnv, defineConfig, MedusaError } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export function validateProductionConfig(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== 'production') return
  if (env.MEDUSA_BUILD_PHASE === 'true' || env.BUILD_ONLY === 'true' || env.CI === 'true') return

  const missing: string[] = []
  if (!env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!env.REDIS_URL) missing.push('REDIS_URL')

  if (env.DATABASE_URL && env.DATABASE_URL.includes(':6543')) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      'Database Configuration Error: Port 6543 (Transaction Pooler) is incompatible with Medusa v2 ORM. Use Session Pooler or Direct Connection on port 5432.'
    )
  }

  const jwtSecret = env.JWT_SECRET || ''
  if (!jwtSecret || jwtSecret.includes('replace') || jwtSecret.length < 32) {
    missing.push('JWT_SECRET (>= 32 chars)')
  }

  const cookieSecret = env.COOKIE_SECRET || ''
  if (!cookieSecret || cookieSecret.includes('replace') || cookieSecret.length < 32) {
    missing.push('COOKIE_SECRET (>= 32 chars)')
  }

  if ((env.STORE_CORS || '').includes('*') || (env.ADMIN_CORS || '').includes('*')) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      'Security Violation: Wildcard CORS origins are forbidden in production.'
    )
  }

  if (env.RAZORPAY_MOCK_MODE === 'true' || env.SHIPROCKET_MOCK_MODE === 'true') {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      'Security Violation: Payment or logistics mock modes must be disabled in production.'
    )
  }

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    missing.push('CLOUDINARY_*')
  }

  if (!env.STORAGE_S3_BUCKET || !env.STORAGE_S3_ACCESS_KEY_ID || !env.STORAGE_S3_SECRET_ACCESS_KEY) {
    missing.push('STORAGE_S3_*')
  }

  if (missing.length > 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Missing production configuration variables: ${missing.join(', ')}`
    )
  }
}

validateProductionConfig()

const rawDatabaseUrl =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === 'test' || process.env.BUILD_ONLY === 'true'
    ? 'postgres://postgres:postgres@localhost:5434/mobile_station_test'
    : undefined)

const normalizedDatabaseUrl =
  rawDatabaseUrl &&
  rawDatabaseUrl.includes('supabase') &&
  rawDatabaseUrl.includes('sslmode=require') &&
  !rawDatabaseUrl.includes('uselibpqcompat=')
    ? rawDatabaseUrl.replace('sslmode=require', 'sslmode=no-verify')
    : rawDatabaseUrl

const useSslDb =
  process.env.NODE_ENV === 'production' ||
  Boolean(normalizedDatabaseUrl?.includes('supabase'))

export default defineConfig({
  admin: {
    path: (process.env.ADMIN_PATH as `/${string}`) || '/app',
    backendUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
    disable: process.env.MEDUSA_ADMIN_DISABLED === 'true',
  },
  projectConfig: {
    databaseUrl: normalizedDatabaseUrl,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:5173,http://localhost:9000',
      authCors:
        process.env.AUTH_CORS ||
        'http://localhost:3000,http://localhost:5173,http://localhost:9000',
      jwtSecret: process.env.JWT_SECRET || 'mobile-station-dev-jwt-secret-change-in-prod',
      cookieSecret: process.env.COOKIE_SECRET || 'mobile-station-dev-cookie-secret-change-in-prod',
    },
    databaseDriverOptions: {
      pool: {
        min: Number(process.env.DB_POOL_MIN) || 2,
        max: Number(process.env.DB_POOL_MAX) || 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
      ...(useSslDb
        ? {
            ssl: { rejectUnauthorized: false },
            connection: { ssl: { rejectUnauthorized: false } },
          }
        : {}),
    },
  },
  modules: [
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: './src/modules/file-cloudinary',
            id: 'cloudinary',
            options: {
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
              folder: process.env.CLOUDINARY_FOLDER || 'mobile-station',
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: './src/modules/notification-resend',
            id: 'resend-email',
            options: {
              channels: ['email'],
              api_key: process.env.RESEND_API_KEY,
              from_email: process.env.NOTIFICATION_FROM_EMAIL || 'onboarding@resend.dev',
              from_name: process.env.NOTIFICATION_FROM_NAME || 'Mobile Station',
              reply_to: process.env.NOTIFICATION_REPLY_TO || 'support@mobilestation.in',
              mock_mode: process.env.NOTIFICATION_MOCK_MODE === 'true',
            },
          },
        ],
      },
    },
  ],
})

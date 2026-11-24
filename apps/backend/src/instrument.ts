import { loadEnv } from '@medusajs/framework/utils'
import * as Sentry from '@sentry/node'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const dsn = process.env.SENTRY_DSN

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
})

export { Sentry }

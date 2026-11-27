import { authenticate, defineMiddlewares } from '@medusajs/framework/http'
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { Sentry } from '../instrument'

function resolveErrorStatus(
  err: Error & { status?: number; statusCode?: number; type?: string }
): number {
  if (typeof err.status === 'number' && err.status >= 400) return err.status
  if (typeof err.statusCode === 'number' && err.statusCode >= 400) return err.statusCode

  switch (err.type) {
    case 'unauthorized':
      return 401
    case 'not_allowed':
    case 'forbidden':
      return 403
    case 'not_found':
      return 404
    case 'duplicate_error':
    case 'conflict':
      return 409
    case 'invalid_data':
    case 'invalid_argument':
    case 'payment_authorization_error':
      return 400
    default: {
      const msg = (err.message || '').toLowerCase()
      if (msg.includes('invalid email or password') || msg.includes('unauthorized')) {
        return 401
      }
      return 500
    }
  }
}

export default defineMiddlewares({
  routes: [
    {
      matcher: '/store/customers/me/password',
      methods: ['POST'],
      middlewares: [authenticate('customer', ['bearer', 'session'])],
    },
    {
      matcher: '/admin/showcase/upload',
      methods: ['POST'],
      bodyParser: { sizeLimit: '50mb' },
    },
    {
      matcher: '/admin/products/*/electronics',
      methods: ['POST'],
      bodyParser: { sizeLimit: '15mb' },
    },
  ],
  errorHandler: async (
    err: Error & { status?: number; statusCode?: number; type?: string },
    req: MedusaRequest,
    res: MedusaResponse,
    _next: MedusaNextFunction
  ) => {
    const status = resolveErrorStatus(err)
    if (status >= 500) {
      Sentry.withScope((scope) => {
        scope.setTag('service', 'mobile-station-backend')
        scope.setExtra('method', req.method)
        scope.setExtra('url', req.originalUrl || req.url)
        Sentry.captureException(err)
      })
      await Sentry.flush(2000)
    }

    res.status(status).json({
      type: 'error',
      message: err.message || 'Internal Server Error',
    })
  },
})

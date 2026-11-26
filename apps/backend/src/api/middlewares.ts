import { defineMiddlewares } from '@medusajs/framework/http'
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { Sentry } from '../instrument'

export default defineMiddlewares({
  routes: [
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
    err: Error & { status?: number; statusCode?: number },
    req: MedusaRequest,
    res: MedusaResponse,
    _next: MedusaNextFunction
  ) => {
    const status = err.status || err.statusCode || 500
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

import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

/**
 * POST /store/customers/me/password
 * Updates the authenticated customer's emailpass credential in Medusa Auth Module.
 */
export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  const body = (req.body as { password?: unknown } | undefined) ?? {}
  const password = typeof body.password === 'string' ? body.password : ''
  if (password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters long' })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: customers } = await query.graph({
      entity: 'customer',
      fields: ['id', 'email'],
      filters: { id: customerId },
    })

    const customer = customers?.[0] as { id: string; email?: string | null } | undefined
    if (!customer?.email) {
      res.status(404).json({ message: 'Customer account not found' })
      return
    }

    const authService = req.scope.resolve(Modules.AUTH)
    // eslint-disable-next-line @medusajs/no-service-mutations-in-api-route
    const result = await authService.updateProvider('emailpass', {
      entity_id: customer.email,
      password,
    })

    if (!result.success) {
      res.status(400).json({ message: result.error || 'Failed to update password' })
      return
    }

    res.status(200).json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    res.status(500).json({ message })
  }
}

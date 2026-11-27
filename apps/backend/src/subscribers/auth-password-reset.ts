import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

interface PasswordResetEventData {
  entity_id?: string
  actor_type?: string
  token?: string
}

/**
 * Handles Medusa `auth.password_reset` events by dispatching a password reset email
 * (or logging the safe reset URL path when Resend mock mode is active in dev).
 */
export default async function authPasswordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetEventData>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (data.actor_type !== 'customer' || !data.entity_id || !data.token) {
    return
  }

  const storefrontUrl = (
    process.env.STOREFRONT_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '')

  const resetUrl = `${storefrontUrl}/auth/reset-password?email=${encodeURIComponent(
    data.entity_id
  )}&token=${encodeURIComponent(data.token)}`

  try {
    const notificationModule = container.resolve(Modules.NOTIFICATION)
    await notificationModule.createNotifications({
      to: data.entity_id,
      channel: 'email',
      template: 'customer-password-reset',
      content: {
        subject: 'Reset your Mobile Station account password',
        html: `<p>Hello,</p><p>We received a request to reset the password for your Mobile Station account (${data.entity_id}).</p><p><a href="${resetUrl}">Click here to set a new password</a></p><p>If you did not request this, you can safely ignore this message.</p>`,
        text: `Reset your Mobile Station password: ${resetUrl}`,
      },
      data: {
        email: data.entity_id,
        reset_url: resetUrl,
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Notification dispatch failed'
    logger.warn(`[auth-password-reset] Failed to send email to ${data.entity_id}: ${msg}`)
  }
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
}

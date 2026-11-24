import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils'
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from '@medusajs/framework/types'
import { Resend } from 'resend'

export interface ResendNotificationOptions {
  channels?: string[]
  api_key?: string
  from_email?: string
  from_name?: string
  reply_to?: string
  mock_mode?: boolean
}

type InjectedDependencies = {
  logger?: Logger
}

export class ResendNotificationService extends AbstractNotificationProviderService {
  public static identifier = 'resend-email'

  private readonly options: ResendNotificationOptions
  private readonly logger?: Logger
  private readonly resend?: Resend
  private readonly isMock: boolean

  constructor(container: InjectedDependencies = {}, options: ResendNotificationOptions = {}) {
    super()
    this.logger = container.logger
    this.options = options

    const apiKey = options.api_key || process.env.RESEND_API_KEY || ''
    this.isMock =
      options.mock_mode === true ||
      process.env.NOTIFICATION_MOCK_MODE === 'true' ||
      process.env.NODE_ENV === 'test' ||
      !apiKey

    if (!this.isMock) {
      this.resend = new Resend(apiKey)
    }
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const to = notification.to
    if (!to || !to.includes('@')) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Valid recipient email is required')
    }

    const fromEmail =
      notification.from ||
      this.options.from_email ||
      process.env.NOTIFICATION_FROM_EMAIL ||
      'onboarding@resend.dev'
    const fromName = this.options.from_name || process.env.NOTIFICATION_FROM_NAME || 'Mobile Station'
    const from = `${fromName} <${fromEmail}>`

    const content = (notification.content || {}) as {
      subject?: string
      html?: string
      text?: string
    }
    const subject = content.subject || `Mobile Station Update (${notification.template})`
    const html = content.html || `<p>${content.text || 'Order notification from Mobile Station.'}</p>`

    if (this.isMock || !this.resend) {
      this.logger?.info?.(`[ResendNotificationService:MOCK] -> ${to} | ${subject}`)
      return { id: `mock_email_${Date.now()}` }
    }

    const { data, error } = await this.resend.emails.send({
      from,
      to,
      replyTo: this.options.reply_to || process.env.NOTIFICATION_REPLY_TO,
      subject,
      html,
    })

    if (error) {
      this.logger?.error?.(`[ResendNotificationService] Send failed: ${error.message}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Resend failed: ${error.message}`)
    }

    return { id: data?.id || `resend_${Date.now()}` }
  }
}

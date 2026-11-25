import { describe, expect, it } from 'vitest'
import {
  buildWhatsAppChatUrl,
  formatWhatsAppSupportMessage,
} from '../components/support/WhatsAppSupportWidget'

describe('WhatsApp support message system', () => {
  it('formats structured support messages with optional reference and page path', () => {
    const msg = formatWhatsAppSupportMessage({
      topicLabel: 'Order / Delivery',
      customerRef: 'MS-ORD-2026-00123',
      messageBody: 'Need open-box delivery slot confirmation.',
      pagePath: '/products/apple-iphone-16-5g',
    })

    expect(msg).toContain('Hello Mobile Station Support,')
    expect(msg).toContain('Topic: Order / Delivery')
    expect(msg).toContain('Name / Order Ref: MS-ORD-2026-00123')
    expect(msg).toContain('Message: Need open-box delivery slot confirmation.')
    expect(msg).toContain('Page: /products/apple-iphone-16-5g')
  })

  it('omits optional lines on home page when customer reference is blank', () => {
    const msg = formatWhatsAppSupportMessage({
      topicLabel: 'Product & Stock',
      customerRef: '   ',
      messageBody: 'Is MacBook Air M3 in stock at Motijheel?',
      pagePath: '/',
    })

    expect(msg).not.toContain('Name / Order Ref:')
    expect(msg).not.toContain('Page:')
  })

  it('builds a valid wa.me URL stripping non-digit characters from phone numbers', () => {
    const url = buildWhatsAppChatUrl('+91 99000-00000', 'Hi team!')
    expect(url).toBe('https://wa.me/919900000000?text=Hi%20team!')
  })
})

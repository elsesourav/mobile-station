import { describe, expect, it } from 'vitest'
import { ALL_CATEGORIES, ALL_PRODUCTS } from '../lib/catalog'
import { resolvePageWhatsAppContext } from '../lib/whatsapp-context'
import {
  buildWhatsAppChatUrl,
  formatWhatsAppSupportMessage,
} from '../components/support/WhatsAppSupportWidget'

describe('WhatsApp support message & context system', () => {
  it('formats structured support messages with product context, tags, cart, and page path', () => {
    const msg = formatWhatsAppSupportMessage({
      topicLabel: 'Stock & Offer Price',
      customerRef: 'MS-ORD-2026-00123',
      messageBody: 'Need open-box delivery slot confirmation.',
      pagePath: '/products/apple-iphone-16-5g',
      productLabel: 'Apple iPhone 16 5G (MYEC3HN/A · ₹74,900)',
      selectedTags: ['Need 18% GST Invoice', 'Same-Day Pickup (842001)'],
      cartSummary: '1 item (₹74,900)',
    })

    expect(msg).toContain('Hello Mobile Station Support,')
    expect(msg).toContain('Topic: Stock & Offer Price')
    expect(msg).toContain('Product: Apple iPhone 16 5G (MYEC3HN/A · ₹74,900)')
    expect(msg).toContain('Tags: Need 18% GST Invoice, Same-Day Pickup (842001)')
    expect(msg).toContain('Cart: 1 item (₹74,900)')
    expect(msg).toContain('Name / Order Ref: MS-ORD-2026-00123')
    expect(msg).toContain('Message: Need open-box delivery slot confirmation.')
    expect(msg).toContain('Page: /products/apple-iphone-16-5g')
  })

  it('omits optional lines on home page when customer reference and tags are blank', () => {
    const msg = formatWhatsAppSupportMessage({
      topicLabel: 'Product & Stock',
      customerRef: '   ',
      messageBody: 'Is MacBook Air M3 in stock at Motijheel?',
      pagePath: '/',
    })

    expect(msg).not.toContain('Name / Order Ref:')
    expect(msg).not.toContain('Page:')
    expect(msg).not.toContain('Product:')
    expect(msg).not.toContain('Tags:')
  })

  it('resolves PDP product context, quick topics, and recently viewed selectable tags automatically', () => {
    const ctx = resolvePageWhatsAppContext({
      pathname: '/products/apple-iphone-16-5g',
      allProducts: ALL_PRODUCTS,
      allCategories: ALL_CATEGORIES,
      recentlyViewedHandles: ['sony-wh-1000xm5-anc'],
      cartItems: [],
    })

    expect(ctx.pageType).toBe('product')
    expect(ctx.activeProduct?.handle).toBe('apple-iphone-16-5g')
    expect(ctx.topics[0]?.template).toContain('Apple iPhone 16 5G')
    expect(ctx.selectableProducts.map((p) => p.handle)).toContain('apple-iphone-16-5g')
    expect(ctx.selectableProducts.map((p) => p.handle)).toContain('sony-wh-1000xm5-anc')
  })

  it('resolves Category and Search query page contexts cleanly', () => {
    const catCtx = resolvePageWhatsAppContext({
      pathname: '/categories/laptops',
      allProducts: ALL_PRODUCTS,
      allCategories: ALL_CATEGORIES,
      recentlyViewedHandles: [],
      cartItems: [],
    })
    expect(catCtx.pageType).toBe('category')
    expect(catCtx.contextSummary).toContain('Laptops')

    const searchCtx = resolvePageWhatsAppContext({
      pathname: '/search',
      searchQuery: 'Galaxy S24 Ultra',
      allProducts: ALL_PRODUCTS,
      allCategories: ALL_CATEGORIES,
      recentlyViewedHandles: [],
      cartItems: [],
    })
    expect(searchCtx.pageType).toBe('search')
    expect(searchCtx.contextSummary).toContain('Galaxy S24 Ultra')
  })

  it('builds a valid wa.me URL stripping non-digit characters from phone numbers', () => {
    const url = buildWhatsAppChatUrl('+91 99000-00000', 'Hi team!')
    expect(url).toBe('https://wa.me/919900000000?text=Hi%20team!')
  })
})

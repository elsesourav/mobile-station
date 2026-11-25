import { describe, expect, it } from 'vitest'
import type { StorefrontProduct } from '@mobile-station/types'
import { ALL_PRODUCTS, sortProductsByRecency } from '../lib/catalog'

function mockDatedProduct(
  handle: string,
  dates: { created_at?: string; updated_at?: string }
): StorefrontProduct {
  const base = ALL_PRODUCTS[0]
  return {
    ...base,
    handle,
    title: handle,
    ...dates,
  }
}

describe('Homepage recent product ordering and caps', () => {
  it('sorts products by updated_at then created_at descending', () => {
    const items = [
      mockDatedProduct('older', {
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-02T00:00:00Z',
      }),
      mockDatedProduct('newest-created', {
        created_at: '2026-11-20T00:00:00Z',
      }),
      mockDatedProduct('newest-updated', {
        created_at: '2026-09-01T00:00:00Z',
        updated_at: '2026-11-25T10:00:00Z',
      }),
    ]

    const sorted = sortProductsByRecency(items)
    expect(sorted.map((p) => p.handle)).toEqual([
      'newest-updated',
      'newest-created',
      'older',
    ])
  })

  it('preserves source order cleanly when products have no timestamps', () => {
    const sorted = sortProductsByRecency(ALL_PRODUCTS)
    expect(sorted.length).toBe(ALL_PRODUCTS.length)
    expect(sorted[0].handle).toBe(ALL_PRODUCTS[0].handle)
    expect(sorted.slice(0, 30).length).toBe(30)
  })
})

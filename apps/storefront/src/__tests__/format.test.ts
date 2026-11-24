import { describe, expect, it } from 'vitest'
import { discountPercent, formatINR, monthlyEmiPreview } from '../lib/format'
import {
  electronicsMetadataSchema,
  indianGstinSchema,
  indianPincodeSchema,
} from '@mobile-station/types'
import catalogSeed from '../../../../data/catalog/products-seed.json'

describe('Mobile Station pricing & formatting helpers', () => {
  it('formats paise into Indian Rupee strings cleanly', () => {
    expect(formatINR(7490000)).toBe('₹74,900')
    expect(formatINR(49900)).toBe('₹499')
  })

  it('computes accurate percentage discounts', () => {
    expect(discountPercent(7990000, 7490000)).toBe(6)
    expect(discountPercent(10000, 12000)).toBe(0)
  })

  it('computes monthly EMI preview', () => {
    expect(monthlyEmiPreview(7490000, 6)).toBe('₹12,484')
  })
})

describe('Electronics catalog & Indian validation contracts', () => {
  it('validates Muzaffarpur & Pan-India PIN codes and GSTIN', () => {
    expect(indianPincodeSchema.safeParse('842001').success).toBe(true)
    expect(indianPincodeSchema.safeParse('042001').success).toBe(false)
    expect(indianGstinSchema.safeParse('10AABCU9603R1ZM').success).toBe(true)
    expect(indianGstinSchema.safeParse('INVALID').success).toBe(false)
  })

  it('validates every prepared product in data/catalog/products-seed.json', () => {
    for (const product of catalogSeed.products) {
      const parsed = electronicsMetadataSchema.safeParse(product.metadata)
      expect(parsed.success, `${product.handle} failed schema validation`).toBe(true)
    }
  })
})

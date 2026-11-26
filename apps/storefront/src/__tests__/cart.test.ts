import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { CartItem } from '@mobile-station/types'
import { ALL_OFFERS } from '@/lib/catalog'
import {
  FREE_SHIPPING_THRESHOLD_PAISE,
  STANDARD_SHIPPING_FEE_PAISE,
  buildCartMilestoneRoadmap,
  computeCartPricingSummary,
  evaluateCouponDiscount,
  findBestEligibleDiscountOffer,
  validateCouponForSubtotal,
} from '@/lib/cart-pricing'

const SAMPLE_LOW_PRICE_ITEM: CartItem = {
  sku: 'ANK-100W-CBL',
  productHandle: 'anker-333-100w-usbc-cable',
  title: 'Anker 333 100W Braided USB-C Cable (1.8m)',
  variantTitle: '1.8m / Black',
  brand: 'Anker',
  price_paise: 79900,
  mrp_paise: 119900,
  thumbnail: 'https://res.cloudinary.com/ekbuxdbd/image/upload/v1/cable.webp',
  quantity: 1,
  requires_open_box_delivery: false,
}

const SAMPLE_HIGH_PRICE_ITEM: CartItem = {
  sku: 'ANK-735-65W',
  productHandle: 'anker-735-nano-ii-65w-charger',
  title: 'Anker 735 (Nano II) 65W 3-Port GaN Fast Charger',
  variantTitle: '65W 3-Port / Obsidian',
  brand: 'Anker',
  price_paise: 349900,
  mrp_paise: 499900,
  thumbnail: 'https://res.cloudinary.com/ekbuxdbd/image/upload/v1/charger.webp',
  quantity: 1,
  requires_open_box_delivery: false,
}

describe('Mobile Station cart pricing, coupons, and milestone roadmap', () => {
  it('charges standard insured courier below ₹999 and unlocks FREE delivery at ₹999+', () => {
    const emptySummary = computeCartPricingSummary([], null, ALL_OFFERS)
    expect(emptySummary.shippingPaise).toBe(0)
    expect(emptySummary.totalPaise).toBe(0)

    const lowSummary = computeCartPricingSummary([SAMPLE_LOW_PRICE_ITEM], null, ALL_OFFERS)
    expect(lowSummary.subtotalPaise).toBe(79900)
    expect(lowSummary.shippingPaise).toBe(STANDARD_SHIPPING_FEE_PAISE)
    expect(lowSummary.totalPaise).toBe(79900 + STANDARD_SHIPPING_FEE_PAISE)
    expect(lowSummary.mrpSavingsPaise).toBe(40000)

    const unlockedSummary = computeCartPricingSummary([SAMPLE_HIGH_PRICE_ITEM], null, ALL_OFFERS)
    expect(unlockedSummary.subtotalPaise).toBeGreaterThanOrEqual(FREE_SHIPPING_THRESHOLD_PAISE)
    expect(unlockedSummary.shippingPaise).toBe(0)
    expect(unlockedSummary.totalPaise).toBe(349900)
  })

  it('evaluates TECH500, DESK10 (capped), and highest-saving offer selection accurately', () => {
    const blocked = validateCouponForSubtotal(79900, 'TECH500', ALL_OFFERS)
    expect(blocked.ok).toBe(false)
    expect(blocked.message).toContain('TECH500')

    const midBest = findBestEligibleDiscountOffer(349900, ALL_OFFERS)
    expect(midBest?.offer.code).toBe('TECH500')
    expect(midBest?.savingsPaise).toBe(50000)

    const highBest = findBestEligibleDiscountOffer(800000, ALL_OFFERS)
    expect(highBest?.offer.code).toBe('DESK10')
    expect(highBest?.savingsPaise).toBe(80000)

    const maxCapped = evaluateCouponDiscount(2000000, 'DESK10', ALL_OFFERS)
    expect(maxCapped.valid).toBe(true)
    expect(maxCapped.discountPaise).toBe(150000)
  })

  it('builds milestone roadmap shortfall headlines and upgrade indicators', () => {
    const belowFree = buildCartMilestoneRoadmap(79900, null, ALL_OFFERS)
    expect(belowFree.nodes).toHaveLength(3)
    expect(belowFree.highlight).toContain('Free Express Shipping')

    const onDesksWithUpgrade = buildCartMilestoneRoadmap(349900, 'DESK10', ALL_OFFERS)
    const tech500Node = onDesksWithUpgrade.nodes.find((n) => n.code === 'TECH500')
    expect(tech500Node?.isUpgrade).toBe(true)
  })

  it('matches Glorov responsive desktop two-column & mobile single-column cart positions', () => {
    const cartClientSrc = readFileSync(
      path.resolve(__dirname, '../components/cart/CartPageClient.tsx'),
      'utf8'
    )
    const headerSrc = readFileSync(
      path.resolve(__dirname, '../components/layout/Header.tsx'),
      'utf8'
    )

    expect(cartClientSrc).toContain('hidden sm:flex items-start gap-4 lg:gap-6')
    expect(cartClientSrc).toContain('flex-[12] lg:flex-[13]')
    expect(cartClientSrc).toContain('flex-[9] lg:flex-[8]')
    expect(cartClientSrc).toContain('flex sm:hidden flex-col gap-2.5 pb-28')
    expect(cartClientSrc).toContain('<CartStickyCheckoutBar')
    expect(headerSrc).toContain('href="/cart"')
  })
})

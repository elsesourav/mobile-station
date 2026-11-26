import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { CartItem, UserBehaviorEvent } from '@mobile-station/types'
import { ALL_PRODUCTS } from '@/lib/catalog'
import {
  buildBehaviorProfile,
  computeTimeDecayWeight,
  EMPTY_BEHAVIOR_PROFILE,
  SESSION_HALF_LIFE_MS,
} from '@/lib/recommendations/behavior'
import {
  getCompatibleAccessoriesForProduct,
  isCompatibleAccessory,
} from '@/lib/recommendations/compatibility'
import {
  applyMmrDiversityRerank,
  getCartCrossSellRecommendations,
  getHomeRecommendations,
  getPdpRecommendations,
} from '@/lib/recommendations/engine'
import {
  computeContentSimilarity,
  extractProductFeatures,
} from '@/lib/recommendations/similarity'

function findProduct(handle: string) {
  const found = ALL_PRODUCTS.find((p) => p.handle === handle)
  if (!found) throw new Error(`Missing product ${handle}`)
  return found
}

describe('Mobile Station Hybrid Electronics Recommendation Engine', () => {
  it('scores content similarity higher for sibling smartphones than unrelated cables', () => {
    const iphone = extractProductFeatures(findProduct('apple-iphone-16-5g'))
    const iphonePro = extractProductFeatures(findProduct('apple-iphone-16-pro-5g'))
    const cable = extractProductFeatures(findProduct('anker-333-100w-usbc-cable'))

    expect(computeContentSimilarity(iphone, iphonePro)).toBeGreaterThan(
      computeContentSimilarity(iphone, cable)
    )
  })

  it('enforces hard compatibility rules preventing Apple cases on Samsung devices', () => {
    const iphone = findProduct('apple-iphone-16-5g')
    const s24Ultra = findProduct('samsung-galaxy-s24-ultra-5g')
    const magSafeCase = findProduct('spigen-ultra-hybrid-magsafe-iphone-16')
    const samsungCharger = findProduct('samsung-45w-pd-super-fast-charger')

    expect(isCompatibleAccessory(iphone, magSafeCase)).toBe(true)
    expect(isCompatibleAccessory(s24Ultra, magSafeCase)).toBe(false)
    expect(isCompatibleAccessory(s24Ultra, samsungCharger)).toBe(true)

    const iphoneAccessories = getCompatibleAccessoriesForProduct(
      iphone,
      ALL_PRODUCTS,
      new Set([iphone.handle]),
      4
    )
    expect(iphoneAccessories.length).toBeGreaterThanOrEqual(2)
    expect(
      iphoneAccessories.some((a) => a.product.handle === 'spigen-ultra-hybrid-magsafe-iphone-16')
    ).toBe(true)
  })

  it('applies exponential time-decay weighting with higher intent weight on cart adds', () => {
    const now = 1_750_000_000_000
    expect(computeTimeDecayWeight(now, now)).toBeCloseTo(1, 5)
    expect(computeTimeDecayWeight(now - SESSION_HALF_LIFE_MS, now)).toBeCloseTo(0.5, 5)

    const productsByHandle = new Map(ALL_PRODUCTS.map((p) => [p.handle, p]))
    const events: UserBehaviorEvent[] = [
      {
        id: 'e1',
        signalType: 'view',
        productHandle: 'sony-wh-1000xm5-anc',
        categoryHandle: 'audio',
        brand: 'Sony',
        timestamp: now - SESSION_HALF_LIFE_MS * 2,
      },
      {
        id: 'e2',
        signalType: 'cart_add',
        productHandle: 'apple-macbook-air-13-m3',
        categoryHandle: 'laptops',
        brand: 'Apple',
        timestamp: now - 1000,
      },
    ]

    const profile = buildBehaviorProfile(events, productsByHandle, now)
    expect(profile.preferredBrands.apple).toBeGreaterThan(profile.preferredBrands.sony)
    expect(profile.preferredCategories.laptops).toBeGreaterThan(profile.preferredCategories.audio)
    expect(profile.recentlyViewedHandles).toEqual(['sony-wh-1000xm5-anc'])
  })

  it('delivers diversified cold-start picks and pivots to workspace/Apple accessories when active', () => {
    const coldStart = getHomeRecommendations(ALL_PRODUCTS, EMPTY_BEHAVIOR_PROFILE, [], {}, 8)
    expect(coldStart).toHaveLength(8)

    const macbook = findProduct('apple-macbook-air-13-m3')
    const productsByHandle = new Map(ALL_PRODUCTS.map((p) => [p.handle, p]))
    const profile = buildBehaviorProfile(
      [
        {
          id: 'ev_mac',
          signalType: 'view',
          productHandle: macbook.handle,
          categoryHandle: macbook.category_handle,
          brand: macbook.metadata.brand,
          timestamp: Date.now(),
        },
      ],
      productsByHandle
    )

    const cart: CartItem[] = [
      {
        sku: macbook.variants[0].sku,
        productHandle: macbook.handle,
        title: macbook.title,
        variantTitle: macbook.variants[0].title,
        brand: macbook.metadata.brand,
        price_paise: macbook.variants[0].price_paise,
        mrp_paise: macbook.variants[0].mrp_paise,
        thumbnail: macbook.thumbnail,
        quantity: 1,
        requires_open_box_delivery: true,
      },
    ]

    const warmRecs = getHomeRecommendations(ALL_PRODUCTS, profile, cart, {}, 8)
    expect(warmRecs.some((r) => r.product.handle === macbook.handle)).toBe(false)
    expect(warmRecs.some((r) => r.reason === 'Pairs Well With' || r.reason === 'Same Brand Ecosystem')).toBe(
      true
    )

    const pdpRecs = getPdpRecommendations(macbook, ALL_PRODUCTS, profile, cart, 4, 4)
    expect(pdpRecs.completeSetup.length).toBeGreaterThanOrEqual(2)
    expect(pdpRecs.similarAlternatives.length).toBeGreaterThanOrEqual(2)
    expect(
      pdpRecs.completeSetup.some((entry) => entry.product.handle === 'belkin-connect-usb-c-hub-7in1')
    ).toBe(true)

    const cartCrossSells = getCartCrossSellRecommendations(cart, ALL_PRODUCTS, profile, 3)
    expect(cartCrossSells.length).toBeGreaterThanOrEqual(2)
    expect(cartCrossSells.some((c) => c.product.handle === macbook.handle)).toBe(false)
  })

  it('reduces redundancy via MMR diversity re-ranking', () => {
    const phones = ALL_PRODUCTS.filter((p) => p.category_handle === 'smartphones').slice(0, 4)
    const audio = findProduct('sony-wh-1000xm5-anc')
    const laptop = findProduct('apple-macbook-air-13-m3')
    const pool = [...phones, audio, laptop].map((product, idx) => ({
      product,
      features: extractProductFeatures(product),
      relevanceScore: 1 - idx * 0.04,
      reason: 'Spec Match' as const,
      explanation: 'Test match',
    }))

    const reranked = applyMmrDiversityRerank(pool, 4, 0.55)
    const uniqueCategories = new Set(reranked.map((r) => r.product.category_handle))
    expect(uniqueCategories.size).toBeGreaterThanOrEqual(2)
  })

  it('renders clean compact recommendation cards without duplicate brand prefixes or verbose badges', () => {
    const recSectionSrc = readFileSync(
      path.resolve(__dirname, '../components/recommendations/PersonalizedHomeSection.tsx'),
      'utf8'
    )
    expect(recSectionSrc).toContain('formatTitleWithoutBrand(')
    expect(recSectionSrc).toContain('COMPACT_REASON_LABELS')
    expect(recSectionSrc).not.toContain('Smart Hybrid Recommendations')
    expect(recSectionSrc).not.toContain('{explanation}')
  })
})

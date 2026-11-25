import type { StorefrontProduct } from '@mobile-station/types'
import { discountPercent } from '@/lib/format'

export interface ProductFeatureDescriptor {
  handle: string
  categoryHandle: string
  subcategoryHandle: string
  brandNormalized: string
  pricePaise: number
  logPriceTier: number
  discountPct: number
  tokenSet: Set<string>
}

const STOP_WORDS = new Set([
  'with',
  'and',
  'for',
  'the',
  'edition',
  'indian',
  'official',
  'warranty',
  'pro',
  'plus',
  'inch',
  'cm',
])

function tokenizeText(raw: string): string[] {
  return raw
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token))
}

export function getEffectivePricePaise(product: StorefrontProduct): number {
  return product.variants[0]?.price_paise ?? 0
}

export function getTotalAvailableStock(product: StorefrontProduct): number {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0)
}

/**
 * Extracts normalized metadata & technical specification tokens + log-price tier
 * for content-based electronics similarity comparisons.
 */
export function extractProductFeatures(product: StorefrontProduct): ProductFeatureDescriptor {
  const tokenSet = new Set<string>()

  tokenSet.add(`cat:${product.category_handle}`)
  tokenSet.add(`sub:${product.subcategory_handle}`)
  tokenSet.add(`brand:${product.metadata.brand.toLowerCase()}`)

  for (const token of tokenizeText(product.title)) tokenSet.add(token)
  for (const token of tokenizeText(product.subtitle)) tokenSet.add(token)
  for (const highlight of product.metadata.key_highlights ?? []) {
    for (const token of tokenizeText(highlight)) tokenSet.add(token)
  }

  const specs = product.metadata.specs ?? {}
  for (const [specKey, specVal] of Object.entries(specs)) {
    if (specVal === undefined || specVal === null) continue
    if (typeof specVal === 'boolean') {
      if (specVal) tokenSet.add(`spec:${specKey}`)
      continue
    }
    if (Array.isArray(specVal)) {
      for (const entry of specVal) {
        for (const token of tokenizeText(entry)) tokenSet.add(`${specKey}:${token}`)
      }
      continue
    }
    if (typeof specVal === 'number') {
      tokenSet.add(`${specKey}:${specVal}`)
      continue
    }
    for (const token of tokenizeText(String(specVal))) {
      tokenSet.add(`${specKey}:${token}`)
    }
  }

  const pricePaise = Math.max(100, getEffectivePricePaise(product))
  const mrpPaise = product.variants[0]?.mrp_paise ?? pricePaise

  return {
    handle: product.handle,
    categoryHandle: product.category_handle,
    subcategoryHandle: product.subcategory_handle,
    brandNormalized: product.metadata.brand.toLowerCase(),
    pricePaise,
    logPriceTier: Math.log10(pricePaise / 100),
    discountPct: discountPercent(mrpPaise, pricePaise),
    tokenSet,
  }
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const item of setA) {
    if (setB.has(item)) intersection += 1
  }
  const union = setA.size + setB.size - intersection
  return union > 0 ? intersection / union : 0
}

/**
 * Computes weighted hybrid content similarity [0..1] combining:
 * - Technical spec & feature token overlap (0.42)
 * - Category & subcategory structure (0.22)
 * - Log-price proximity curve (0.22)
 * - Brand ecosystem alignment (0.14)
 */
export function computeContentSimilarity(
  featA: ProductFeatureDescriptor,
  featB: ProductFeatureDescriptor
): number {
  const tokenSim = jaccardSimilarity(featA.tokenSet, featB.tokenSet)
  const categoryScore =
    featA.subcategoryHandle === featB.subcategoryHandle
      ? 1.0
      : featA.categoryHandle === featB.categoryHandle
        ? 0.68
        : 0.0
  const brandScore = featA.brandNormalized === featB.brandNormalized ? 1.0 : 0.0

  const priceDiff = Math.abs(featA.logPriceTier - featB.logPriceTier)
  const priceScore = Math.exp(-(priceDiff * priceDiff) / 0.28)

  return tokenSim * 0.42 + categoryScore * 0.22 + priceScore * 0.22 + brandScore * 0.14
}

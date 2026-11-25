import type {
  CartItem,
  PdpRecommendationsResult,
  RecommendationReasonTag,
  RecommendedProductItem,
  StorefrontProduct,
  UserBehaviorProfile,
} from '@mobile-station/types'
import { getEventCombinedWeight } from '@/lib/recommendations/behavior'
import { getCompatibleAccessoriesForProduct } from '@/lib/recommendations/compatibility'
import {
  computeContentSimilarity,
  extractProductFeatures,
  getEffectivePricePaise,
  getTotalAvailableStock,
  type ProductFeatureDescriptor,
} from '@/lib/recommendations/similarity'

interface ScoredCandidate {
  product: StorefrontProduct
  features: ProductFeatureDescriptor
  relevanceScore: number
  reason: RecommendationReasonTag
  explanation: string
}

const DEFAULT_MMR_LAMBDA = 0.72

/**
 * Maximal Marginal Relevance (MMR) Diversity Re-ranking:
 * MMR = argmax_i [ lambda * Rel(i, U) - (1 - lambda) * max_{j in Selected} Sim(i, j) ]
 * Prevents repetitive echo chambers (e.g. 5 near-identical phones in a row).
 */
export function applyMmrDiversityRerank(
  candidates: ScoredCandidate[],
  topK: number,
  lambda = DEFAULT_MMR_LAMBDA
): RecommendedProductItem[] {
  if (candidates.length === 0 || topK <= 0) return []

  const maxRel = Math.max(...candidates.map((c) => c.relevanceScore), 1e-6)
  const remaining = [...candidates]
  const selected: { candidate: ScoredCandidate; features: ProductFeatureDescriptor }[] = []

  while (selected.length < topK && remaining.length > 0) {
    let bestIdx = 0
    let bestMmr = -Infinity

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i]
      const normalizedRel = candidate.relevanceScore / maxRel

      let maxSimToSelected = 0
      for (const prev of selected) {
        const sim = computeContentSimilarity(candidate.features, prev.features)
        if (sim > maxSimToSelected) maxSimToSelected = sim
      }

      const mmrScore = lambda * normalizedRel - (1 - lambda) * maxSimToSelected
      if (mmrScore > bestMmr) {
        bestMmr = mmrScore
        bestIdx = i
      }
    }

    const picked = remaining.splice(bestIdx, 1)[0]
    selected.push({ candidate: picked, features: picked.features })
  }

  return selected.map(({ candidate }) => ({
    product: candidate.product,
    score: Number(candidate.relevanceScore.toFixed(3)),
    reason: candidate.reason,
    explanation: candidate.explanation,
  }))
}

function buildFeatureMap(products: readonly StorefrontProduct[]): Map<string, ProductFeatureDescriptor> {
  const map = new Map<string, ProductFeatureDescriptor>()
  for (const product of products) {
    map.set(product.handle, extractProductFeatures(product))
  }
  return map
}

function getStockAndDealPrior(features: ProductFeatureDescriptor, product: StorefrontProduct): number {
  const stock = getTotalAvailableStock(product)
  const stockScore = stock > 0 ? Math.min(0.2, 0.1 + stock * 0.004) : -1
  const dealScore = Math.min(0.25, features.discountPct * 0.01)
  return stockScore + dealScore
}

/**
 * Generates Homepage personalized "Recommended For You" picks combining:
 * - Time-decayed session history similarity
 * - Active cart accessory synergy
 * - Optional Redis backend popularity boosts
 * - Cold-start quality priors + MMR multi-category diversity
 */
export function getHomeRecommendations(
  allProducts: StorefrontProduct[],
  profile: UserBehaviorProfile,
  cartItems: readonly CartItem[],
  popularityScores: Record<string, number> = {},
  limit = 8,
  nowMs = Date.now()
): RecommendedProductItem[] {
  const cartHandleSet = new Set(cartItems.map((item) => item.productHandle))
  const featureMap = buildFeatureMap(allProducts)
  const hasHistory = profile.events.length > 0 || cartItems.length > 0

  const cartProducts = cartItems
    .map((item) => allProducts.find((p) => p.handle === item.productHandle))
    .filter((p): p is StorefrontProduct => Boolean(p))

  const candidates: ScoredCandidate[] = []

  for (const product of allProducts) {
    if (cartHandleSet.has(product.handle)) continue
    if (getTotalAvailableStock(product) <= 0) continue

    const features = featureMap.get(product.handle)!
    const qualityPrior = getStockAndDealPrior(features, product)
    const popBoost = Math.min(0.2, (popularityScores[product.handle] ?? 0) * 0.01)

    if (!hasHistory) {
      candidates.push({
        product,
        features,
        relevanceScore: 0.45 + qualityPrior + popBoost,
        reason: features.discountPct >= 14 ? 'Top Value Deal' : 'Popular In Hub',
        explanation:
          features.discountPct >= 14
            ? `Save ${features.discountPct}% off MRP · Verified sealed unit`
            : `In-stock ${product.metadata.brand} favorite at Muzaffarpur Hub`,
      })
      continue
    }

    // 1. Time-decayed content similarity to user's recent events
    let behaviorSimWeighted = 0
    let behaviorWeightSum = 0
    for (const event of profile.events.slice(0, 20)) {
      const eventWeight = getEventCombinedWeight(event, nowMs)
      behaviorWeightSum += eventWeight

      if (event.productHandle) {
        const anchorFeat = featureMap.get(event.productHandle)
        if (anchorFeat) {
          behaviorSimWeighted += computeContentSimilarity(anchorFeat, features) * eventWeight
        }
      } else if (event.categoryHandle === product.category_handle) {
        behaviorSimWeighted += 0.65 * eventWeight
      } else if (
        event.searchTerm &&
        `${product.title} ${product.metadata.brand} ${product.category_handle}`
          .toLowerCase()
          .includes(event.searchTerm.toLowerCase())
      ) {
        behaviorSimWeighted += 0.72 * eventWeight
      }
    }

    const sessionSim = behaviorWeightSum > 0 ? behaviorSimWeighted / behaviorWeightSum : 0
    const catWeight = profile.preferredCategories[product.category_handle] ?? 0
    const brandWeight = profile.preferredBrands[features.brandNormalized] ?? 0
    const totalW = Math.max(1, profile.totalWeightedScore)

    const affinityBoost = Math.min(0.35, (catWeight / totalW) * 0.25 + (brandWeight / totalW) * 0.22)

    let priceFitBonus = 0
    if (profile.priceBand && profile.priceBand.medianPaise > 0) {
      const ratio = Math.abs(
        Math.log10(Math.max(100, getEffectivePricePaise(product))) -
          Math.log10(Math.max(100, profile.priceBand.medianPaise))
      )
      priceFitBonus = Math.exp(-(ratio * ratio) / 0.35) * 0.12
    }

    // 2. Active Cart Accessory boost
    let cartPairBoost = 0
    let cartPairReason = ''
    for (const cartProd of cartProducts) {
      const matches = getCompatibleAccessoriesForProduct(cartProd, [product], cartHandleSet, 1)
      if (matches[0] && matches[0].compatibilityScore > cartPairBoost) {
        cartPairBoost = matches[0].compatibilityScore * 0.45
        cartPairReason = matches[0].explanation
      }
    }

    // Suppress exact item if user ALREADY clicked/viewed it just now so discovery stays fresh
    const isRecentlyViewed = profile.recentlyViewedHandles.slice(0, 3).includes(product.handle)
    const noveltyAdjustment = isRecentlyViewed ? -0.18 : 0.06

    const relevanceScore =
      sessionSim * 0.55 +
      affinityBoost +
      priceFitBonus +
      cartPairBoost +
      qualityPrior * 0.45 +
      popBoost +
      noveltyAdjustment

    let reason: RecommendationReasonTag = 'Inspired By Browsing'
    let explanation = `Matched with your ${product.metadata.brand} & tech browsing activity`
    if (cartPairReason) {
      reason = 'Pairs Well With'
      explanation = cartPairReason
    } else if (brandWeight > 0 && catWeight > 0) {
      reason = 'Same Brand Ecosystem'
      explanation = `More from ${product.metadata.brand} in your preferred range`
    }

    candidates.push({ product, features, relevanceScore, reason, explanation })
  }

  candidates.sort((a, b) => b.relevanceScore - a.relevanceScore)
  return applyMmrDiversityRerank(candidates, limit, 0.72)
}

/**
 * Computes PDP recommendations split into two distinct high-converting electronics modules:
 * 1. "Complete Your Setup" (verified hardware-compatible accessories)
 * 2. "Similar Alternatives & Upgrades" (spec & price tier similarity + MMR diversity)
 */
export function getPdpRecommendations(
  anchor: StorefrontProduct,
  allProducts: StorefrontProduct[],
  profile: UserBehaviorProfile,
  cartItems: readonly CartItem[],
  limitSetup = 4,
  limitSimilar = 4
): PdpRecommendationsResult {
  const excludedForAccessories = new Set<string>([
    anchor.handle,
    ...cartItems.map((item) => item.productHandle),
  ])

  const compatibleAccessories = getCompatibleAccessoriesForProduct(
    anchor,
    allProducts,
    excludedForAccessories,
    limitSetup
  )

  const completeSetup: RecommendedProductItem[] = compatibleAccessories.map((entry) => ({
    product: entry.product,
    score: Number(entry.compatibilityScore.toFixed(3)),
    reason: entry.compatibilityScore >= 0.9 ? 'Accessory Essential' : 'Pairs Well With',
    explanation: entry.explanation,
  }))

  const featureMap = buildFeatureMap(allProducts)
  const anchorFeat = featureMap.get(anchor.handle) ?? extractProductFeatures(anchor)

  const similarCandidates: ScoredCandidate[] = []
  for (const product of allProducts) {
    if (product.handle === anchor.handle) continue
    if (getTotalAvailableStock(product) <= 0) continue

    const candFeat = featureMap.get(product.handle) ?? extractProductFeatures(product)
    if (candFeat.categoryHandle !== anchorFeat.categoryHandle) continue

    const simScore = computeContentSimilarity(anchorFeat, candFeat)
    const brandAffinity = (profile.preferredBrands[candFeat.brandNormalized] ?? 0) > 0 ? 0.06 : 0
    const relevanceScore = simScore + brandAffinity + getStockAndDealPrior(candFeat, product) * 0.25

    const isSameBrand = candFeat.brandNormalized === anchorFeat.brandNormalized
    similarCandidates.push({
      product,
      features: candFeat,
      relevanceScore,
      reason: isSameBrand ? 'Same Brand Ecosystem' : 'Spec Match',
      explanation: isSameBrand
        ? `Alternative ${product.metadata.brand} tier in ${product.subcategory_handle.replace('-', ' ')}`
        : `Comparable hardware specs & pricing to ${anchor.metadata.brand}`,
    })
  }

  similarCandidates.sort((a, b) => b.relevanceScore - a.relevanceScore)

  return {
    completeSetup,
    similarAlternatives: applyMmrDiversityRerank(similarCandidates, limitSimilar, 0.74),
  }
}

/**
 * Computes live Cart Drawer cross-sell accessories compatible with aggregate cart contents,
 * dynamically excluding any item already in the cart.
 */
export function getCartCrossSellRecommendations(
  cartItems: readonly CartItem[],
  allProducts: StorefrontProduct[],
  profile: UserBehaviorProfile,
  limit = 3
): RecommendedProductItem[] {
  if (cartItems.length === 0) return []

  const inCartHandles = new Set(cartItems.map((item) => item.productHandle))
  const aggregated = new Map<string, { item: RecommendedProductItem; totalScore: number }>()

  for (const cartItem of cartItems) {
    const anchorProduct = allProducts.find((p) => p.handle === cartItem.productHandle)
    if (!anchorProduct) continue

    const matches = getCompatibleAccessoriesForProduct(
      anchorProduct,
      allProducts,
      inCartHandles,
      limit * 2
    )

    for (const match of matches) {
      const brandBoost =
        (profile.preferredBrands[match.product.metadata.brand.toLowerCase()] ?? 0) > 0 ? 0.08 : 0
      const combinedScore = match.compatibilityScore + brandBoost
      const existing = aggregated.get(match.product.handle)
      if (!existing || combinedScore > existing.totalScore) {
        aggregated.set(match.product.handle, {
          totalScore: combinedScore,
          item: {
            product: match.product,
            score: Number(combinedScore.toFixed(3)),
            reason: combinedScore >= 0.9 ? 'Accessory Essential' : 'Pairs Well With',
            explanation: match.explanation,
          },
        })
      }
    }
  }

  return Array.from(aggregated.values())
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit)
    .map((entry) => entry.item)
}

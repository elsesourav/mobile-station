import type {
  CartItem,
  CartMilestoneNode,
  CartMilestoneRoadmap,
  CartPricingSummary,
  CouponActionResult,
  StorefrontOffer,
} from '@mobile-station/types'
import { ALL_OFFERS } from '@/lib/catalog'
import { discountPercent, formatINR } from '@/lib/format'

export const FREE_SHIPPING_THRESHOLD_PAISE = 99900
export const STANDARD_SHIPPING_FEE_PAISE = 9900
export const CART_PINCODE_STORAGE_KEY = 'mobile_station_cart_pincode_v1'

/**
 * Evaluates a candidate promo code against the current cart subtotal and configured offers.
 */
export function evaluateCouponDiscount(
  subtotalPaise: number,
  rawCode: string | null | undefined,
  offers: readonly StorefrontOffer[] = ALL_OFFERS
): {
  valid: boolean
  code: string | null
  discountPaise: number
  offer: StorefrontOffer | null
  reason?: string
} {
  const cleanCode = rawCode?.trim().toUpperCase() ?? ''
  if (!cleanCode) {
    return { valid: false, code: null, discountPaise: 0, offer: null }
  }

  const matched = offers.find(
    (offer) => offer.is_active !== false && offer.code.trim().toUpperCase() === cleanCode
  )
  if (!matched) {
    return {
      valid: false,
      code: null,
      discountPaise: 0,
      offer: null,
      reason: `Promo code "${cleanCode}" is not recognized.`,
    }
  }

  const minCart = matched.min_cart_paise ?? 0
  if (subtotalPaise < minCart) {
    const shortfall = minCart - subtotalPaise
    return {
      valid: false,
      code: null,
      discountPaise: 0,
      offer: matched,
      reason: `Add ${formatINR(shortfall)} more to unlock ${matched.code}.`,
    }
  }

  let discountPaise = 0
  if (matched.discount_type === 'fixed' && typeof matched.amount_paise === 'number') {
    discountPaise = Math.min(subtotalPaise, Math.max(0, matched.amount_paise))
  } else if (
    matched.discount_type === 'percentage' &&
    typeof matched.percentage === 'number'
  ) {
    const computed = Math.round((subtotalPaise * matched.percentage) / 100)
    const capped =
      typeof matched.max_discount_paise === 'number'
        ? Math.min(computed, matched.max_discount_paise)
        : computed
    discountPaise = Math.min(subtotalPaise, Math.max(0, capped))
  }

  return {
    valid: true,
    code: matched.code,
    discountPaise,
    offer: matched,
  }
}

/**
 * Computes full cart totals including MRP baseline, active coupon savings,
 * and free insured shipping unlock threshold (₹999+).
 */
export function computeCartPricingSummary(
  items: readonly CartItem[],
  appliedCoupon: string | null,
  offers: readonly StorefrontOffer[] = ALL_OFFERS
): CartPricingSummary {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotalPaise = items.reduce(
    (sum, item) => sum + item.price_paise * item.quantity,
    0
  )
  const mrpTotalPaise = items.reduce(
    (sum, item) => sum + Math.max(item.mrp_paise, item.price_paise) * item.quantity,
    0
  )
  const mrpSavingsPaise = Math.max(0, mrpTotalPaise - subtotalPaise)

  const couponEval = evaluateCouponDiscount(subtotalPaise, appliedCoupon, offers)
  const couponDiscountPaise = couponEval.valid ? couponEval.discountPaise : 0
  const afterCouponPaise = Math.max(0, subtotalPaise - couponDiscountPaise)

  const shippingPaise =
    subtotalPaise === 0
      ? 0
      : subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE || couponEval.code === 'FREESHIP'
        ? 0
        : STANDARD_SHIPPING_FEE_PAISE

  const totalPaise = afterCouponPaise + shippingPaise
  const totalSavingsPaise = mrpSavingsPaise + couponDiscountPaise
  const overallDiscountPercent = discountPercent(
    mrpTotalPaise,
    Math.min(mrpTotalPaise, afterCouponPaise)
  )

  return {
    totalCount,
    subtotalPaise,
    mrpTotalPaise,
    mrpSavingsPaise,
    couponDiscountPaise,
    shippingPaise,
    totalPaise,
    totalSavingsPaise,
    overallDiscountPercent,
    activeCouponCode: couponEval.code,
  }
}

/**
 * Finds the highest-saving eligible discount offer (excluding auto free shipping).
 */
export function findBestEligibleDiscountOffer(
  subtotalPaise: number,
  offers: readonly StorefrontOffer[] = ALL_OFFERS
): { offer: StorefrontOffer; savingsPaise: number } | null {
  let best: { offer: StorefrontOffer; savingsPaise: number } | null = null

  for (const offer of offers) {
    if (offer.is_active === false || offer.discount_type === 'free_shipping') continue
    const evaluated = evaluateCouponDiscount(subtotalPaise, offer.code, offers)
    if (!evaluated.valid) continue
    if (!best || evaluated.discountPaise > best.savingsPaise) {
      best = { offer, savingsPaise: evaluated.discountPaise }
    }
  }

  return best
}

/**
 * Validates and formats a coupon application result for cart banners & forms.
 */
export function validateCouponForSubtotal(
  subtotalPaise: number,
  rawCode: string,
  offers: readonly StorefrontOffer[] = ALL_OFFERS
): CouponActionResult {
  const evaluated = evaluateCouponDiscount(subtotalPaise, rawCode, offers)
  if (!evaluated.valid || !evaluated.offer) {
    return {
      ok: false,
      message: evaluated.reason ?? 'Offer conditions are not yet met.',
    }
  }

  if (evaluated.offer.discount_type === 'free_shipping') {
    return {
      ok: true,
      message: `${evaluated.offer.code} applied — Free Express Insured Shipping active.`,
    }
  }

  return {
    ok: true,
    message: `${evaluated.offer.code} applied — you save ${formatINR(evaluated.discountPaise)}.`,
  }
}

/**
 * Builds the continuous progress bar and interactive nodes mirroring Glorov's milestone track.
 */
export function buildCartMilestoneRoadmap(
  subtotalPaise: number,
  appliedCoupon: string | null,
  offers: readonly StorefrontOffer[] = ALL_OFFERS
): CartMilestoneRoadmap {
  const activeOffers = offers.filter((o) => o.is_active !== false)
  const shippingOffer = activeOffers.find((o) => o.discount_type === 'free_shipping')
  const freeMinPaise = shippingOffer?.min_cart_paise ?? FREE_SHIPPING_THRESHOLD_PAISE

  const promoOffers = activeOffers
    .filter((o) => o.discount_type !== 'free_shipping')
    .slice()
    .sort((a, b) => (a.min_cart_paise ?? 0) - (b.min_cart_paise ?? 0))

  const rawMilestones: Array<{
    id: string
    label: string
    title: string
    description: string
    code: string
    minSpendPaise: number
    type: 'free_shipping' | 'discount'
  }> = [
    {
      id: 'milestone_free_ship',
      label: 'FREE',
      title: shippingOffer?.title ?? 'Free Express Delivery',
      description: shippingOffer?.description ?? 'Free insured shipping on orders ₹999+',
      code: shippingOffer?.code ?? 'FREESHIP',
      minSpendPaise: freeMinPaise,
      type: 'free_shipping',
    },
    ...promoOffers.map((offer) => ({
      id: offer.id,
      label:
        offer.discount_type === 'percentage' && typeof offer.percentage === 'number'
          ? `${Math.round(offer.percentage)}%`
          : typeof offer.amount_paise === 'number'
            ? formatINR(offer.amount_paise)
            : offer.code,
      title: offer.title,
      description: offer.description,
      code: offer.code,
      minSpendPaise: offer.min_cart_paise ?? 0,
      type: 'discount' as const,
    })),
  ]

  const maxSpendPaise = Math.max(
    freeMinPaise,
    ...rawMilestones.map((node) => node.minSpendPaise),
    1
  )

  const currentEval = evaluateCouponDiscount(subtotalPaise, appliedCoupon, activeOffers)
  const currentSavings = currentEval.valid ? currentEval.discountPaise : 0

  const nodes: CartMilestoneNode[] = rawMilestones.map((item, idx) => {
    const positionFraction =
      rawMilestones.length <= 1
        ? 1
        : Math.min(1, Math.max(0.18, (idx + 1) / rawMilestones.length))
    const isReached = subtotalPaise >= item.minSpendPaise
    const isApplied =
      item.type === 'free_shipping'
        ? isReached || currentEval.code === item.code
        : currentEval.code === item.code

    const nodeDiscount =
      item.type === 'discount'
        ? evaluateCouponDiscount(subtotalPaise, item.code, activeOffers).discountPaise
        : 0
    const isUpgrade =
      item.type === 'discount' &&
      isReached &&
      !isApplied &&
      nodeDiscount > currentSavings

    return {
      ...item,
      positionFraction,
      isReached,
      isApplied,
      isUpgrade,
    }
  })

  const progressFraction = Math.min(1, Math.max(0, subtotalPaise / maxSpendPaise))
  const nextLocked = nodes.find((n) => !n.isReached)
  const upgradeNode = nodes.find((n) => n.isUpgrade)

  let prefix = 'All cart milestones unlocked — '
  let highlight = 'best savings active'

  if (nextLocked) {
    const shortfall = Math.max(0, nextLocked.minSpendPaise - subtotalPaise)
    prefix = `Add ${formatINR(shortfall)} more to unlock `
    highlight =
      nextLocked.type === 'free_shipping'
        ? 'Free Express Shipping'
        : `${nextLocked.label} Off (${nextLocked.code})`
  } else if (upgradeNode) {
    prefix = `Unlocked better deal: `
    highlight = `Tap ${upgradeNode.code} (${upgradeNode.label} Off)`
  } else if (currentEval.valid && currentEval.discountPaise > 0) {
    prefix = `${currentEval.code} active — `
    highlight = `Saving ${formatINR(currentEval.discountPaise)}`
  } else if (nodes.some((n) => n.type === 'discount' && n.isReached)) {
    const bestReached = [...nodes].reverse().find((n) => n.type === 'discount' && n.isReached)
    if (bestReached) {
      prefix = 'Unlocked promo: '
      highlight = `Apply ${bestReached.code}`
    }
  }

  return {
    progressFraction,
    prefix,
    highlight,
    nodes,
  }
}

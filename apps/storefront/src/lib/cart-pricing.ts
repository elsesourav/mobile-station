import type {
  CartItem,
  CartMilestoneNode,
  CartMilestoneRoadmap,
  CartPricingSummary,
  CouponActionResult,
  StorefrontOffer,
  StorefrontProduct,
} from '@mobile-station/types'
import { ALL_CATEGORIES, ALL_OFFERS, ALL_PRODUCTS } from '@/lib/catalog'
import { discountPercent, formatINR } from '@/lib/format'

export const FREE_SHIPPING_THRESHOLD_PAISE = 99900
export const STANDARD_SHIPPING_FEE_PAISE = 9900
export const CART_PINCODE_STORAGE_KEY = 'mobile_station_cart_pincode_v1'

const CATEGORY_NAME_MAP = new Map(ALL_CATEGORIES.map((cat) => [cat.handle, cat.name]))

/**
 * Resolves a StorefrontProduct's optional admin-configured exclusive coupon metadata into an offer.
 */
export function buildProductSpecificOffer(product: StorefrontProduct): StorefrontOffer | null {
  const code = product.metadata.product_coupon_code?.trim().toUpperCase()
  const percent = product.metadata.product_coupon_percent
  if (!code || typeof percent !== 'number' || percent <= 0) return null

  return {
    id: `product_coupon_${product.handle}_${code.toLowerCase()}`,
    code,
    title: `${percent}% Off ${product.title}`,
    description: `Exclusive ${percent}% product coupon valid on ${product.title}.`,
    discount_type: 'percentage',
    percentage: percent,
    min_cart_paise: product.metadata.product_coupon_min_paise ?? 0,
    applicable_products: [product.handle],
    is_active: true,
  }
}

/**
 * Merges configured global/category offers with any per-product admin metadata coupons.
 */
export function buildEffectiveOffers(
  baseOffers: readonly StorefrontOffer[] = ALL_OFFERS,
  allProducts: readonly StorefrontProduct[] = ALL_PRODUCTS
): StorefrontOffer[] {
  const merged = new Map<string, StorefrontOffer>()
  for (const offer of baseOffers) {
    merged.set(offer.code.trim().toUpperCase(), offer)
  }
  for (const product of allProducts) {
    const prodOffer = buildProductSpecificOffer(product)
    if (!prodOffer) continue
    const key = prodOffer.code.toUpperCase()
    if (!merged.has(key)) merged.set(key, prodOffer)
  }
  return Array.from(merged.values())
}

/**
 * Formats category or product scope succinctly for offer cards and validation notices.
 */
export function formatOfferScopeLabel(
  offer: StorefrontOffer,
  allProducts: readonly StorefrontProduct[] = ALL_PRODUCTS
): string {
  if (offer.applicable_products && offer.applicable_products.length > 0) {
    const prodNames = offer.applicable_products
      .map((handle) => allProducts.find((p) => p.handle === handle)?.title ?? handle)
      .slice(0, 2)
    return prodNames.join(', ')
  }
  if (
    offer.applicable_categories &&
    offer.applicable_categories.length > 0 &&
    !offer.applicable_categories.includes('*')
  ) {
    return offer.applicable_categories
      .map((handle) => CATEGORY_NAME_MAP.get(handle) ?? handle)
      .join(', ')
  }
  return 'All Categories'
}

/**
 * Checks whether a single product qualifies for a given offer.
 */
export function doesProductMatchOffer(
  product: Pick<StorefrontProduct, 'handle' | 'category_handle'>,
  offer: StorefrontOffer
): boolean {
  if (offer.applicable_products && offer.applicable_products.length > 0) {
    return offer.applicable_products.includes(product.handle)
  }
  if (
    offer.applicable_categories &&
    offer.applicable_categories.length > 0 &&
    !offer.applicable_categories.includes('*')
  ) {
    return offer.applicable_categories.includes(product.category_handle)
  }
  return true
}

/**
 * Filters and orders eligible offers specifically for a PDP product.
 */
export function getEligibleOffersForProduct(
  product: StorefrontProduct,
  baseOffers: readonly StorefrontOffer[] = ALL_OFFERS
): StorefrontOffer[] {
  const effective = buildEffectiveOffers(baseOffers, [product])
  return effective.filter(
    (offer) => offer.is_active !== false && doesProductMatchOffer(product, offer)
  )
}

/**
 * Checks whether an individual cart item matches an offer's category or product targeting rules.
 */
export function doesCartItemMatchOffer(
  item: CartItem,
  offer: StorefrontOffer,
  allProducts: readonly StorefrontProduct[] = ALL_PRODUCTS
): boolean {
  if (offer.applicable_products && offer.applicable_products.length > 0) {
    return offer.applicable_products.includes(item.productHandle)
  }
  if (
    offer.applicable_categories &&
    offer.applicable_categories.length > 0 &&
    !offer.applicable_categories.includes('*')
  ) {
    const resolvedCategory =
      item.categoryHandle ||
      allProducts.find((p) => p.handle === item.productHandle)?.category_handle ||
      ''
    return Boolean(resolvedCategory) && offer.applicable_categories.includes(resolvedCategory)
  }
  return true
}

function getEligibleSubtotalForOffer(
  itemsOrSubtotal: number | readonly CartItem[],
  offer: StorefrontOffer,
  allProducts: readonly StorefrontProduct[]
): { totalSubtotalPaise: number; eligibleSubtotalPaise: number; hasMatchingItems: boolean } {
  if (typeof itemsOrSubtotal === 'number') {
    return {
      totalSubtotalPaise: itemsOrSubtotal,
      eligibleSubtotalPaise: itemsOrSubtotal,
      hasMatchingItems: itemsOrSubtotal > 0,
    }
  }

  let totalSubtotalPaise = 0
  let eligibleSubtotalPaise = 0
  let hasMatchingItems = false

  for (const item of itemsOrSubtotal) {
    const lineTotal = item.price_paise * item.quantity
    totalSubtotalPaise += lineTotal
    if (doesCartItemMatchOffer(item, offer, allProducts)) {
      eligibleSubtotalPaise += lineTotal
      hasMatchingItems = true
    }
  }

  return { totalSubtotalPaise, eligibleSubtotalPaise, hasMatchingItems }
}

/**
 * Evaluates a candidate promo code strictly against matching cart items or subtotal.
 */
export function evaluateCouponDiscount(
  itemsOrSubtotal: number | readonly CartItem[],
  rawCode: string | null | undefined,
  baseOffers: readonly StorefrontOffer[] = ALL_OFFERS,
  allProducts: readonly StorefrontProduct[] = ALL_PRODUCTS
): {
  valid: boolean
  code: string | null
  discountPaise: number
  eligibleSubtotalPaise: number
  offer: StorefrontOffer | null
  reason?: string
} {
  const cleanCode = rawCode?.trim().toUpperCase() ?? ''
  if (!cleanCode) {
    return {
      valid: false,
      code: null,
      discountPaise: 0,
      eligibleSubtotalPaise: 0,
      offer: null,
    }
  }

  const offers = buildEffectiveOffers(baseOffers, allProducts)
  const matched = offers.find(
    (offer) => offer.is_active !== false && offer.code.trim().toUpperCase() === cleanCode
  )
  if (!matched) {
    return {
      valid: false,
      code: null,
      discountPaise: 0,
      eligibleSubtotalPaise: 0,
      offer: null,
      reason: `Code "${cleanCode}" not found.`,
    }
  }

  const { totalSubtotalPaise, eligibleSubtotalPaise, hasMatchingItems } = getEligibleSubtotalForOffer(
    itemsOrSubtotal,
    matched,
    allProducts
  )

  if (!hasMatchingItems && totalSubtotalPaise > 0) {
    const scope = formatOfferScopeLabel(matched, allProducts)
    return {
      valid: false,
      code: null,
      discountPaise: 0,
      eligibleSubtotalPaise: 0,
      offer: matched,
      reason: `${matched.code} applies only to ${scope}.`,
    }
  }

  const thresholdBase =
    matched.discount_type === 'free_shipping' ? totalSubtotalPaise : eligibleSubtotalPaise
  const minCart = matched.min_cart_paise ?? 0
  if (thresholdBase < minCart) {
    const shortfall = minCart - thresholdBase
    return {
      valid: false,
      code: null,
      discountPaise: 0,
      eligibleSubtotalPaise,
      offer: matched,
      reason: `Add ${formatINR(shortfall)} of eligible items for ${matched.code}.`,
    }
  }

  let discountPaise = 0
  if (matched.discount_type === 'fixed' && typeof matched.amount_paise === 'number') {
    discountPaise = Math.min(eligibleSubtotalPaise, Math.max(0, matched.amount_paise))
  } else if (
    matched.discount_type === 'percentage' &&
    typeof matched.percentage === 'number'
  ) {
    const computed = Math.round((eligibleSubtotalPaise * matched.percentage) / 100)
    const capped =
      typeof matched.max_discount_paise === 'number'
        ? Math.min(computed, matched.max_discount_paise)
        : computed
    discountPaise = Math.min(eligibleSubtotalPaise, Math.max(0, capped))
  }

  return {
    valid: true,
    code: matched.code,
    discountPaise,
    eligibleSubtotalPaise,
    offer: matched,
  }
}

/**
 * Computes full cart pricing summary applying scoped promo discounts only to eligible line items.
 */
export function computeCartPricingSummary(
  items: readonly CartItem[],
  appliedCoupon: string | null,
  baseOffers: readonly StorefrontOffer[] = ALL_OFFERS,
  allProducts: readonly StorefrontProduct[] = ALL_PRODUCTS
): CartPricingSummary {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotalPaise = items.reduce((sum, item) => sum + item.price_paise * item.quantity, 0)
  const mrpTotalPaise = items.reduce(
    (sum, item) => sum + Math.max(item.mrp_paise, item.price_paise) * item.quantity,
    0
  )
  const mrpSavingsPaise = Math.max(0, mrpTotalPaise - subtotalPaise)

  const couponEval = evaluateCouponDiscount(items, appliedCoupon, baseOffers, allProducts)
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
 * Finds the highest-saving eligible discount coupon matching current cart items.
 */
export function findBestEligibleDiscountOffer(
  itemsOrSubtotal: number | readonly CartItem[],
  baseOffers: readonly StorefrontOffer[] = ALL_OFFERS,
  allProducts: readonly StorefrontProduct[] = ALL_PRODUCTS
): { offer: StorefrontOffer; savingsPaise: number } | null {
  const offers = buildEffectiveOffers(baseOffers, allProducts)
  let best: { offer: StorefrontOffer; savingsPaise: number } | null = null

  for (const offer of offers) {
    if (offer.is_active === false || offer.discount_type === 'free_shipping') continue
    const evaluated = evaluateCouponDiscount(itemsOrSubtotal, offer.code, offers, allProducts)
    if (!evaluated.valid || evaluated.discountPaise <= 0) continue
    if (!best || evaluated.discountPaise > best.savingsPaise) {
      best = { offer, savingsPaise: evaluated.discountPaise }
    }
  }

  return best
}

/**
 * Validates and formats a coupon application result for cart banners & forms.
 */
export function validateCouponForCart(
  itemsOrSubtotal: number | readonly CartItem[],
  rawCode: string,
  baseOffers: readonly StorefrontOffer[] = ALL_OFFERS,
  allProducts: readonly StorefrontProduct[] = ALL_PRODUCTS
): CouponActionResult {
  const evaluated = evaluateCouponDiscount(itemsOrSubtotal, rawCode, baseOffers, allProducts)
  if (!evaluated.valid || !evaluated.offer) {
    return {
      ok: false,
      message: evaluated.reason ?? 'Coupon requirements are not met for current cart items.',
    }
  }

  if (evaluated.offer.discount_type === 'free_shipping') {
    return {
      ok: true,
      message: `${evaluated.offer.code} applied — Free Express Shipping active.`,
    }
  }

  return {
    ok: true,
    message: `${evaluated.offer.code} applied — saving ${formatINR(evaluated.discountPaise)}.`,
  }
}

/**
 * Builds percentage & free-shipping milestones relevant to items in the cart.
 */
export function buildCartMilestoneRoadmap(
  itemsOrSubtotal: number | readonly CartItem[],
  appliedCoupon: string | null,
  baseOffers: readonly StorefrontOffer[] = ALL_OFFERS,
  allProducts: readonly StorefrontProduct[] = ALL_PRODUCTS
): CartMilestoneRoadmap {
  const offers = buildEffectiveOffers(baseOffers, allProducts).filter((o) => o.is_active !== false)
  const subtotalPaise =
    typeof itemsOrSubtotal === 'number'
      ? itemsOrSubtotal
      : itemsOrSubtotal.reduce((sum, item) => sum + item.price_paise * item.quantity, 0)

  const shippingOffer = offers.find((o) => o.discount_type === 'free_shipping')
  const freeMinPaise = shippingOffer?.min_cart_paise ?? FREE_SHIPPING_THRESHOLD_PAISE

  const matchingDiscountOffers = offers
    .filter((o) => o.discount_type === 'percentage')
    .filter((o) => {
      if (typeof itemsOrSubtotal === 'number') return true
      return getEligibleSubtotalForOffer(itemsOrSubtotal, o, allProducts).hasMatchingItems
    })
    .sort((a, b) => (a.min_cart_paise ?? 0) - (b.min_cart_paise ?? 0))

  const rawMilestones: Array<{
    id: string
    label: string
    title: string
    description: string
    code: string
    minSpendPaise: number
    eligibleBasePaise: number
    type: 'free_shipping' | 'discount'
  }> = [
    {
      id: 'milestone_free_ship',
      label: 'FREE',
      title: shippingOffer?.title ?? 'Free Express Shipping',
      description: shippingOffer?.description ?? 'Free insured shipping on ₹999+',
      code: shippingOffer?.code ?? 'FREESHIP',
      minSpendPaise: freeMinPaise,
      eligibleBasePaise: subtotalPaise,
      type: 'free_shipping',
    },
    ...matchingDiscountOffers.slice(0, 3).map((offer) => {
      const { eligibleSubtotalPaise } = getEligibleSubtotalForOffer(
        itemsOrSubtotal,
        offer,
        allProducts
      )
      return {
        id: offer.id,
        label: typeof offer.percentage === 'number' ? `${Math.round(offer.percentage)}%` : offer.code,
        title: offer.title,
        description: offer.description,
        code: offer.code,
        minSpendPaise: offer.min_cart_paise ?? 0,
        eligibleBasePaise: eligibleSubtotalPaise,
        type: 'discount' as const,
      }
    }),
  ]

  const maxSpendPaise = Math.max(
    freeMinPaise,
    ...rawMilestones.map((node) => node.minSpendPaise),
    1
  )

  const currentEval = evaluateCouponDiscount(itemsOrSubtotal, appliedCoupon, offers, allProducts)
  const currentSavings = currentEval.valid ? currentEval.discountPaise : 0

  const nodes: CartMilestoneNode[] = rawMilestones.map((item, idx) => {
    const positionFraction =
      rawMilestones.length <= 1
        ? 1
        : Math.min(1, Math.max(0.2, (idx + 1) / rawMilestones.length))
    const isReached = item.eligibleBasePaise >= item.minSpendPaise
    const isApplied =
      item.type === 'free_shipping'
        ? isReached || currentEval.code === item.code
        : currentEval.code === item.code

    const nodeDiscount =
      item.type === 'discount'
        ? evaluateCouponDiscount(itemsOrSubtotal, item.code, offers, allProducts).discountPaise
        : 0
    const isUpgrade =
      item.type === 'discount' && isReached && !isApplied && nodeDiscount > currentSavings

    return {
      id: item.id,
      label: item.label,
      title: item.title,
      description: item.description,
      code: item.code,
      minSpendPaise: item.minSpendPaise,
      positionFraction,
      isReached,
      isApplied,
      isUpgrade,
      type: item.type,
    }
  })

  const progressFraction = Math.min(1, Math.max(0, subtotalPaise / maxSpendPaise))
  const nextLocked = nodes.find((n) => !n.isReached)
  const nextLockedRaw = nextLocked
    ? rawMilestones.find((item) => item.id === nextLocked.id)
    : undefined
  const upgradeNode = nodes.find((n) => n.isUpgrade)

  let prefix = 'Eligible offers unlocked — '
  let highlight = 'apply below'

  if (nextLocked) {
    const shortfall = Math.max(
      0,
      nextLocked.minSpendPaise - (nextLockedRaw?.eligibleBasePaise ?? 0)
    )
    prefix = `Add ${formatINR(shortfall)} more to unlock `
    highlight =
      nextLocked.type === 'free_shipping'
        ? 'Free Shipping'
        : `${nextLocked.label} Off (${nextLocked.code})`
  } else if (upgradeNode) {
    prefix = 'Better savings ready: '
    highlight = `${upgradeNode.code} (${upgradeNode.label} Off)`
  } else if (currentEval.valid && currentEval.discountPaise > 0) {
    prefix = `${currentEval.code} active · `
    highlight = `Saving ${formatINR(currentEval.discountPaise)}`
  } else {
    const bestReached = [...nodes].reverse().find((n) => n.type === 'discount' && n.isReached)
    if (bestReached) {
      prefix = 'Eligible savings: '
      highlight = `Apply ${bestReached.code} (${bestReached.label} Off)`
    }
  }

  return {
    progressFraction,
    prefix,
    highlight,
    nodes,
  }
}

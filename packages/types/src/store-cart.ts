export interface CartItem {
  sku: string
  productHandle: string
  title: string
  variantTitle: string
  brand: string
  price_paise: number
  mrp_paise: number
  thumbnail: string
  quantity: number
  requires_open_box_delivery: boolean
}

export type NewCartItemInput = Omit<CartItem, 'quantity'>

export interface CartSummaryMetrics {
  totalCount: number
  subtotalPaise: number
  totalSavingsPaise: number
}

export interface CartPricingSummary {
  totalCount: number
  subtotalPaise: number
  mrpTotalPaise: number
  mrpSavingsPaise: number
  couponDiscountPaise: number
  shippingPaise: number
  totalPaise: number
  totalSavingsPaise: number
  overallDiscountPercent: number
  activeCouponCode: string | null
}

export interface CartMilestoneNode {
  id: string
  label: string
  title: string
  description: string
  code: string
  minSpendPaise: number
  positionFraction: number
  isReached: boolean
  isApplied: boolean
  isUpgrade: boolean
  type: 'free_shipping' | 'discount'
}

export interface CartMilestoneRoadmap {
  progressFraction: number
  prefix: string
  highlight: string
  nodes: CartMilestoneNode[]
}

export interface CouponActionResult {
  ok: boolean
  message: string
}

export interface CartContextValue extends CartSummaryMetrics {
  items: CartItem[]
  isHydrated: boolean
  isOpen: boolean
  appliedCoupon: string | null
  discountPaise: number
  shippingPaise: number
  totalPaise: number
  mrpTotalPaise: number
  mrpSavingsPaise: number
  overallDiscountPercent: number
  openCart: () => void
  closeCart: () => void
  addItem: (incomingItem: NewCartItemInput) => void
  updateQuantity: (sku: string, delta: number) => void
  removeItem: (sku: string) => void
  clearCart: () => void
  applyCoupon: (code: string) => CouponActionResult
  removeCoupon: () => void
}

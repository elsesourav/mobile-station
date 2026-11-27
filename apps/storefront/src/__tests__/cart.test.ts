import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { CartItem } from '@mobile-station/types'
import { ALL_OFFERS, ALL_PRODUCTS } from '@/lib/catalog'
import {
  FREE_SHIPPING_THRESHOLD_PAISE,
  STANDARD_SHIPPING_FEE_PAISE,
  buildCartMilestoneRoadmap,
  buildEffectiveOffers,
  computeCartPricingSummary,
  doesCartItemMatchOffer,
  evaluateCouponDiscount,
  getEligibleOffersForProduct,
  validateCouponForCart,
} from '@/lib/cart-pricing'

const SSD_ITEM: CartItem = {
  sku: 'SDSK-SSD-1TB',
  productHandle: 'sandisk-extreme-portable-ssd-1tb',
  categoryHandle: 'accessories-storage',
  title: 'SanDisk Extreme Portable NVMe SSD 1TB (1050MB/s)',
  variantTitle: '1TB / Black',
  brand: 'SanDisk',
  price_paise: 949900,
  mrp_paise: 1450000,
  thumbnail: 'https://res.cloudinary.com/ekbuxdbd/image/upload/v1/ssd.webp',
  quantity: 1,
  requires_open_box_delivery: false,
}

const IPHONE_ITEM: CartItem = {
  sku: 'APL-IP16-128',
  productHandle: 'apple-iphone-16-5g',
  categoryHandle: 'smartphones',
  title: 'Apple iPhone 16 5G',
  variantTitle: '128GB / Ultramarine',
  brand: 'Apple',
  price_paise: 7490000,
  mrp_paise: 7990000,
  thumbnail: 'https://res.cloudinary.com/ekbuxdbd/image/upload/v1/iphone16.webp',
  quantity: 1,
  requires_open_box_delivery: true,
}

const AIRPODS_ITEM: CartItem = {
  sku: 'APL-APP2-USBC',
  productHandle: 'apple-airpods-pro-2-usbc',
  categoryHandle: 'audio',
  title: 'Apple AirPods Pro (2nd Gen) USB-C MagSafe',
  variantTitle: 'Default',
  brand: 'Apple',
  price_paise: 2290000,
  mrp_paise: 2490000,
  thumbnail: 'https://res.cloudinary.com/ekbuxdbd/image/upload/v1/airpods.webp',
  quantity: 1,
  requires_open_box_delivery: false,
}

const CABLE_ITEM: CartItem = {
  sku: 'ANK-100W-CBL',
  productHandle: 'anker-333-100w-usbc-cable',
  categoryHandle: 'power-charging',
  title: 'Anker 333 100W Braided USB-C Cable (1.8m)',
  variantTitle: '1.8m / Black',
  brand: 'Anker',
  price_paise: 79900,
  mrp_paise: 119900,
  thumbnail: 'https://res.cloudinary.com/ekbuxdbd/image/upload/v1/cable.webp',
  quantity: 1,
  requires_open_box_delivery: false,
}

describe('Mobile Station percentage-only, category-scoped & product-specific coupon system', () => {
  it('excludes flat ₹500 coupons and enforces FREE courier threshold above ₹999', () => {
    expect(ALL_OFFERS.some((o) => o.code === 'TECH500' || o.discount_type === 'fixed')).toBe(false)

    const lowCart = computeCartPricingSummary([CABLE_ITEM], null, ALL_OFFERS, ALL_PRODUCTS)
    expect(lowCart.shippingPaise).toBe(STANDARD_SHIPPING_FEE_PAISE)

    const ssdCart = computeCartPricingSummary([SSD_ITEM], null, ALL_OFFERS, ALL_PRODUCTS)
    expect(ssdCart.subtotalPaise).toBeGreaterThanOrEqual(FREE_SHIPPING_THRESHOLD_PAISE)
    expect(ssdCart.shippingPaise).toBe(0)
  })

  it('restricts category coupons to matching category items only', () => {
    const phoneOnlyReject = validateCouponForCart([IPHONE_ITEM], 'GEAR5', ALL_OFFERS, ALL_PRODUCTS)
    expect(phoneOnlyReject.ok).toBe(false)
    expect(phoneOnlyReject.message).toContain('GEAR5 applies only to')

    const ssdWithGear5 = evaluateCouponDiscount([SSD_ITEM], 'GEAR5', ALL_OFFERS, ALL_PRODUCTS)
    expect(ssdWithGear5.valid).toBe(true)
    expect(ssdWithGear5.discountPaise).toBe(Math.round(949900 * 0.05))

    // Mixed cart: GEAR5 discounts ONLY the SSD subtotal, NOT the iPhone subtotal
    const mixedGear5 = computeCartPricingSummary(
      [IPHONE_ITEM, SSD_ITEM],
      'GEAR5',
      ALL_OFFERS,
      ALL_PRODUCTS
    )
    expect(mixedGear5.couponDiscountPaise).toBe(Math.round(949900 * 0.05))

    const tech10RejectOnSsd = validateCouponForCart([SSD_ITEM], 'TECH10', ALL_OFFERS, ALL_PRODUCTS)
    expect(tech10RejectOnSsd.ok).toBe(false)

    const tech10OnPhone = evaluateCouponDiscount([IPHONE_ITEM], 'TECH10', ALL_OFFERS, ALL_PRODUCTS)
    expect(tech10OnPhone.valid).toBe(true)
    expect(tech10OnPhone.discountPaise).toBe(500000)
  })

  it('restricts product-specific coupons strictly to their target product and supports Admin product metadata coupons', () => {
    const rejectOther = validateCouponForCart([SSD_ITEM], 'AIRPODS5', ALL_OFFERS, ALL_PRODUCTS)
    expect(rejectOther.ok).toBe(false)

    const validAirpods = computeCartPricingSummary([AIRPODS_ITEM], 'AIRPODS5', ALL_OFFERS, ALL_PRODUCTS)
    expect(validAirpods.couponDiscountPaise).toBe(Math.round(2290000 * 0.05))

    const baseSony = ALL_PRODUCTS.find((p) => p.handle === 'sony-wh-1000xm5-anc')!
    const adminConfiguredSony = {
      ...baseSony,
      metadata: {
        ...baseSony.metadata,
        product_coupon_code: 'XM5ONLY10',
        product_coupon_percent: 10,
      },
    }
    const pdpOffers = getEligibleOffersForProduct(adminConfiguredSony, ALL_OFFERS)
    expect(pdpOffers.some((o) => o.code === 'XM5ONLY10' && o.percentage === 10)).toBe(true)

    const sonyItem: CartItem = {
      sku: adminConfiguredSony.variants[0].sku,
      productHandle: adminConfiguredSony.handle,
      categoryHandle: adminConfiguredSony.category_handle,
      title: adminConfiguredSony.title,
      variantTitle: adminConfiguredSony.variants[0].title,
      brand: adminConfiguredSony.metadata.brand,
      price_paise: adminConfiguredSony.variants[0].price_paise,
      mrp_paise: adminConfiguredSony.variants[0].mrp_paise,
      thumbnail: adminConfiguredSony.thumbnail,
      quantity: 1,
      requires_open_box_delivery: false,
    }
    const mergedOffers = buildEffectiveOffers(ALL_OFFERS, [adminConfiguredSony])
    const adminPromoEval = evaluateCouponDiscount(
      [sonyItem, IPHONE_ITEM],
      'XM5ONLY10',
      mergedOffers,
      [adminConfiguredSony]
    )
    expect(adminPromoEval.valid).toBe(true)
    expect(adminPromoEval.discountPaise).toBe(
      Math.round(adminConfiguredSony.variants[0].price_paise * 0.1)
    )
    expect(
      doesCartItemMatchOffer(IPHONE_ITEM, adminPromoEval.offer!, [adminConfiguredSony])
    ).toBe(false)
  })

  it('shows percentage milestone roadmap nodes relevant to cart items without ₹500 nodes', () => {
    const ssdRoadmap = buildCartMilestoneRoadmap([SSD_ITEM], null, ALL_OFFERS, ALL_PRODUCTS)
    expect(ssdRoadmap.nodes.some((n) => n.label.includes('500'))).toBe(false)
    expect(ssdRoadmap.nodes.some((n) => n.code === 'GEAR5' && n.label === '5%')).toBe(true)
    expect(ssdRoadmap.nodes.some((n) => n.code === 'TECH10')).toBe(false)
  })

  it('maintains Glorov two-column & mobile sticky positions cleanly without legacy copy', () => {
    const cartClientSrc = readFileSync(
      path.resolve(__dirname, '../components/cart/CartPageClient.tsx'),
      'utf8'
    )
    const cartRecSrc = readFileSync(
      path.resolve(__dirname, '../components/cart/CartRecommendedCarousel.tsx'),
      'utf8'
    )
    const headerSrc = readFileSync(
      path.resolve(__dirname, '../components/layout/Header.tsx'),
      'utf8'
    )

    expect(cartClientSrc).toContain('hidden sm:flex items-start gap-4 lg:gap-6')
    expect(cartClientSrc).toContain('flex sm:hidden flex-col gap-2.5 pb-28')
    expect(cartClientSrc).toContain('<CartStickyCheckoutBar')
    expect(cartRecSrc).toContain('<Plus')
    expect(cartRecSrc).not.toContain('<ShoppingBag')
    expect(headerSrc).toContain('href="/cart"')
  })
})

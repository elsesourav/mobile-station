import categoriesData from '../../../../data/taxonomy/categories.json'
import brandsData from '../../../../data/taxonomy/brands.json'
import announcementsData from '../../../../data/storefront/announcements.json'
import heroBannersData from '../../../../data/storefront/hero-banners.json'
import trustBadgesData from '../../../../data/storefront/trust-badges.json'
import offersData from '../../../../data/storefront/offers.json'
import catalogSeed from '../../../../data/catalog/products-seed.json'

export interface StorefrontVariant {
  title: string
  sku: string
  price_paise: number
  mrp_paise: number
  stock: number
  options: Record<string, string>
}

export interface StorefrontProduct {
  handle: string
  title: string
  subtitle: string
  category_handle: string
  subcategory_handle: string
  description: string
  thumbnail: string
  images: string[]
  metadata: {
    category_type: string
    brand: string
    model_number: string
    hsn_code: string
    gst_rate_percent: number
    warranty_months: number
    warranty_type?: string
    warranty_summary: string
    condition?: string
    in_the_box: string[]
    requires_imei_or_serial: boolean
    requires_open_box_delivery: boolean
    emi_eligible: boolean
    cod_eligible?: boolean
    key_highlights?: string[]
    stock_details?: {
      tracking_mode: string
      warehouse_hub: string
      warehouse_bin: string
      low_stock_threshold: number
      safety_stock: number
      restock_lead_days?: number
      return_window_days: number
    }
    specs?: Record<string, unknown>
  }
  variants: StorefrontVariant[]
}

export interface StorefrontCategory {
  id: string
  handle: string
  name: string
  subtitle: string
  description: string
  default_hsn: string
  gst_rate_percent: number
  icon: string
  rank: number
  image_url?: string
  inventory_policy?: {
    tracking_mode: string
    warehouse_zone: string
    default_low_stock_threshold: number
    default_safety_stock: number
    requires_open_box_delivery: boolean
    return_window_days: number
  }
  subcategories: Array<{
    id: string
    handle: string
    name: string
    hsn: string
    tracking_mode?: string
  }>
}

export interface StorefrontBrand {
  handle: string
  name: string
  categories: string[]
  warranty_support: string
  official_domain?: string
  featured?: boolean
}

export interface StorefrontHeroBanner {
  id: string
  tag: string
  title: string
  subtitle: string
  cta_text: string
  cta_route: string
  image_url?: string
}

export interface StorefrontAnnouncement {
  id: string
  text: string
  badge: string
  route: string
}

export interface StorefrontTrustBadge {
  id: string
  title: string
  subtitle: string
  icon_key: string
  cta_route: string
}

export interface StorefrontOffer {
  id: string
  code: string
  title: string
  description: string
  discount_type: string
  amount_paise?: number
  percentage?: number
  min_cart_paise?: number
}

export const ALL_PRODUCTS = catalogSeed.products as StorefrontProduct[]
export const ALL_CATEGORIES = categoriesData.root_categories as StorefrontCategory[]
export const ALL_BRANDS = brandsData.brands as StorefrontBrand[]
export const ALL_HERO_BANNERS = heroBannersData as StorefrontHeroBanner[]
export const ALL_ANNOUNCEMENTS = announcementsData as StorefrontAnnouncement[]
export const ALL_TRUST_BADGES = trustBadgesData as StorefrontTrustBadge[]
export const ALL_OFFERS = offersData as StorefrontOffer[]

export function getProductByHandle(handle: string): StorefrontProduct | undefined {
  return ALL_PRODUCTS.find((p) => p.handle === handle)
}

export function getCategoryByHandle(handle: string): StorefrontCategory | undefined {
  return ALL_CATEGORIES.find((c) => c.handle === handle)
}

export function getProductsByCategory(categoryHandle: string): StorefrontProduct[] {
  return ALL_PRODUCTS.filter((p) => p.category_handle === categoryHandle)
}

export function computeGstSplit(inclusivePaise: number, gstRatePercent = 18, intraState = true) {
  const divisor = 1 + gstRatePercent / 100
  const taxablePaise = Math.round(inclusivePaise / divisor)
  const totalTaxPaise = inclusivePaise - taxablePaise
  if (intraState) {
    const cgst = Math.floor(totalTaxPaise / 2)
    const sgst = totalTaxPaise - cgst
    return { taxablePaise, cgstPaise: cgst, sgstPaise: sgst, igstPaise: 0, totalTaxPaise }
  }
  return { taxablePaise, cgstPaise: 0, sgstPaise: 0, igstPaise: totalTaxPaise, totalTaxPaise }
}

export function checkDeliveryServiceability(pincode: string) {
  const clean = pincode.trim()
  if (!/^[1-9][0-9]{5}$/.test(clean)) {
    return { valid: false, label: 'Enter a valid 6-digit Indian PIN code', eta: '', cod: false }
  }
  if (clean === '842001' || clean === '842002') {
    return {
      valid: true,
      label: 'Same-Day Express Dispatch & Hub Pickup (Motijheel / Club Road, Muzaffarpur)',
      eta: 'Today by 8 PM (or Pickup in 2 hrs)',
      cod: true,
    }
  }
  if (clean.startsWith('80') || clean.startsWith('84')) {
    return {
      valid: true,
      label: 'Bihar Priority BlueDart Air / Surface Express',
      eta: '1–2 Business Days · Open-Box Verified',
      cod: true,
    }
  }
  return {
    valid: true,
    label: 'Pan-India Insured Air Courier via Shiprocket',
    eta: '2–4 Business Days · Open-Box Eligible ₹25k+',
    cod: true,
  }
}

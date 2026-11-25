import categoriesData from '../../../../data/taxonomy/categories.json'
import brandsData from '../../../../data/taxonomy/brands.json'
import announcementsData from '../../../../data/storefront/announcements.json'
import heroBannersData from '../../../../data/storefront/hero-banners.json'
import trustBadgesData from '../../../../data/storefront/trust-badges.json'
import offersData from '../../../../data/storefront/offers.json'
import catalogSeed from '../../../../data/catalog/products-seed.json'
import type {
  DeliveryServiceabilityResult,
  GstSplitBreakdown,
  StorefrontAnnouncement,
  StorefrontBrand,
  StorefrontCategory,
  StorefrontHeroBanner,
  StorefrontOffer,
  StorefrontProduct,
  StorefrontTrustBadge,
} from '@mobile-station/types'

export const ALL_PRODUCTS: StorefrontProduct[] = catalogSeed.products
export const ALL_CATEGORIES: StorefrontCategory[] = categoriesData.root_categories
export const ALL_BRANDS: StorefrontBrand[] = brandsData.brands
export const ALL_HERO_BANNERS: StorefrontHeroBanner[] = heroBannersData
export const ALL_ANNOUNCEMENTS: StorefrontAnnouncement[] = announcementsData
export const ALL_TRUST_BADGES: StorefrontTrustBadge[] = trustBadgesData
export const ALL_OFFERS: StorefrontOffer[] = offersData

export function getProductByHandle(handle: string): StorefrontProduct | undefined {
  return ALL_PRODUCTS.find((product) => product.handle === handle)
}

export function getCategoryByHandle(handle: string): StorefrontCategory | undefined {
  return ALL_CATEGORIES.find((category) => category.handle === handle)
}

export function getProductsByCategory(categoryHandle: string): StorefrontProduct[] {
  return ALL_PRODUCTS.filter((product) => product.category_handle === categoryHandle)
}

export function computeGstSplit(
  inclusivePaise: number,
  gstRatePercent = 18,
  intraState = true
): GstSplitBreakdown {
  const divisor = 1 + gstRatePercent / 100
  const taxablePaise = Math.round(inclusivePaise / divisor)
  const totalTaxPaise = inclusivePaise - taxablePaise
  if (intraState) {
    const cgstPaise = Math.floor(totalTaxPaise / 2)
    const sgstPaise = totalTaxPaise - cgstPaise
    return { taxablePaise, cgstPaise, sgstPaise, igstPaise: 0, totalTaxPaise }
  }
  return { taxablePaise, cgstPaise: 0, sgstPaise: 0, igstPaise: totalTaxPaise, totalTaxPaise }
}

export function checkDeliveryServiceability(pincode: string): DeliveryServiceabilityResult {
  const cleanPincode = pincode.trim()
  if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
    return { valid: false, label: 'Enter a valid 6-digit Indian PIN code', eta: '', cod: false }
  }
  if (cleanPincode === '842001' || cleanPincode === '842002') {
    return {
      valid: true,
      label: 'Same-Day Express Dispatch & Hub Pickup (Motijheel / Club Road, Muzaffarpur)',
      eta: 'Today by 8 PM (or Pickup in 2 hrs)',
      cod: true,
    }
  }
  if (cleanPincode.startsWith('80') || cleanPincode.startsWith('84')) {
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

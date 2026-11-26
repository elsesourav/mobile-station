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
  StorefrontProductMetadata,
  StorefrontTrustBadge,
  StorefrontVariant,
} from '@mobile-station/types'

export const ALL_PRODUCTS: StorefrontProduct[] = catalogSeed.products
export const ALL_CATEGORIES: StorefrontCategory[] = categoriesData.root_categories
export const ALL_BRANDS: StorefrontBrand[] = brandsData.brands
export const ALL_HERO_BANNERS: StorefrontHeroBanner[] = heroBannersData
export const ALL_ANNOUNCEMENTS: StorefrontAnnouncement[] = announcementsData
export const ALL_TRUST_BADGES: StorefrontTrustBadge[] = trustBadgesData
export const ALL_OFFERS: StorefrontOffer[] = offersData

const BACKEND_URL = (
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://127.0.0.1:9000'
).replace(/\/$/, '')

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

interface MedusaStoreVariantRecord {
  title?: string
  sku?: string
  inventory_quantity?: number
  metadata?: {
    price_paise?: number
    mrp_paise?: number
    stock_target?: number
    thumbnail?: string
    images?: string[]
    display_title?: string
  }
  options?: Array<{ value?: string; option?: { title?: string } }>
}

interface MedusaStoreProductRecord {
  handle?: string
  title?: string
  subtitle?: string | null
  description?: string | null
  thumbnail?: string | null
  images?: Array<{ url?: string }>
  metadata?: Partial<StorefrontProductMetadata>
  variants?: MedusaStoreVariantRecord[]
}

function mergeRemoteWithSeedProduct(
  seedProduct: StorefrontProduct,
  remote: MedusaStoreProductRecord
): StorefrontProduct {
  const remoteMeta = remote.metadata ?? {}
  const mergedMeta: StorefrontProductMetadata = {
    ...seedProduct.metadata,
    ...remoteMeta,
    specs: seedProduct.metadata.specs,
  }

  const remoteImages = (remote.images ?? [])
    .map((img) => img.url)
    .filter((url): url is string => Boolean(url))

  const seedBySku = new Map(seedProduct.variants.map((v) => [v.sku, v]))
  const mergedVariants: StorefrontVariant[] =
    remote.variants && remote.variants.length > 0
      ? remote.variants.map((rv, index) => {
          const fallback =
            (rv.sku ? seedBySku.get(rv.sku) : undefined) ??
            seedProduct.variants[index] ??
            seedProduct.variants[0]
          const options: Record<string, string> = { ...(fallback?.options ?? {}) }
          for (const opt of rv.options ?? []) {
            const key = opt.option?.title
            if (key && opt.value) options[key] = opt.value
          }
          return {
            title: rv.title || fallback.title,
            sku: rv.sku || fallback.sku,
            price_paise: rv.metadata?.price_paise ?? fallback.price_paise,
            mrp_paise: rv.metadata?.mrp_paise ?? fallback.mrp_paise,
            stock: rv.inventory_quantity ?? rv.metadata?.stock_target ?? fallback.stock,
            options,
            thumbnail: rv.metadata?.thumbnail ?? fallback.thumbnail,
            images: rv.metadata?.images ?? fallback.images,
            display_title: rv.metadata?.display_title ?? fallback.display_title,
          }
        })
      : seedProduct.variants

  return {
    ...seedProduct,
    title: remote.title || seedProduct.title,
    subtitle: remote.subtitle || seedProduct.subtitle,
    description: remote.description || seedProduct.description,
    thumbnail: remote.thumbnail || seedProduct.thumbnail,
    images: remoteImages.length > 0 ? remoteImages : seedProduct.images,
    metadata: mergedMeta,
    variants: mergedVariants,
  }
}

export async function fetchLiveProductByHandle(
  handle: string
): Promise<StorefrontProduct | undefined> {
  const seedProduct = getProductByHandle(handle)
  if (!seedProduct) return undefined
  if (!PUBLISHABLE_KEY) return seedProduct

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1600)
    const response = await fetch(
      `${BACKEND_URL}/store/products?handle=${encodeURIComponent(handle)}&limit=1`,
      {
        headers: {
          Accept: 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
        cache: 'no-store',
        signal: controller.signal,
      }
    )
    clearTimeout(timeout)
    if (!response.ok) return seedProduct
    const data = (await response.json()) as { products?: MedusaStoreProductRecord[] }
    const match = data.products?.[0]
    return match ? mergeRemoteWithSeedProduct(seedProduct, match) : seedProduct
  } catch {
    return seedProduct
  }
}

export async function fetchLiveCatalogProducts(): Promise<StorefrontProduct[]> {
  if (!PUBLISHABLE_KEY) return ALL_PRODUCTS

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1600)
    const response = await fetch(`${BACKEND_URL}/store/products?limit=100`, {
      headers: {
        Accept: 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
      },
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!response.ok) return ALL_PRODUCTS
    const data = (await response.json()) as { products?: MedusaStoreProductRecord[] }
    if (!Array.isArray(data.products) || data.products.length === 0) {
      return ALL_PRODUCTS
    }
    const remoteByHandle = new Map(
      data.products.filter((p) => p.handle).map((p) => [p.handle!, p])
    )
    return ALL_PRODUCTS.map((seed) => {
      const remote = remoteByHandle.get(seed.handle)
      return remote ? mergeRemoteWithSeedProduct(seed, remote) : seed
    })
  } catch {
    return ALL_PRODUCTS
  }
}

export function getProductByHandle(handle: string): StorefrontProduct | undefined {
  return ALL_PRODUCTS.find((product) => product.handle === handle)
}

export function getCategoryRoute(handle: string): string {
  const cleanHandle = handle.trim().replace(/^\/+/, '')
  return cleanHandle ? `/${cleanHandle}` : '/'
}

export function getCategoryByHandle(handle: string): StorefrontCategory | undefined {
  return ALL_CATEGORIES.find((category) => category.handle === handle)
}

export function getProductsByCategory(categoryHandle: string): StorefrontProduct[] {
  return ALL_PRODUCTS.filter((product) => product.category_handle === categoryHandle)
}

function getProductTimestampMs(product: StorefrontProduct): number {
  const rawDate = product.updated_at || product.created_at
  if (!rawDate) return 0
  const parsed = Date.parse(rawDate)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Sorts products by most recently updated or created descending, falling back
 * cleanly to source order when items lack explicit timestamps.
 */
export function sortProductsByRecency(products: readonly StorefrontProduct[]): StorefrontProduct[] {
  return products
    .map((product, index) => ({
      product,
      index,
      timestampMs: getProductTimestampMs(product),
    }))
    .sort((a, b) => {
      if (a.timestampMs !== b.timestampMs) {
        return b.timestampMs - a.timestampMs
      }
      return a.index - b.index
    })
    .map((entry) => entry.product)
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

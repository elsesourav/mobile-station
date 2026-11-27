import type { StorefrontBrand, StorefrontCategory, StorefrontProduct } from '@mobile-station/types'
import { discountPercent } from '@/lib/format'
import { formatSpecLabel, formatSpecValue } from '@/lib/product-specs'
import type {
  CategoryActiveFilterChip,
  CategoryExperienceProfile,
  CategoryFacetGroup,
  CategoryFacetOption,
  CategoryFilterState,
  CategoryQuickPreset,
  CategorySortOption,
} from '@/types/category'

const SPEC_ENUM_LABELS: Record<string, string> = {
  tws_earbuds: 'TWS Earbuds',
  over_ear: 'Over-Ear Headphones',
  on_ear: 'On-Ear Headphones',
  neckband: 'Wireless Neckband',
  wired_earphone: 'Wired Earphones',
  speaker: 'Bluetooth Speakers',
  keyboard: 'Keyboards',
  mouse: 'Mice',
  combo: 'Keyboard & Mouse Combos',
  desk_mat: 'Desk Mats',
  mechanical_red: 'Mechanical Red',
  mechanical_brown: 'Mechanical Brown',
  mechanical_blue: 'Mechanical Blue',
  hall_effect: 'Hall Effect',
  scissor: 'Scissor Switch',
  membrane: 'Membrane / Silent',
  optical: 'Optical Precision',
  full_100: 'Full Size (100%)',
  tkl_80: 'TKL (80%)',
  compact_75: 'Compact (75%)',
  mini_65: 'Compact (65%)',
  mini_60: 'Mini (60%)',
  gan_charger: 'GaN Fast Chargers',
  power_bank: 'Power Banks',
  cable: 'Charging & Data Cables',
  surge_protector: 'Surge Protectors',
  hub_dock: 'USB-C Hubs & Docks',
  case_cover: 'Phone Cases & Covers',
  tempered_glass: 'Tempered Glass',
  laptop_sleeve: 'Laptop Sleeves',
  stand_mount: 'Stands & Mounts',
  ssd_hdd: 'Portable SSDs',
  pen_drive_sd: 'Pen Drives & SD Cards',
  smartwatch: 'Smartwatches',
  cleaning_kit: 'Cleaning Kits',
  ultrabook: 'Thin & Light Ultrabook',
  gaming: 'RTX & Gaming',
  creator: 'Creator & Studio',
  business: 'Business Pro',
  student: 'Student & Study',
}

export const DEFAULT_CATEGORY_FILTER_STATE: CategoryFilterState = {
  searchQuery: '',
  selectedSubcategories: [],
  selectedBrands: [],
  selectedPriceBands: [],
  selectedSpecs: {},
  inStockOnly: false,
  discountOnly: false,
  openBoxOnly: false,
  emiOnly: false,
  sortBy: 'featured',
}

export function getEffectiveProductPricePaise(product: StorefrontProduct): number {
  const prices = product.variants.map((v) => v.price_paise).filter((p) => p > 0)
  return prices.length > 0 ? Math.min(...prices) : 0
}

export function getProductTotalStock(product: StorefrontProduct): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0)
}

export function getProductBestDiscount(product: StorefrontProduct): number {
  let maxDiscount = 0
  for (const variant of product.variants) {
    const pct = discountPercent(variant.mrp_paise, variant.price_paise)
    if (pct > maxDiscount) maxDiscount = pct
  }
  return maxDiscount
}

function parseCapacityOptionGb(label: string): string | null {
  const tbMatch = label.match(/(\d+(?:\.\d+)?)\s*TB/i)
  if (tbMatch) return String(Math.round(parseFloat(tbMatch[1]) * 1024))
  const gbMatch = label.match(/(\d+)\s*GB/i)
  if (gbMatch) return String(parseInt(gbMatch[1], 10))
  return null
}

/**
 * Extracts normalized scalar tokens for a given spec key from product specs + variant options.
 */
export function getProductSpecTokenValues(
  product: StorefrontProduct,
  specKey: string
): string[] {
  const values = new Set<string>()
  const raw = product.metadata.specs?.[specKey]

  if (raw !== undefined) {
    if (Array.isArray(raw)) {
      for (const item of raw) values.add(String(item))
    } else {
      values.add(String(raw))
    }
  }

  if (specKey === 'storage_gb' || specKey === 'ssd_gb' || specKey === 'capacity_gb') {
    for (const variant of product.variants) {
      const storageLabel = variant.options?.Storage
      if (storageLabel) {
        const gb = parseCapacityOptionGb(storageLabel)
        if (gb) values.add(gb)
      }
    }
  }

  if (specKey === 'ram_gb') {
    for (const variant of product.variants) {
      const ramLabel = variant.options?.RAM
      if (ramLabel) {
        const gb = parseCapacityOptionGb(ramLabel)
        if (gb) values.add(gb)
      }
    }
  }

  return Array.from(values)
}

export function formatCategorySpecOptionLabel(specKey: string, token: string): string {
  if (SPEC_ENUM_LABELS[token]) return SPEC_ENUM_LABELS[token]
  if (token === 'true') {
    if (specKey === 'anc') return 'ANC Supported'
    if (specKey === 'hot_swappable') return 'Hot-Swappable'
    if (specKey === 'stylus_support') return 'Stylus Supported'
    if (specKey === 'magsafe_compatible') return 'MagSafe Compatible'
    if (specKey === 'bis_certified') return 'BIS Certified'
    return 'Yes'
  }
  if (token === 'false') {
    if (specKey === 'anc') return 'Standard (Non-ANC)'
    return 'No'
  }

  const numericValue = Number(token)
  if (!Number.isNaN(numericValue) && token.trim() !== '') {
    return formatSpecValue(specKey, numericValue)
  }
  return token
}

export function extractCategoryBrandOptions(
  products: readonly StorefrontProduct[],
  brands: readonly StorefrontBrand[]
): CategoryFacetOption[] {
  const counts = new Map<string, { name: string; count: number }>()
  for (const product of products) {
    const raw = product.metadata.brand.trim()
    const key = raw.toLowerCase()
    const existing = counts.get(key)
    if (existing) existing.count += 1
    else counts.set(key, { name: raw, count: 1 })
  }

  const options: CategoryFacetOption[] = []
  for (const brand of brands) {
    const entry = counts.get(brand.name.toLowerCase())
    if (entry) {
      options.push({ value: entry.name, label: entry.name, count: entry.count })
      counts.delete(brand.name.toLowerCase())
    }
  }
  for (const entry of counts.values()) {
    options.push({ value: entry.name, label: entry.name, count: entry.count })
  }
  return options
}

export function extractCategoryFacetGroups(
  products: readonly StorefrontProduct[],
  experience: CategoryExperienceProfile
): CategoryFacetGroup[] {
  const groups: CategoryFacetGroup[] = []
  const seenKeys = new Set<string>()

  for (const rawKey of experience.specFilterKeys) {
    if (seenKeys.has(rawKey)) continue
    seenKeys.add(rawKey)
    if (rawKey === 'brand' || rawKey === 'price_range' || rawKey === 'in_stock') continue

    const counts = new Map<string, number>()
    for (const product of products) {
      const tokens = getProductSpecTokenValues(product, rawKey)
      for (const token of tokens) {
        counts.set(token, (counts.get(token) ?? 0) + 1)
      }
    }

    if (counts.size === 0) continue
    // Skip single-value specs unless it is an explicit capability/certification indicator
    const isCapabilityKey =
      rawKey === 'network' || rawKey === 'stylus_support' || rawKey === 'bis_certified'
    if (counts.size < 2 && !isCapabilityKey) continue

    const options: CategoryFacetOption[] = Array.from(counts.entries())
      .map(([value, count]) => ({
        value,
        label: formatCategorySpecOptionLabel(rawKey, value),
        count,
      }))
      .sort((a, b) => {
        const numA = Number(a.value)
        const numB = Number(b.value)
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB
        return b.count - a.count || a.label.localeCompare(b.label)
      })

    groups.push({
      key: rawKey,
      label: formatSpecLabel(rawKey),
      options,
    })
  }

  return groups
}

function getProductRecencyMs(product: StorefrontProduct): number {
  const dateStr = product.updated_at || product.created_at
  if (!dateStr) return 0
  const parsed = Date.parse(dateStr)
  return Number.isFinite(parsed) ? parsed : 0
}

export function sortCategoryProducts(
  products: readonly StorefrontProduct[],
  sortBy: CategorySortOption
): StorefrontProduct[] {
  if (sortBy === 'featured') return [...products]
  return [...products].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return getEffectiveProductPricePaise(a) - getEffectiveProductPricePaise(b)
    }
    if (sortBy === 'price_desc') {
      return getEffectiveProductPricePaise(b) - getEffectiveProductPricePaise(a)
    }
    if (sortBy === 'discount_desc') {
      return getProductBestDiscount(b) - getProductBestDiscount(a)
    }
    return getProductRecencyMs(b) - getProductRecencyMs(a)
  })
}

/**
 * Selects up to `limit` (default 10) top trending products for a category,
 * prioritizing in-stock discounts & recent releases while balancing brand variety.
 */
export function getTrendingCategoryProducts(
  products: readonly StorefrontProduct[],
  limit = 10
): StorefrontProduct[] {
  if (products.length === 0 || limit <= 0) return []

  const inStock = products.filter((p) => getProductTotalStock(p) > 0)
  const pool = inStock.length > 0 ? inStock : [...products]

  const ranked = [...pool].sort((a, b) => {
    const scoreA = getProductBestDiscount(a) * 1.5 + getProductRecencyMs(a) / 1e11
    const scoreB = getProductBestDiscount(b) * 1.5 + getProductRecencyMs(b) / 1e11
    return scoreB - scoreA
  })

  // Round-robin by brand so Top 10 spans flagship and popular brands evenly
  const byBrand = new Map<string, StorefrontProduct[]>()
  for (const product of ranked) {
    const brandKey = product.metadata.brand.trim().toLowerCase()
    const list = byBrand.get(brandKey) ?? []
    list.push(product)
    byBrand.set(brandKey, list)
  }

  const picked: StorefrontProduct[] = []
  const queues = Array.from(byBrand.values())
  while (picked.length < limit && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      if (picked.length >= limit) break
      const next = queue.shift()
      if (next) picked.push(next)
    }
  }

  return picked
}

export function filterAndSortCategoryProducts(
  products: readonly StorefrontProduct[],
  experience: CategoryExperienceProfile,
  state: CategoryFilterState
): StorefrontProduct[] {
  const query = state.searchQuery.trim().toLowerCase()
  const activePriceBands = experience.priceBands.filter((band) =>
    state.selectedPriceBands.includes(band.id)
  )

  const filtered = products.filter((product) => {
    if (
      state.selectedSubcategories.length > 0 &&
      !state.selectedSubcategories.includes(product.subcategory_handle)
    ) {
      return false
    }

    if (
      state.selectedBrands.length > 0 &&
      !state.selectedBrands.some(
        (b) => b.toLowerCase() === product.metadata.brand.trim().toLowerCase()
      )
    ) {
      return false
    }

    if (activePriceBands.length > 0) {
      const price = getEffectiveProductPricePaise(product)
      const inAnyBand = activePriceBands.some(
        (band) => price >= band.minPaise && (band.maxPaise === null || price < band.maxPaise)
      )
      if (!inAnyBand) return false
    }

    for (const [specKey, selectedValues] of Object.entries(state.selectedSpecs)) {
      if (selectedValues.length === 0) continue
      const productValues = getProductSpecTokenValues(product, specKey)
      const matchesSpec = selectedValues.some((val) => productValues.includes(val))
      if (!matchesSpec) return false
    }

    if (state.inStockOnly && getProductTotalStock(product) <= 0) return false
    if (state.discountOnly && getProductBestDiscount(product) <= 0) return false
    if (state.openBoxOnly && !product.metadata.requires_open_box_delivery) return false
    if (state.emiOnly && !product.metadata.emi_eligible) return false

    if (query) {
      const specText = Object.values(product.metadata.specs ?? {})
        .flat()
        .join(' ')
      const searchable = [
        product.title,
        product.subtitle,
        product.metadata.brand,
        product.metadata.model_number,
        product.subcategory_handle,
        ...(product.metadata.key_highlights ?? []),
        specText,
      ]
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(query)) return false
    }

    return true
  })

  return sortCategoryProducts(filtered, state.sortBy)
}

export function applyCategoryQuickPreset(
  preset: CategoryQuickPreset
): CategoryFilterState {
  return {
    ...DEFAULT_CATEGORY_FILTER_STATE,
    selectedSubcategories: [...(preset.subcategories ?? [])],
    selectedBrands: [...(preset.brands ?? [])],
    selectedPriceBands: [...(preset.priceBandIds ?? [])],
    selectedSpecs: Object.fromEntries(
      Object.entries(preset.specs ?? {}).map(([k, v]) => [k, [...v]])
    ),
    inStockOnly: Boolean(preset.inStockOnly),
    openBoxOnly: Boolean(preset.openBoxOnly),
  }
}

export function isPresetActive(
  preset: CategoryQuickPreset,
  state: CategoryFilterState
): boolean {
  const subsMatch =
    (preset.subcategories ?? []).join(',') === state.selectedSubcategories.join(',')
  const brandsMatch = (preset.brands ?? []).join(',') === state.selectedBrands.join(',')
  const pricesMatch =
    (preset.priceBandIds ?? []).join(',') === state.selectedPriceBands.join(',')
  const presetSpecs = preset.specs ?? {}
  const presetSpecKeys = Object.keys(presetSpecs).sort()
  const activeSpecKeys = Object.entries(state.selectedSpecs)
    .filter(([, vals]) => vals.length > 0)
    .map(([k]) => k)
    .sort()

  if (presetSpecKeys.join(',') !== activeSpecKeys.join(',')) return false
  for (const key of presetSpecKeys) {
    if ((presetSpecs[key] ?? []).join(',') !== (state.selectedSpecs[key] ?? []).join(',')) {
      return false
    }
  }
  return subsMatch && brandsMatch && pricesMatch
}

export function buildActiveFilterChips(
  state: CategoryFilterState,
  experience: CategoryExperienceProfile,
  category: StorefrontCategory
): CategoryActiveFilterChip[] {
  const chips: CategoryActiveFilterChip[] = []

  if (state.searchQuery.trim()) {
    chips.push({
      groupKey: 'search',
      value: state.searchQuery.trim(),
      label: `"${state.searchQuery.trim()}"`,
    })
  }

  for (const subHandle of state.selectedSubcategories) {
    const sub = category.subcategories.find((s) => s.handle === subHandle)
    chips.push({
      groupKey: 'subcategory',
      value: subHandle,
      label: sub?.name ?? subHandle,
    })
  }

  for (const brand of state.selectedBrands) {
    chips.push({
      groupKey: 'brand',
      value: brand,
      label: brand,
    })
  }

  for (const bandId of state.selectedPriceBands) {
    const band = experience.priceBands.find((b) => b.id === bandId)
    if (band) {
      chips.push({
        groupKey: 'price',
        value: band.id,
        label: band.label,
      })
    }
  }

  for (const [specKey, values] of Object.entries(state.selectedSpecs)) {
    const specLabel = formatSpecLabel(specKey)
    for (const value of values) {
      chips.push({
        groupKey: 'spec',
        specKey,
        value,
        label: `${specLabel}: ${formatCategorySpecOptionLabel(specKey, value)}`,
      })
    }
  }

  if (state.inStockOnly) {
    chips.push({ groupKey: 'toggle', value: 'inStockOnly', label: 'In Stock Only' })
  }
  if (state.discountOnly) {
    chips.push({ groupKey: 'toggle', value: 'discountOnly', label: 'Discounted Deals' })
  }
  if (state.openBoxOnly) {
    chips.push({ groupKey: 'toggle', value: 'openBoxOnly', label: 'Open-Box Verified' })
  }
  if (state.emiOnly) {
    chips.push({ groupKey: 'toggle', value: 'emiOnly', label: 'No-Cost EMI' })
  }

  return chips
}

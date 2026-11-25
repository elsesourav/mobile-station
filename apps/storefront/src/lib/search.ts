import type { StorefrontCategory, StorefrontProduct, StorefrontVariant } from '@mobile-station/types'
import { discountPercent } from '@/lib/format'
import type {
  ScoredSearchProduct,
  SearchCategoryFilterOption,
  SearchComputeResult,
  SearchSortOption,
} from '@/types/search'

export const RECENT_SEARCHES_STORAGE_KEY = 'mobile_station_recent_searches_v1'
export const MAX_RECENT_SEARCHES = 10

export const TRENDING_TECH_SEARCHES: readonly string[] = [
  'iPhone 16 Pro',
  'Samsung Galaxy S24 Ultra',
  'MacBook Air M3',
  'Sony WH-1000XM5',
  'OnePlus 13R',
  'Nothing Phone 3a',
  'Keychron Mechanical',
  '100W GaN Charger',
  'iPad Air M2',
  'RTX Gaming Laptop',
]

export const RECOVERY_SEARCH_CHIPS: readonly string[] = [
  'Smartphones',
  'Laptops',
  'iPhone 16',
  'Samsung',
  'Audio',
  'Keychron',
]

export const CATEGORY_SHORT_LABELS: Record<string, string> = {
  smartphones: 'Smartphones',
  tablets: 'Tablets',
  laptops: 'Laptops',
  audio: 'Audio & TWS',
  'keyboards-mice': 'Keyboards & Mice',
  'power-charging': 'Power & GaN',
  'accessories-storage': 'Cases & Watch',
}

export function buildSearchCategoryOptions(
  categories: StorefrontCategory[]
): SearchCategoryFilterOption[] {
  return [
    { handle: 'all', label: 'All' },
    ...categories.map((cat) => ({
      handle: cat.handle,
      label: CATEGORY_SHORT_LABELS[cat.handle] ?? cat.name,
    })),
  ]
}

export function getPrimaryVariant(product: StorefrontProduct): StorefrontVariant {
  return product.variants[0]
}

export function getTotalProductStock(product: StorefrontProduct): number {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0)
}

export function getProductBestDiscountPercent(product: StorefrontProduct): number {
  const variant = getPrimaryVariant(product)
  return discountPercent(variant.mrp_paise, variant.price_paise)
}

/**
 * Computes scored search results, closest featured match, and autocomplete keyword suggestions
 * matching Glorov's search scoring rules adapted for electronics metadata and variants.
 */
export function computeSearchResults(
  products: StorefrontProduct[],
  query: string,
  selectedCategory: string,
  selectedSort: SearchSortOption,
  isSubmitted: boolean
): SearchComputeResult {
  const cleanQuery = query.trim().toLowerCase()

  const scopedProducts =
    selectedCategory !== 'all'
      ? products.filter((p) => p.category_handle === selectedCategory)
      : products

  if (!cleanQuery) {
    return {
      rankedProducts: scopedProducts,
      closestProduct: null,
      keywordSuggestions: [],
    }
  }

  const queryTokens = cleanQuery
    .split(/[\s,&/+]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)

  const selectedCategoryLabel =
    selectedCategory !== 'all'
      ? (CATEGORY_SHORT_LABELS[selectedCategory] ?? selectedCategory).toLowerCase()
      : ''
  const isCategoryBrowseQuery =
    Boolean(selectedCategoryLabel) &&
    (cleanQuery === selectedCategoryLabel || cleanQuery === selectedCategory.toLowerCase())

  const scored: ScoredSearchProduct[] = []

  for (const product of scopedProducts) {
    let score = 0
    const titleLower = product.title.toLowerCase()
    const subtitleLower = product.subtitle.toLowerCase()
    const brandLower = product.metadata.brand.toLowerCase()
    const modelLower = product.metadata.model_number.toLowerCase()
    const categoryLower = product.category_handle.toLowerCase()
    const categoryLabelLower = (CATEGORY_SHORT_LABELS[product.category_handle] ?? '').toLowerCase()
    const subCategoryLower = product.subcategory_handle.toLowerCase()
    const descLower = product.description.toLowerCase()
    const highlightsText = (product.metadata.key_highlights ?? []).join(' ').toLowerCase()
    const variantsText = product.variants.map((v) => `${v.title} ${v.sku}`).join(' ').toLowerCase()

    if (titleLower === cleanQuery) score += 100
    else if (titleLower.startsWith(cleanQuery)) score += 60
    else if (titleLower.includes(cleanQuery)) score += 35

    if (brandLower === cleanQuery || modelLower === cleanQuery) score += 50
    else if (brandLower.includes(cleanQuery) || modelLower.includes(cleanQuery)) score += 25

    if (
      isCategoryBrowseQuery ||
      categoryLower.includes(cleanQuery) ||
      categoryLabelLower.includes(cleanQuery) ||
      subCategoryLower.includes(cleanQuery)
    ) {
      score += 20
    }
    if (highlightsText.includes(cleanQuery) || variantsText.includes(cleanQuery)) score += 15
    if (subtitleLower.includes(cleanQuery) || descLower.includes(cleanQuery)) score += 10

    if (score === 0 && queryTokens.length > 1) {
      const combined = `${titleLower} ${subtitleLower} ${brandLower} ${modelLower} ${highlightsText} ${categoryLower} ${categoryLabelLower} ${subCategoryLower}`
      const matchesAllTokens = queryTokens.every((token) => combined.includes(token))
      if (matchesAllTokens) score += 25
    }

    if (score > 0) {
      if (getTotalProductStock(product) > 0) score += 10
      if (getProductBestDiscountPercent(product) >= 10) score += 5
      scored.push({ product, score })
    }
  }

  scored.sort((a, b) => b.score - a.score)

  let rankedProducts = scored.map((entry) => entry.product)

  if (isSubmitted && selectedSort !== 'relevance') {
    rankedProducts = [...rankedProducts].sort((a, b) => {
      const varA = getPrimaryVariant(a)
      const varB = getPrimaryVariant(b)
      switch (selectedSort) {
        case 'price_asc':
          return varA.price_paise - varB.price_paise
        case 'price_desc':
          return varB.price_paise - varA.price_paise
        case 'discount':
          return getProductBestDiscountPercent(b) - getProductBestDiscountPercent(a)
        default:
          return 0
      }
    })
  }

  const closestProduct = scored.length > 0 ? scored[0].product : null

  const suggestionSet = new Set<string>()
  if (closestProduct) {
    suggestionSet.add(closestProduct.title)
  }

  for (const trend of TRENDING_TECH_SEARCHES) {
    if (trend.toLowerCase().includes(cleanQuery)) {
      suggestionSet.add(trend)
    }
  }

  for (const product of rankedProducts.slice(0, 4)) {
    suggestionSet.add(product.title)
    if (product.metadata.brand.toLowerCase().includes(cleanQuery)) {
      suggestionSet.add(`${product.metadata.brand} ${product.category_handle.replace('-', ' ')}`)
    }
  }

  return {
    rankedProducts,
    closestProduct,
    keywordSuggestions: Array.from(suggestionSet).slice(0, 5),
  }
}

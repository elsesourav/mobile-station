import type { ElectronicsRootCategory, StorefrontCategory, StorefrontProduct, StorefrontBrand } from '@mobile-station/types'

export type CategorySortOption =
  | 'featured'
  | 'price_asc'
  | 'price_desc'
  | 'discount_desc'
  | 'newest'

export interface CategoryPriceBand {
  id: string
  label: string
  minPaise: number
  maxPaise: number | null
}

export interface CategoryFacetOption {
  value: string
  label: string
  count: number
}

export interface CategoryFacetGroup {
  key: string
  label: string
  options: CategoryFacetOption[]
}

export interface CategoryBuyerAssurance {
  title: string
  detail: string
}

export interface CategoryQuickPreset {
  id: string
  label: string
  subcategories?: string[]
  brands?: string[]
  priceBandIds?: string[]
  specs?: Record<string, string[]>
  inStockOnly?: boolean
  openBoxOnly?: boolean
}

export interface CategoryExperienceProfile {
  handle: ElectronicsRootCategory
  eyebrow: string
  headline: string
  searchPlaceholder: string
  buyerAssurances: readonly CategoryBuyerAssurance[]
  priceBands: readonly CategoryPriceBand[]
  specFilterKeys: readonly string[]
  quickPresets: readonly CategoryQuickPreset[]
  pairingCategoryHandles: readonly ElectronicsRootCategory[]
  pairingTitle: string
  pairingSubtitle: string
}

export interface CategoryFilterState {
  searchQuery: string
  selectedSubcategories: string[]
  selectedBrands: string[]
  selectedPriceBands: string[]
  selectedSpecs: Record<string, string[]>
  inStockOnly: boolean
  discountOnly: boolean
  openBoxOnly: boolean
  emiOnly: boolean
  sortBy: CategorySortOption
}

export interface CategoryActiveFilterChip {
  groupKey: 'subcategory' | 'brand' | 'price' | 'spec' | 'toggle' | 'search'
  specKey?: string
  value: string
  label: string
}

export interface CategoryPageViewProps {
  category: StorefrontCategory
  products: StorefrontProduct[]
  brands: StorefrontBrand[]
  experience: CategoryExperienceProfile
  pairingCategories: StorefrontCategory[]
  pairingProducts: StorefrontProduct[]
}

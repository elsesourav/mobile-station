import type {
  CategoryInventoryPolicy,
  StorefrontProductMetadata,
} from '@mobile-station/types'

export interface SeedSubcategoryDefinition {
  handle: string
  name: string
  hsn: string
  tracking_mode?: string
}

export interface SeedRootCategoryDefinition {
  handle: string
  name: string
  subtitle?: string
  description: string
  default_hsn: string
  gst_rate_percent: number
  image_url?: string
  inventory_policy?: CategoryInventoryPolicy
  subcategories: SeedSubcategoryDefinition[]
}

export interface CategorySeedDataset {
  root_categories: SeedRootCategoryDefinition[]
}

export interface SeedProductVariantDefinition {
  title: string
  sku: string
  price_paise: number
  mrp_paise: number
  stock: number
  options: Record<string, string>
}

export interface SeedProductMetadata extends StorefrontProductMetadata {
  [propertyName: string]: unknown
}

export interface SeedProductDefinition {
  handle: string
  title: string
  subtitle: string
  category_handle: string
  subcategory_handle: string
  description: string
  thumbnail?: string
  images?: string[]
  metadata: SeedProductMetadata
  variants: SeedProductVariantDefinition[]
}

export interface ProductSeedDataset {
  products: SeedProductDefinition[]
}

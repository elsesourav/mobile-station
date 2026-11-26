export type ProductSpecScalarValue = string | number | boolean | string[]

export interface ProductSpecificationMap {
  [specKey: string]: ProductSpecScalarValue | undefined
}

export interface StorefrontVariant {
  title: string
  sku: string
  price_paise: number
  mrp_paise: number
  stock: number
  options: Record<string, string>
  display_title?: string
  thumbnail?: string
  images?: string[]
}

export interface ProductStockDetails {
  tracking_mode: string
  warehouse_hub: string
  warehouse_bin: string
  low_stock_threshold: number
  safety_stock: number
  restock_lead_days?: number
  return_window_days: number
}

export interface StorefrontProductMetadata {
  category_type: string
  brand: string
  model_number: string
  hsn_code: string
  gst_rate_percent: number
  gst_invoice_available?: boolean
  b2b_gst_available?: boolean
  color_images?: Record<string, string[]>
  warranty_months: number
  warranty_type?: string
  warranty_summary: string
  condition?: string
  in_the_box: string[]
  requires_imei_or_serial: boolean
  requires_open_box_delivery: boolean
  emi_eligible: boolean
  cod_eligible?: boolean
  product_coupon_code?: string
  product_coupon_percent?: number
  product_coupon_min_paise?: number
  key_highlights?: string[]
  stock_details?: ProductStockDetails
  specs?: ProductSpecificationMap
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
  metadata: StorefrontProductMetadata
  variants: StorefrontVariant[]
  created_at?: string
  updated_at?: string
}

export interface CategoryInventoryPolicy {
  tracking_mode: string
  warehouse_zone: string
  default_low_stock_threshold: number
  default_safety_stock: number
  requires_open_box_delivery: boolean
  return_window_days: number
}

export interface StorefrontSubcategory {
  id: string
  handle: string
  name: string
  hsn: string
  tracking_mode?: string
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
  inventory_policy?: CategoryInventoryPolicy
  subcategories: StorefrontSubcategory[]
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
  image_url: string
  mobile_image_url?: string
  cta_route?: string
  alt?: string
  display_order?: number
  is_active?: boolean
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
  max_discount_paise?: number
  min_cart_paise?: number
  applicable_categories?: string[]
  applicable_products?: string[]
  is_active?: boolean
}

export interface GstSplitBreakdown {
  taxablePaise: number
  cgstPaise: number
  sgstPaise: number
  igstPaise: number
  totalTaxPaise: number
}

export interface DeliveryServiceabilityResult {
  valid: boolean
  label: string
  eta: string
  cod: boolean
}

export interface GstSplitApiResponse {
  amount_paise: number
  taxable_value_paise: number
  gst_rate_percent: number
  supply_type: 'INTRA_STATE_BIHAR' | 'INTER_STATE'
  cgst_paise: number
  sgst_paise: number
  igst_paise: number
  total_tax_paise: number
  gstin_valid: boolean | null
  gstin_error: string | null
}

export interface PincodeServiceabilityApiResponse {
  serviceable: boolean
  error?: string
  pincode?: string
  pickup_hub?: string
  estimated_days?: string
  store_pickup_available?: boolean
  open_box_delivery_supported?: boolean
  cod_available_up_to_inr?: number
}

export interface BackendHealthResponse {
  status: 'healthy' | 'unhealthy'
  ready: boolean
  service: string
  environment: string
  elapsed_ms: number
  components: {
    postgres: { status: 'healthy' | 'unhealthy'; latency_ms: number }
    redis: { status: 'configured' | 'unconfigured' }
    cloudinary_images: { status: 'configured' | 'unconfigured' }
    s3_private_storage: { status: 'healthy' | 'degraded' }
    meilisearch: { status: 'healthy' | 'degraded' }
    resend_email: { status: 'configured' | 'mock' }
  }
}

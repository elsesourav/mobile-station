import type { ProductSpecificationMap } from './store-catalog'

export type ElectronicsRootCategory =
  | 'smartphones'
  | 'tablets'
  | 'laptops'
  | 'audio'
  | 'keyboards-mice'
  | 'power-charging'
  | 'accessories-storage'

export type WarrantyType = 'brand_authorized' | 'seller_warranty' | 'replacement_only' | 'none'

export type ProductCondition = 'brand_new_sealed' | 'open_box_verified' | 'certified_refurbished'

export type InventoryTrackingMode = 'imei_serialized' | 'serial_tracked' | 'sku_quantity'

export interface ElectronicsStockDetails {
  tracking_mode: InventoryTrackingMode
  warehouse_hub: string
  warehouse_bin: string
  low_stock_threshold: number
  safety_stock: number
  restock_lead_days: number
  return_window_days: number
}

export interface ElectronicsComplianceMetadata {
  brand: string
  model_number: string
  hsn_code: string
  gst_rate_percent: 18 | 28 | 12 | 5
  gst_invoice_available?: boolean
  b2b_gst_available?: boolean
  color_images?: Record<string, string[]>
  warranty_months: number
  warranty_type: WarrantyType
  warranty_summary: string
  condition: ProductCondition
  in_the_box: string[]
  requires_imei_or_serial: boolean
  requires_open_box_delivery: boolean
  emi_eligible: boolean
  cod_eligible: boolean
  country_of_origin?: string
  stock_details?: ElectronicsStockDetails
}

export interface MobileSpecs {
  ram_gb?: number
  storage_gb?: number
  display_size_inches?: number
  display_type?: string
  refresh_rate_hz?: number
  processor?: string
  rear_camera?: string
  front_camera?: string
  battery_mah?: number
  charging_watt?: number
  network?: '5G' | '4G LTE'
  sim_type?: string
  os?: string
  ip_rating?: string
}

export interface TabletSpecs {
  ram_gb?: number
  storage_gb?: number
  display_size_inches?: number
  display_type?: string
  refresh_rate_hz?: number
  processor?: string
  connectivity?: 'Wi-Fi Only' | 'Wi-Fi + 5G' | 'Wi-Fi + 4G'
  stylus_support?: boolean
  battery_mah?: number
  os?: string
}

export interface LaptopSpecs {
  processor_brand?: 'Intel' | 'AMD' | 'Apple' | 'Qualcomm'
  processor_model?: string
  ram_gb?: number
  ram_type?: string
  ssd_gb?: number
  gpu?: string
  display_size_inches?: number
  display_resolution?: string
  refresh_rate_hz?: number
  os?: string
  weight_kg?: number
  battery_whr?: number
  ports?: string[]
  use_case?: 'ultrabook' | 'gaming' | 'creator' | 'business' | 'student'
}

export interface AudioSpecs {
  form_factor?: 'tws_earbuds' | 'neckband' | 'wired_earphone' | 'over_ear' | 'on_ear' | 'speaker'
  driver_size_mm?: number
  anc?: boolean
  anc_db?: number
  bluetooth_version?: string
  codecs?: string[]
  playtime_hours?: number
  fast_charge_summary?: string
  water_resistance?: string
  connector?: 'Bluetooth' | 'USB-C' | '3.5mm' | 'Bluetooth + 3.5mm'
  low_latency_ms?: number
}

export interface KeyboardMouseSpecs {
  peripheral_type?: 'keyboard' | 'mouse' | 'combo' | 'desk_mat'
  switch_type?: 'mechanical_red' | 'mechanical_brown' | 'mechanical_blue' | 'hall_effect' | 'scissor' | 'membrane' | 'optical'
  hot_swappable?: boolean
  layout?: 'full_100' | 'tkl_80' | 'compact_75' | 'mini_65' | 'mini_60'
  connectivity?: 'Tri-Mode (2.4G + BT + Wired)' | 'Bluetooth + Wired' | '2.4GHz Wireless' | 'Wired USB'
  polling_rate_hz?: number
  max_dpi?: number
  sensor?: string
  weight_grams?: number
  backlight?: 'RGB' | 'White LED' | 'None'
  os_compatibility?: string[]
}

export interface PowerChargerSpecs {
  device_type?: 'gan_charger' | 'power_bank' | 'cable' | 'surge_protector' | 'hub_dock'
  output_wattage?: number
  capacity_mah?: number
  ports_summary?: string
  protocols?: string[]
  cable_length_m?: number
  cable_rating_watt?: number
  bis_certified?: boolean
}

export interface AccessoryStorageSpecs {
  accessory_type?: 'case_cover' | 'tempered_glass' | 'laptop_sleeve' | 'stand_mount' | 'ssd_hdd' | 'pen_drive_sd' | 'smartwatch' | 'cleaning_kit'
  compatible_devices?: string[]
  material?: string
  capacity_gb?: number
  read_speed_mbps?: number
  write_speed_mbps?: number
  interface?: string
  magsafe_compatible?: boolean
  display_size_inches?: number
  water_resistance?: string
  battery_days?: number
}

export interface ElectronicsProductMetadata extends Partial<ElectronicsComplianceMetadata> {
  category_type: ElectronicsRootCategory
  key_highlights?: string[]
  specs?:
    | MobileSpecs
    | TabletSpecs
    | LaptopSpecs
    | AudioSpecs
    | KeyboardMouseSpecs
    | PowerChargerSpecs
    | AccessoryStorageSpecs
    | ProductSpecificationMap
}

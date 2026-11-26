import type {
  ProductSpecScalarValue,
  ProductSpecificationMap,
  StorefrontVariant,
} from '@mobile-station/types'
import type { SpecificationRow } from '@/types/storefront'

const SPEC_LABELS: Record<string, string> = {
  accessory_type: 'Accessory Type',
  anc: 'Active Noise Cancellation',
  anc_db: 'ANC Noise Reduction',
  backlight: 'Backlighting',
  battery_days: 'Battery Endurance',
  battery_mah: 'Battery Capacity',
  battery_whr: 'Battery Energy',
  bis_certified: 'BIS Certified',
  bluetooth_version: 'Bluetooth Version',
  cable_length_m: 'Cable Length',
  cable_rating_watt: 'Power Delivery Rating',
  capacity_gb: 'Storage Capacity',
  capacity_mah: 'Battery Capacity',
  charging_watt: 'Fast Charging',
  codecs: 'Audio Codecs',
  compatible_devices: 'Compatible Devices',
  connectivity: 'Connectivity',
  connector: 'Connector Type',
  device_type: 'Device Category',
  display_resolution: 'Display Resolution',
  display_size_inches: 'Display Size',
  display_type: 'Display Panel',
  driver_size_mm: 'Audio Driver Size',
  fast_charge_summary: 'Fast Charging',
  form_factor: 'Form Factor',
  front_camera: 'Front Camera',
  gpu: 'Graphics Processor',
  hot_swappable: 'Hot-Swappable Switches',
  interface: 'Host Interface',
  ip_rating: 'Ingress Protection',
  layout: 'Keyboard Layout',
  low_latency_ms: 'Low Latency Mode',
  magsafe_compatible: 'MagSafe Compatible',
  material: 'Build Material',
  max_dpi: 'Max Sensor DPI',
  network: 'Cellular Network',
  os: 'Operating System',
  os_compatibility: 'OS Compatibility',
  output_wattage: 'Max Output Power',
  peripheral_type: 'Peripheral Type',
  playtime_hours: 'Total Playtime',
  polling_rate_hz: 'Polling Rate',
  ports: 'Ports & I/O',
  ports_summary: 'Output Ports',
  processor: 'Processor / SoC',
  processor_brand: 'Processor Brand',
  processor_model: 'Processor Model',
  protocols: 'Charging Protocols',
  ram_gb: 'Memory (RAM)',
  ram_type: 'RAM Type',
  read_speed_mbps: 'Read Speed',
  rear_camera: 'Rear Camera System',
  refresh_rate_hz: 'Refresh Rate',
  sensor: 'Optical Sensor',
  sim_type: 'SIM Configuration',
  ssd_gb: 'SSD Storage',
  storage_gb: 'Internal Storage',
  stylus_support: 'Stylus Support',
  switch_type: 'Switch Type',
  use_case: 'Recommended Use',
  water_resistance: 'Water & Dust Resistance',
  weight_grams: 'Weight',
  weight_kg: 'Weight',
  write_speed_mbps: 'Write Speed',
  variant_sku: 'Active Variant SKU',
  variant_color: 'Finish / Color',
  variant_size: 'Variant Size / Option',
}

export function formatSpecLabel(specKey: string): string {
  if (SPEC_LABELS[specKey]) return SPEC_LABELS[specKey]
  return specKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bGb\b/g, 'GB')
    .replace(/\bMah\b/g, 'mAh')
    .replace(/\bHz\b/g, 'Hz')
    .replace(/\bDpi\b/g, 'DPI')
    .replace(/\bOs\b/g, 'OS')
}

export function formatSpecValue(
  specKey: string,
  specValue: ProductSpecScalarValue | undefined
): string {
  if (specValue === undefined) return '—'
  if (typeof specValue === 'boolean') return specValue ? 'Yes' : 'No'
  if (Array.isArray(specValue)) return specValue.join(', ')
  if (typeof specValue === 'number') {
    if (
      specKey === 'ram_gb' ||
      specKey === 'storage_gb' ||
      specKey === 'ssd_gb' ||
      specKey === 'capacity_gb'
    ) {
      return specValue >= 1024 ? `${specValue / 1024} TB (${specValue} GB)` : `${specValue} GB`
    }
    if (specKey === 'display_size_inches') return `${specValue} inches`
    if (specKey === 'refresh_rate_hz' || specKey === 'polling_rate_hz') return `${specValue} Hz`
    if (specKey === 'battery_mah' || specKey === 'capacity_mah') {
      return `${specValue.toLocaleString('en-IN')} mAh`
    }
    if (specKey === 'battery_whr') return `${specValue} Wh`
    if (specKey === 'battery_days') return `${specValue} Days`
    if (
      specKey === 'charging_watt' ||
      specKey === 'output_wattage' ||
      specKey === 'cable_rating_watt'
    ) {
      return `${specValue}W`
    }
    if (specKey === 'driver_size_mm') return `${specValue} mm`
    if (specKey === 'low_latency_ms') return `${specValue} ms`
    if (specKey === 'playtime_hours') return `${specValue} Hours`
    if (specKey === 'anc_db') return `${specValue} dB`
    if (specKey === 'cable_length_m') return `${specValue} m`
    if (specKey === 'weight_grams') return `${specValue} g`
    if (specKey === 'weight_kg') return `${specValue} kg`
    if (specKey === 'read_speed_mbps' || specKey === 'write_speed_mbps') {
      return `${specValue} MB/s`
    }
    if (specKey === 'max_dpi') return `${specValue.toLocaleString('en-IN')} DPI`
  }
  return String(specValue)
}

function parseCapacityGigabytes(label: string): number | null {
  const terabyteMatch = label.match(/(\d+(?:\.\d+)?)\s*TB/i)
  if (terabyteMatch) return Math.round(parseFloat(terabyteMatch[1]) * 1024)
  const gigabyteMatch = label.match(/(\d+)\s*GB/i)
  if (gigabyteMatch) return parseInt(gigabyteMatch[1], 10)
  return null
}

export function buildVariantSpecificationRows(
  baseSpecs: ProductSpecificationMap | undefined,
  variant: StorefrontVariant
): SpecificationRow[] {
  const mergedSpecs: ProductSpecificationMap = { ...(baseSpecs ?? {}) }
  const variantOptions = variant.options ?? {}

  const applyStorageCapacity = (gb: number) => {
    if ('storage_gb' in mergedSpecs) mergedSpecs.storage_gb = gb
    else if ('ssd_gb' in mergedSpecs) mergedSpecs.ssd_gb = gb
    else if ('capacity_gb' in mergedSpecs) mergedSpecs.capacity_gb = gb
    else mergedSpecs.storage_gb = gb
  }

  const combinedSpecSource =
    variantOptions['Memory / SSD'] ||
    variantOptions.Variant ||
    variantOptions.Config ||
    variantOptions.Configuration ||
    variantOptions.Capacity

  if (combinedSpecSource) {
    const capacityTokens = combinedSpecSource.match(/\d+(?:\.\d+)?\s*(?:GB|TB)/gi) ?? []
    const parsedNumbers = capacityTokens
      .map((tok) => parseCapacityGigabytes(tok))
      .filter((n): n is number => n !== null)

    if (parsedNumbers.length >= 2) {
      mergedSpecs.ram_gb = parsedNumbers[0]
      applyStorageCapacity(parsedNumbers[1])
    } else if (parsedNumbers.length === 1) {
      applyStorageCapacity(parsedNumbers[0])
    }
  }

  if (variantOptions.Storage) {
    const parsedStorageGb = parseCapacityGigabytes(variantOptions.Storage)
    if (parsedStorageGb !== null) applyStorageCapacity(parsedStorageGb)
  }

  if (variantOptions.RAM) {
    const parsedRamGb = parseCapacityGigabytes(variantOptions.RAM)
    if (parsedRamGb !== null) mergedSpecs.ram_gb = parsedRamGb
  }

  const colorLabel = variantOptions.Color || variantOptions.Finish
  if (colorLabel) mergedSpecs.variant_color = colorLabel
  if (variantOptions.Size) mergedSpecs.variant_size = variantOptions.Size
  mergedSpecs.variant_sku = variant.sku

  return Object.entries(mergedSpecs).map(([key, value]) => ({
    key,
    label: formatSpecLabel(key),
    formattedValue: formatSpecValue(key, value),
  }))
}

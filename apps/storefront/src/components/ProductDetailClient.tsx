'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import {
  checkDeliveryServiceability,
  computeGstSplit,
  type StorefrontCategory,
  type StorefrontProduct,
} from '@/lib/catalog'
import { discountPercent, formatINR, monthlyEmiPreview } from '@/lib/format'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ProductCard } from '@/components/ProductCard'
import { useCart } from '@/components/CartContext'

interface ProductDetailClientProps {
  product: StorefrontProduct
  category?: StorefrontCategory
  relatedProducts: StorefrontProduct[]
}

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

function formatSpecLabel(key: string): string {
  if (SPEC_LABELS[key]) return SPEC_LABELS[key]
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bGb\b/g, 'GB')
    .replace(/\bMah\b/g, 'mAh')
    .replace(/\bHz\b/g, 'Hz')
    .replace(/\bDpi\b/g, 'DPI')
    .replace(/\bOs\b/g, 'OS')
}

function formatSpecValue(key: string, val: unknown): string {
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'number') {
    if (key === 'ram_gb' || key === 'storage_gb' || key === 'ssd_gb' || key === 'capacity_gb') {
      return val >= 1024 ? `${val / 1024} TB (${val} GB)` : `${val} GB`
    }
    if (key === 'display_size_inches') return `${val} inches`
    if (key === 'refresh_rate_hz' || key === 'polling_rate_hz') return `${val} Hz`
    if (key === 'battery_mah' || key === 'capacity_mah') return `${val.toLocaleString('en-IN')} mAh`
    if (key === 'battery_whr') return `${val} Wh`
    if (key === 'battery_days') return `${val} Days`
    if (key === 'charging_watt' || key === 'output_wattage' || key === 'cable_rating_watt') {
      return `${val}W`
    }
    if (key === 'driver_size_mm') return `${val} mm`
    if (key === 'low_latency_ms') return `${val} ms`
    if (key === 'playtime_hours') return `${val} Hours`
    if (key === 'anc_db') return `${val} dB`
    if (key === 'cable_length_m') return `${val} m`
    if (key === 'weight_grams') return `${val} g`
    if (key === 'weight_kg') return `${val} kg`
    if (key === 'read_speed_mbps' || key === 'write_speed_mbps') return `${val} MB/s`
    if (key === 'max_dpi') return `${val.toLocaleString('en-IN')} DPI`
  }
  return String(val)
}

function parseCapacityGB(label: string): number | null {
  const tb = label.match(/(\d+(?:\.\d+)?)\s*TB/i)
  if (tb) return Math.round(parseFloat(tb[1]) * 1024)
  const gb = label.match(/(\d+)\s*GB/i)
  if (gb) return parseInt(gb[1], 10)
  return null
}

function getDynamicSpecEntries(
  baseSpecs: Record<string, unknown> | undefined,
  variant: StorefrontProduct['variants'][number]
): Array<[string, unknown]> {
  const merged: Record<string, unknown> = { ...(baseSpecs ?? {}) }
  const opts = variant.options ?? {}

  if (opts.Storage) {
    const parsed = parseCapacityGB(opts.Storage)
    if (parsed !== null) {
      if ('storage_gb' in merged) merged.storage_gb = parsed
      else if ('ssd_gb' in merged) merged.ssd_gb = parsed
      else if ('capacity_gb' in merged) merged.capacity_gb = parsed
      else merged.storage_gb = parsed
    }
  }
  if (opts.RAM) {
    const parsedRam = parseCapacityGB(opts.RAM)
    if (parsedRam !== null) merged.ram_gb = parsedRam
  }
  if (opts.Color) merged.variant_color = opts.Color
  if (opts.Size) merged.variant_size = opts.Size
  merged.variant_sku = variant.sku

  return Object.entries(merged)
}

export function ProductDetailClient({
  product,
  category,
  relatedProducts,
}: ProductDetailClientProps) {
  const [variantIdx, setVariantIdx] = useState(0)
  const [pincode, setPincode] = useState('842001')
  const [deliveryInfo, setDeliveryInfo] = useState(() =>
    checkDeliveryServiceability('842001')
  )
  const [intraStateGst, setIntraStateGst] = useState(true)
  const { addItem, openCart } = useCart()

  const activeVariant = product.variants[variantIdx] ?? product.variants[0]
  const off = discountPercent(activeVariant.mrp_paise, activeVariant.price_paise)
  const gst = computeGstSplit(
    activeVariant.price_paise,
    product.metadata.gst_rate_percent,
    intraStateGst
  )
  const specEntries = getDynamicSpecEntries(product.metadata.specs, activeVariant)

  const handleAdd = () => {
    addItem({
      sku: activeVariant.sku,
      productHandle: product.handle,
      title: product.title,
      variantTitle: activeVariant.title,
      brand: product.metadata.brand,
      price_paise: activeVariant.price_paise,
      mrp_paise: activeVariant.mrp_paise,
      thumbnail: product.thumbnail,
      requires_open_box_delivery: product.metadata.requires_open_box_delivery,
    })
    openCart()
  }

  return (
    <StorefrontChrome activeCategoryHandle={product.category_handle}>
      <div className="page-container py-6 sm:py-8 space-y-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-ink-muted"
        >
          <Link href="/" className="inline-flex items-center gap-1 hover:text-gold-700">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/categories/${category.handle}`} className="hover:text-gold-700">
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-ink-primary font-medium truncate">{product.title}</span>
        </nav>

        {/* Main Buy Box + Visual Stage */}
        <section className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Image Frame */}
          <div className="lg:col-span-5 space-y-3">
            <div className="overflow-hidden rounded-lg border border-chrome-200 bg-surface-card shadow-card">
              <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
                {off > 0 ? (
                  <span className="rounded-full bg-commerce-deal px-3 py-1 text-xs font-bold text-ink-inverse">
                    {off}% OFF
                  </span>
                ) : (
                  <span />
                )}
                <span className="rounded-full bg-commerce-obdBg px-3 py-1 font-mono text-[11px] font-semibold text-commerce-obdText">
                  {activeVariant.stock} In Stock
                </span>
              </div>
              <div className="relative aspect-square w-full">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain p-5 sm:p-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-sm border border-chrome-200 bg-surface-card p-3">
                <p className="font-mono text-[10px] text-ink-muted uppercase">Hub Location</p>
                <p className="font-semibold text-ink-primary mt-0.5 truncate">
                  {product.metadata.stock_details?.warehouse_hub ?? 'Muzaffarpur Hub'}
                </p>
              </div>
              <div className="rounded-sm border border-chrome-200 bg-surface-card p-3">
                <p className="font-mono text-[10px] text-ink-muted uppercase">Warehouse Bin</p>
                <p className="font-mono font-semibold text-gold-700 mt-0.5 truncate">
                  {product.metadata.stock_details?.warehouse_bin ?? 'MZP-MAIN-01'}
                </p>
              </div>
            </div>
          </div>

          {/* Purchase & Compliance Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-obsidian-900 px-3 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-gold-500">
                  {product.metadata.brand} Official
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  Model {product.metadata.model_number} · HSN {product.metadata.hsn_code}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink-primary">
                {product.title}
              </h1>
              <p className="text-sm text-ink-secondary">{product.description}</p>
            </div>

            {/* Pricing & 18% GST Split Box */}
            <div className="rounded-md border border-chrome-200 bg-surface-card p-4 space-y-3 shadow-card">
              <div className="flex flex-wrap items-baseline gap-3 tabular-nums">
                <span className="font-display text-2xl sm:text-3xl font-bold text-ink-primary">
                  {formatINR(activeVariant.price_paise)}
                </span>
                {activeVariant.mrp_paise > activeVariant.price_paise && (
                  <span className="text-sm text-ink-muted line-through">
                    MRP {formatINR(activeVariant.mrp_paise)}
                  </span>
                )}
                <span className="text-xs font-semibold text-commerce-savings">
                  Inclusive of {product.metadata.gst_rate_percent}% GST
                </span>
              </div>

              {product.metadata.emi_eligible && (
                <p className="text-xs font-semibold text-commerce-savings tabular-nums">
                  No-Cost EMI starts at {monthlyEmiPreview(activeVariant.price_paise)}/month
                </p>
              )}

              {/* B2B GST Input Tax Credit Estimator */}
              <div className="rounded-xs bg-surface-muted p-3 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-ink-primary">
                    GST Invoice Tax Split (B2B ITC Eligible)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIntraStateGst((v) => !v)}
                    className="font-mono text-[10px] font-semibold text-gold-700 hover:underline"
                  >
                    Switch to {intraStateGst ? 'Inter-State IGST' : 'Bihar Intra-State CGST+SGST'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ink-secondary tabular-nums">
                  <span>Taxable: {formatINR(gst.taxablePaise)}</span>
                  {intraStateGst ? (
                    <>
                      <span>CGST 9%: {formatINR(gst.cgstPaise)}</span>
                      <span>SGST 9%: {formatINR(gst.sgstPaise)}</span>
                    </>
                  ) : (
                    <span>IGST 18%: {formatINR(gst.igstPaise)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Variant Selector */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Select Configuration ({activeVariant.sku})
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, idx) => (
                  <button
                    key={v.sku}
                    type="button"
                    onClick={() => setVariantIdx(idx)}
                    className={`rounded-sm border px-3 py-2 text-xs font-semibold transition ${
                      idx === variantIdx
                        ? 'border-obsidian-900 bg-obsidian-900 text-gold-500 shadow-card'
                        : 'border-chrome-300 bg-surface-card text-ink-primary hover:border-gold-500'
                    }`}
                  >
                    {v.title} · {formatINR(v.price_paise)}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Add CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-sm bg-gold-500 px-6 py-3 text-sm font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart — {formatINR(activeVariant.price_paise)}</span>
              </button>
            </div>

            {/* Pincode Delivery Serviceability Check */}
            <div className="rounded-md border border-chrome-200 bg-surface-card p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-ink-primary">
                <Truck className="h-4 w-4 text-gold-700" />
                <span>Check Pan-India Delivery & Muzaffarpur Hub Pickup</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  aria-label="Enter 6-digit Indian PIN code"
                  placeholder="Enter PIN (e.g. 842001)"
                  className="flex-1 min-w-0 rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 font-mono text-xs text-ink-primary focus:border-gold-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setDeliveryInfo(checkDeliveryServiceability(pincode))}
                  className="rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-obsidian-700 transition shrink-0"
                >
                  Check
                </button>
              </div>
              <div
                className={`flex items-start gap-2 text-xs rounded-xs p-2.5 ${
                  deliveryInfo.valid
                    ? 'bg-commerce-obdBg text-commerce-obdText'
                    : 'bg-commerce-errorBg text-commerce-errorText'
                }`}
              >
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{deliveryInfo.label}</p>
                  {deliveryInfo.eta && <p className="text-[11px] mt-0.5">{deliveryInfo.eta}</p>}
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-commerce-warrantyBg px-3 py-1 text-xs font-semibold text-commerce-warrantyText">
                <ShieldCheck className="h-3.5 w-3.5" />
                {product.metadata.warranty_summary}
              </span>
              {product.metadata.requires_open_box_delivery && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-commerce-obdBg px-3 py-1 text-xs font-semibold text-commerce-obdText">
                  <PackageCheck className="h-3.5 w-3.5" />
                  Open-Box Inspection Verified
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Box Contents & Technical Specifications Table */}
        <section className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-5 rounded-md border border-chrome-200 bg-surface-card p-5 space-y-3 shadow-card">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-gold-700" />
              <h2 className="font-display text-lg font-bold">What’s in the Retail Box</h2>
            </div>
            <ul className="space-y-2 text-xs text-ink-secondary">
              {product.metadata.in_the_box.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-commerce-savings shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-7 rounded-md border border-chrome-200 bg-surface-card p-5 space-y-3 shadow-card">
            <h2 className="font-display text-lg font-bold">Technical Specifications</h2>
            <div className="divide-y divide-chrome-200 border border-chrome-200 rounded-sm overflow-hidden">
              {specEntries.map(([key, val]) => (
                <div
                  key={key}
                  className="ms-spec-row grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center"
                >
                  <span className="col-span-5 font-mono text-ink-muted break-words">
                    {formatSpecLabel(key)}
                  </span>
                  <span className="col-span-7 font-medium text-ink-primary break-words">
                    {formatSpecValue(key, val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold">More in {category?.name}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.handle} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </StorefrontChrome>
  )
}

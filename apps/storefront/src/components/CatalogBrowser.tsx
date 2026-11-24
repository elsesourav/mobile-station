'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  BatteryCharging,
  Box,
  CheckCircle2,
  FileText,
  Headphones,
  Keyboard,
  Laptop,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Tablet,
  X,
} from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { discountPercent, formatINR, monthlyEmiPreview } from '@/lib/format'

export interface StorefrontVariant {
  title: string
  sku: string
  price_paise: number
  mrp_paise: number
  stock: number
  options: Record<string, string>
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
  metadata: {
    category_type: string
    brand: string
    model_number: string
    hsn_code: string
    gst_rate_percent: number
    warranty_months: number
    warranty_summary: string
    in_the_box: string[]
    requires_imei_or_serial: boolean
    requires_open_box_delivery: boolean
    emi_eligible: boolean
    key_highlights?: string[]
    stock_details?: {
      tracking_mode: string
      warehouse_hub: string
      warehouse_bin: string
      low_stock_threshold: number
      safety_stock: number
      return_window_days: number
    }
    specs?: Record<string, unknown>
  }
  variants: StorefrontVariant[]
}

export interface StorefrontCategory {
  id: string
  handle: string
  name: string
  subtitle: string
  default_hsn: string
  icon: string
  image_url?: string
  inventory_policy?: {
    tracking_mode: string
    warehouse_zone: string
    return_window_days: number
  }
  subcategories: Array<{
    id: string
    handle: string
    name: string
    hsn: string
  }>
}

export interface StorefrontBrand {
  handle: string
  name: string
  categories: string[]
  warranty_support: string
  featured?: boolean
}

export interface StorefrontHeroBanner {
  id: string
  tag: string
  title: string
  subtitle: string
  cta_text: string
  cta_route: string
  image_url?: string
}

export interface StorefrontAnnouncement {
  id: string
  text: string
  badge: string
}

export interface StorefrontTrustBadge {
  id: string
  title: string
  subtitle: string
  icon_key: string
}

export interface StorefrontOffer {
  id: string
  code: string
  title: string
  description: string
}

interface CatalogBrowserProps {
  products: StorefrontProduct[]
  categories: StorefrontCategory[]
  brands: StorefrontBrand[]
  heroBanners: StorefrontHeroBanner[]
  announcements: StorefrontAnnouncement[]
  trustBadges: StorefrontTrustBadge[]
  offers: StorefrontOffer[]
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Keyboard,
  BatteryCharging,
  ShieldCheck,
}

const TRUST_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'shield-check': ShieldCheck,
  'package-check': PackageCheck,
  'file-text': FileText,
  store: Store,
}

const TRACKING_LABELS: Record<string, string> = {
  imei_serialized: 'IMEI Sealed',
  serial_tracked: 'Serial Tracked',
  sku_quantity: 'Hub Stocked',
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: StorefrontProduct
  onAddToCart: (sku: string) => void
}) {
  const [variantIdx, setVariantIdx] = useState(0)
  const activeVariant = product.variants[variantIdx] ?? product.variants[0]
  const off = discountPercent(activeVariant.mrp_paise, activeVariant.price_paise)
  const lowThreshold = product.metadata.stock_details?.low_stock_threshold ?? 5
  const isLowStock = activeVariant.stock > 0 && activeVariant.stock <= lowThreshold
  const trackingMode = product.metadata.stock_details?.tracking_mode ?? 'sku_quantity'

  return (
    <article className="rounded-md border border-chrome-200 bg-surface-card p-4 shadow-card hover:shadow-card-hover hover:border-gold-500/70 transition flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {/* Studio Product Thumbnail Showcase */}
        <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-chrome-200 bg-surface-card">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 hover:scale-105"
          />
          {off > 0 && (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-commerce-deal px-2.5 py-0.5 text-[10px] font-bold text-ink-inverse shadow-card">
              {off}% OFF
            </span>
          )}
          <span
            className={`absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
              isLowStock
                ? 'bg-commerce-warningBg text-commerce-warningText'
                : 'bg-commerce-obdBg text-commerce-obdText'
            }`}
          >
            {activeVariant.stock} In Stock
          </span>
        </div>

        {/* Brand + Tracking Pill */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gold-700">
            {product.metadata.brand}
          </span>
          <span className="font-mono text-[10px] text-ink-muted">
            {TRACKING_LABELS[trackingMode] ?? 'Verified'} · HSN {product.metadata.hsn_code}
          </span>
        </div>

        <div>
          <h3 className="font-display text-base font-bold leading-snug text-ink-primary line-clamp-2">
            {product.title}
          </h3>
          <p className="text-xs text-ink-muted mt-1 line-clamp-2">{product.description}</p>
        </div>

        {/* Key Technical Highlights */}
        <div className="flex flex-wrap gap-1.5">
          {(product.metadata.key_highlights ?? []).slice(0, 3).map((chip) => (
            <span
              key={chip}
              className="rounded-xs bg-surface-muted px-2 py-0.5 font-mono text-[10px] text-ink-secondary"
            >
              {chip}
            </span>
          ))}
        </div>

        {/* Interactive Variant Switcher */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {product.variants.map((variant, idx) => (
            <button
              key={variant.sku}
              type="button"
              onClick={() => setVariantIdx(idx)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                idx === variantIdx
                  ? 'border-obsidian-900 bg-obsidian-900 text-ink-inverse'
                  : 'border-chrome-300 bg-surface-card text-ink-secondary hover:border-gold-500'
              }`}
            >
              {variant.title}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing, Box Contents & Fulfillment */}
      <div className="pt-3 border-t border-chrome-200 space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="font-display text-lg font-bold text-ink-primary">
              {formatINR(activeVariant.price_paise)}
            </span>
            {activeVariant.mrp_paise > activeVariant.price_paise && (
              <span className="text-xs text-ink-muted line-through">
                {formatINR(activeVariant.mrp_paise)}
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-ink-muted">{activeVariant.sku}</span>
        </div>

        {product.metadata.emi_eligible && (
          <p className="text-[11px] font-medium text-commerce-savings tabular-nums">
            No-Cost EMI from {monthlyEmiPreview(activeVariant.price_paise)}/mo · Incl. 18% GST
          </p>
        )}

        <div className="flex items-start gap-1.5 text-[11px] text-ink-secondary bg-surface-muted/70 rounded-xs p-2">
          <Box className="h-3.5 w-3.5 text-gold-700 shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            <strong>In Box:</strong> {product.metadata.in_the_box.slice(0, 3).join(', ')}
            {product.metadata.in_the_box.length > 3 ? '…' : ''}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-commerce-warrantyBg px-2.5 py-0.5 text-[10px] font-semibold text-commerce-warrantyText">
            {product.metadata.warranty_summary}
          </span>
          {product.metadata.requires_open_box_delivery && (
            <span className="rounded-full bg-commerce-obdBg px-2.5 py-0.5 text-[10px] font-semibold text-commerce-obdText">
              Open-Box Check
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(activeVariant.sku)}
          className="w-full inline-flex min-h-[40px] items-center justify-center gap-2 rounded-sm bg-obsidian-900 px-3 py-2 text-xs font-semibold text-ink-inverse hover:bg-obsidian-700 transition"
        >
          <ShoppingCart className="h-3.5 w-3.5 text-gold-500" />
          <span>Add to Cart</span>
        </button>
      </div>
    </article>
  )
}

export function CatalogBrowser({
  products,
  categories,
  brands,
  heroBanners,
  announcements,
  trustBadges,
  offers,
}: CatalogBrowserProps) {
  const [heroIdx, setHeroIdx] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartSkus, setCartSkus] = useState<string[]>([])

  const activeHero = heroBanners[heroIdx] ?? heroBanners[0]

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) {
      counts[p.category_handle] = (counts[p.category_handle] || 0) + 1
    }
    return counts
  }, [products])

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) {
      const b = p.metadata.brand.toLowerCase()
      counts[b] = (counts[b] || 0) + 1
    }
    return counts
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category_handle !== selectedCategory) return false
      if (
        selectedBrand !== 'all' &&
        p.metadata.brand.toLowerCase() !== selectedBrand.toLowerCase()
      ) {
        return false
      }
      if (!q) return true
      const haystack = [
        p.title,
        p.subtitle,
        p.metadata.brand,
        p.metadata.model_number,
        p.category_handle,
        ...(p.metadata.key_highlights ?? []),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [products, selectedCategory, selectedBrand, searchQuery])

  const selectCategory = (catHandle: string) => {
    setSelectedCategory(catHandle)
    const el = document.getElementById('catalog')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-ink-primary">
      {/* Top Announcement & Trust Strip */}
      <div className="bg-obsidian-950 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-gold-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-obsidian-950">
              {announcements[0]?.badge}
            </span>
            <span className="text-chrome-200">{announcements[0]?.text}</span>
          </div>
          <div className="flex items-center gap-1.5 text-chrome-400">
            <MapPin className="h-3.5 w-3.5 text-gold-500" />
            <span>
              {MOBILE_STATION_BRAND.flagshipLocation.city},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.state} (
              {MOBILE_STATION_BRAND.flagshipLocation.pincode}) · Pan-India Express
            </span>
          </div>
        </div>
      </div>

      {/* Obsidian Brand Header */}
      <header className="sticky top-0 z-header bg-obsidian-900 text-ink-inverse border-b border-obsidian-800 shadow-card">
        <div className="page-container h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all')
              setSelectedBrand('all')
              setSearchQuery('')
            }}
            className="flex items-center gap-2.5 shrink-0"
          >
            <Image
              src={MOBILE_STATION_BRAND.assets.icon}
              alt="MS emblem"
              width={44}
              height={22}
              className="h-7 w-auto object-contain"
              priority
            />
            <Image
              src={MOBILE_STATION_BRAND.assets.wordmark}
              alt="Mobile Station"
              width={210}
              height={24}
              className="h-5 sm:h-6 w-auto object-contain"
              priority
            />
          </button>

          <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 rounded-sm bg-obsidian-800 border border-obsidian-700 px-3 py-2 focus-within:border-gold-500">
            <Search className="h-4 w-4 text-chrome-400 shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search mobiles, audio, laptops and accessories"
              placeholder="Search iPhone 16, Vivo X200, S24 Ultra, Keychron, Sony XM5, Anker..."
              className="w-full bg-transparent text-sm text-ink-inverse placeholder:text-chrome-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="text-chrome-400 hover:text-ink-inverse"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-flex items-center rounded-full border border-obsidian-700 bg-obsidian-800 px-3 py-1 text-xs text-chrome-200">
              {products.length} Sealed Units Ready
            </span>
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-gold-500 px-4 py-2 text-xs font-semibold text-obsidian-950 hover:bg-gold-600 transition"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart ({cartSkus.length})</span>
            </button>
          </div>
        </div>

        {/* Category Mega-Nav Strip */}
        <nav
          aria-label="Primary categories"
          className="bg-obsidian-800 border-t border-obsidian-700/60"
        >
          <div className="page-container flex items-center gap-5 overflow-x-auto no-scrollbar py-2.5 text-xs font-medium text-chrome-200">
            <button
              type="button"
              onClick={() => selectCategory('all')}
              className={`whitespace-nowrap transition-colors ${
                selectedCategory === 'all' ? 'text-gold-500 font-semibold' : 'hover:text-gold-500'
              }`}
            >
              All Tech ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.handle)}
                className={`whitespace-nowrap transition-colors ${
                  selectedCategory === cat.handle
                    ? 'text-gold-500 font-semibold'
                    : 'hover:text-gold-500'
                }`}
              >
                {cat.name} ({categoryCounts[cat.handle] ?? 0})
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Showcase Section with Bespoke Obsidian/Gold Studio Banner Imagery */}
        <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
          <div className="page-container py-10 md:py-14 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-xs font-semibold text-gold-500">
                  <Sparkles className="h-3 w-3" />
                  {activeHero.tag}
                </span>
                {offers[0] && (
                  <span className="rounded-full bg-obsidian-800 border border-obsidian-700 px-3 py-1 font-mono text-[11px] text-chrome-300">
                    Code: <strong className="text-gold-500">{offers[0].code}</strong>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-ink-inverse">
                {activeHero.title}
              </h1>
              <p className="text-base text-chrome-300 max-w-xl">{activeHero.subtitle}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#catalog"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-gold-500 px-6 py-2.5 text-sm font-semibold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
                >
                  {activeHero.cta_text}
                </a>
                <a
                  href="#categories"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-chrome-400/40 bg-obsidian-800 px-5 py-2.5 text-sm font-medium text-ink-inverse hover:border-gold-500 transition"
                >
                  Shop All {categories.length} Categories
                </a>
              </div>

              {/* Hero Slide Switcher */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {heroBanners.map((b, idx) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setHeroIdx(idx)}
                    className={`rounded-sm px-3 py-1.5 text-xs font-medium border transition ${
                      heroIdx === idx
                        ? 'border-gold-500 bg-obsidian-800 text-gold-500'
                        : 'border-obsidian-700 bg-obsidian-950/60 text-chrome-400 hover:text-ink-inverse'
                    }`}
                  >
                    0{idx + 1}. {b.tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              {activeHero.image_url && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-obsidian-950 ms-gold-ring">
                  <Image
                    src={activeHero.image_url}
                    alt={activeHero.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-md bg-obsidian-800 p-3.5 border border-obsidian-700">
                  <p className="font-mono text-[10px] text-gold-500 uppercase">Flagship Store Hub</p>
                  <p className="font-semibold text-ink-inverse mt-0.5">
                    {MOBILE_STATION_BRAND.flagshipLocation.name} ({MOBILE_STATION_BRAND.flagshipLocation.pincode})
                  </p>
                </div>
                <div className="rounded-md bg-obsidian-800 p-3.5 border border-obsidian-700">
                  <p className="font-mono text-[10px] text-gold-500 uppercase">Inventory Guarantee</p>
                  <p className="font-semibold text-ink-inverse mt-0.5">
                    IMEI & Serial Verified + 18% GST Invoice
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Compliance Ribbon */}
        <section className="bg-surface-card border-b border-chrome-200">
          <div className="page-container py-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map((badge) => {
              const Icon = TRUST_ICONS[badge.icon_key] ?? ShieldCheck
              return (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 rounded-md border border-chrome-200 bg-surface-canvas p-4"
                >
                  <div className="rounded-sm bg-obsidian-900 p-2 text-gold-500 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-sm font-bold text-ink-primary">
                      {badge.title}
                    </h2>
                    <p className="text-xs text-ink-muted mt-1">{badge.subtitle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 7-Pillar Electronics Category Showcase with Cloudinary Images & Stock Rules */}
        <section id="categories" className="page-container py-10 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Shop by Electronics Category</h2>
              <p className="text-sm text-ink-muted">
                Organized by product architecture, HSN billing, and IMEI/Serial stock policies
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon] ?? Smartphone
              const isSelected = selectedCategory === cat.handle
              const trackLabel =
                TRACKING_LABELS[cat.inventory_policy?.tracking_mode ?? 'sku_quantity'] ??
                'Hub Stocked'
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(isSelected ? 'all' : cat.handle)}
                  className={`text-left rounded-md border p-3.5 shadow-card hover:shadow-card-hover transition flex flex-col gap-2.5 ${
                    isSelected
                      ? 'border-gold-500 bg-gold-100/40'
                      : 'border-chrome-200 bg-surface-card hover:border-gold-500'
                  }`}
                >
                  {cat.image_url && (
                    <div className="relative h-24 w-full overflow-hidden rounded-xs bg-surface-card border border-chrome-200/70">
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 45vw, 180px"
                        className="object-contain p-1.5"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-xs bg-obsidian-900 text-gold-500">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-mono text-[10px] text-ink-muted">
                      {categoryCounts[cat.handle] ?? 0} SKUs
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-bold leading-snug text-ink-primary">
                      {cat.name}
                    </h3>
                    <p className="font-mono text-[10px] text-gold-700 mt-0.5">
                      {trackLabel} · HSN {cat.default_hsn}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Official Brand Store Filter Bar */}
        <section className="page-container pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
              Official Brand Stores ({brands.length})
            </h2>
            {(selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedBrand('all')
                  setSearchQuery('')
                }}
                className="text-xs font-semibold text-gold-700 hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedBrand('all')}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                selectedBrand === 'all'
                  ? 'border-obsidian-900 bg-obsidian-900 text-ink-inverse'
                  : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
              }`}
            >
              All Brands ({products.length})
            </button>
            {brands.map((brand) => {
              const count = brandCounts[brand.name.toLowerCase()] ?? 0
              if (count === 0) return null
              const active = selectedBrand.toLowerCase() === brand.name.toLowerCase()
              return (
                <button
                  key={brand.handle}
                  type="button"
                  onClick={() => setSelectedBrand(active ? 'all' : brand.name)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                      : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3 text-commerce-savings" />
                  <span>{brand.name}</span>
                  <span className="font-mono text-[10px] opacity-75">({count})</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Live Filtered Catalog Grid */}
        <section id="catalog" className="page-container pb-14 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {selectedCategory === 'all'
                  ? 'Verified Hardware, Smartphones & Accessories'
                  : categories.find((c) => c.handle === selectedCategory)?.name}
              </h2>
              <p className="text-sm text-ink-muted">
                Showing {filteredProducts.length} of {products.length} products · Ready stock at Muzaffarpur Hub & Club Road Center
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-md border border-chrome-200 bg-surface-card p-10 text-center space-y-3">
              <p className="font-display text-lg font-bold text-ink-primary">
                No matching electronics found for your current filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedBrand('all')
                  setSearchQuery('')
                }}
                className="rounded-sm bg-gold-500 px-4 py-2 text-xs font-semibold text-obsidian-950"
              >
                Show All {products.length} Products
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.handle}
                  product={product}
                  onAddToCart={(sku) => setCartSkus((prev) => [...prev, sku])}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-obsidian-950 text-chrome-300 border-t border-obsidian-800 py-8">
        <div className="page-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <p className="font-display font-bold text-ink-inverse">{MOBILE_STATION_BRAND.name}</p>
            <p className="text-chrome-400 mt-1">
              {MOBILE_STATION_BRAND.flagshipLocation.addressLine1},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.city},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.state} –{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.pincode}
            </p>
          </div>
          <p className="text-chrome-400">
            Separated Architecture: Supabase DB · Upstash Redis · Cloudinary CDN · S3/R2 Vault · Meilisearch · Resend · Sentry
          </p>
        </div>
      </footer>
    </div>
  )
}

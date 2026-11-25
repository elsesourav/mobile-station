'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BatteryCharging,
  CheckCircle2,
  FileText,
  Headphones,
  Keyboard,
  Laptop,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Tablet,
} from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import type {
  StorefrontBrand,
  StorefrontCategory,
  StorefrontHeroBanner,
  StorefrontOffer,
  StorefrontProduct,
  StorefrontTrustBadge,
} from '@/lib/catalog'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ProductCard } from '@/components/ProductCard'

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

const SLIDE_TABS = ['01. Mobiles', '02. Laptops', '03. Audio & Gear']

const SHORT_TRACKING_TAG: Record<string, string> = {
  imei_serialized: 'IMEI Sealed',
  serial_tracked: 'Serial',
  sku_quantity: 'Hub Stock',
}

interface CatalogBrowserProps {
  products: StorefrontProduct[]
  categories: StorefrontCategory[]
  brands: StorefrontBrand[]
  heroBanners: StorefrontHeroBanner[]
  trustBadges: StorefrontTrustBadge[]
  offers: StorefrontOffer[]
}

export function CatalogBrowser({
  products,
  categories,
  brands,
  heroBanners,
  trustBadges,
  offers,
}: CatalogBrowserProps) {
  const [heroIdx, setHeroIdx] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllProducts, setShowAllProducts] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialQ = params.get('q')
    if (initialQ) setSearchQuery(initialQ)
  }, [])

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

  const isFiltered =
    selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery.trim().length > 0

  // Show 12 evenly divisible featured products on default landing view unless expanded or filtered
  const visibleProducts =
    isFiltered || showAllProducts ? filteredProducts : filteredProducts.slice(0, 12)

  const handleCategorySelect = (catHandle: string) => {
    setSelectedCategory(catHandle)
    const el = document.getElementById('catalog')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <StorefrontChrome
      activeCategoryHandle={selectedCategory}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onCategorySelect={handleCategorySelect}
    >
      {/* Hero Showcase Section with Bespoke Obsidian/Gold Studio Banner Imagery */}
      <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-8 sm:py-10 md:py-14 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-[11px] font-semibold text-gold-500 whitespace-nowrap">
                <Sparkles className="h-3 w-3 shrink-0" />
                {activeHero.tag}
              </span>
              {offers[0] && (
                <Link
                  href="/offers"
                  className="rounded-full bg-obsidian-800 border border-obsidian-700 px-3 py-1 font-mono text-[11px] text-chrome-300 hover:border-gold-500 transition whitespace-nowrap"
                >
                  Code: <strong className="text-gold-500">{offers[0].code}</strong>
                </Link>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-ink-inverse">
              {activeHero.title}
            </h1>
            <p className="text-sm sm:text-base text-chrome-300 max-w-xl">{activeHero.subtitle}</p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <Link
                href={activeHero.cta_route}
                className="inline-flex min-h-[42px] items-center justify-center rounded-sm bg-gold-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
              >
                {activeHero.cta_text}
              </Link>
              <a
                href="#categories"
                className="inline-flex min-h-[42px] items-center justify-center rounded-sm border border-chrome-400/40 bg-obsidian-800 px-4 py-2.5 text-xs sm:text-sm font-medium text-ink-inverse hover:border-gold-500 transition"
              >
                Shop All {categories.length} Categories
              </a>
            </div>

            {/* Single-Row Compact Hero Slide Switcher across Mobile, Tablet, and Desktop */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1">
              {heroBanners.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setHeroIdx(idx)}
                  className={`rounded-sm px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium border transition whitespace-nowrap ${
                    heroIdx === idx
                      ? 'border-gold-500 bg-obsidian-800 text-gold-500'
                      : 'border-obsidian-700 bg-obsidian-950/60 text-chrome-400 hover:text-ink-inverse'
                  }`}
                >
                  {SLIDE_TABS[idx] ?? `0${idx + 1}. Slide`}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
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
              <Link
                href="/stores/muzaffarpur"
                className="rounded-md bg-obsidian-800 p-3 sm:p-3.5 border border-obsidian-700 hover:border-gold-500 transition"
              >
                <p className="font-mono text-[10px] text-gold-500 uppercase">Flagship Store Hub</p>
                <p className="font-semibold text-ink-inverse mt-0.5">
                  {MOBILE_STATION_BRAND.flagshipLocation.name} (
                  {MOBILE_STATION_BRAND.flagshipLocation.pincode})
                </p>
              </Link>
              <Link
                href="/policies/gst-invoicing"
                className="rounded-md bg-obsidian-800 p-3 sm:p-3.5 border border-obsidian-700 hover:border-gold-500 transition"
              >
                <p className="font-mono text-[10px] text-gold-500 uppercase">Inventory Guarantee</p>
                <p className="font-semibold text-ink-inverse mt-0.5">
                  IMEI & Serial Verified + 18% GST Invoice
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Compliance Ribbon */}
      <section className="bg-surface-card border-b border-chrome-200">
        <div className="page-container py-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {trustBadges.map((badge) => {
            const Icon = TRUST_ICONS[badge.icon_key] ?? ShieldCheck
            return (
              <Link
                key={badge.id}
                href={badge.cta_route}
                className="flex items-start gap-3 rounded-md border border-chrome-200 bg-surface-canvas p-4 hover:border-gold-500 transition"
              >
                <div className="rounded-sm bg-obsidian-900 p-2 text-gold-500 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-bold text-ink-primary">{badge.title}</h2>
                  <p className="text-xs text-ink-muted mt-1">{badge.subtitle}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Zero-Orphan Responsive 7-Category Showcase Grid */}
      <section id="categories" className="page-container py-10 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Shop by Electronics Category</h2>
            <p className="text-sm text-ink-muted">
              Organized by device architecture, HSN billing, and IMEI/Serial stock tracking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat, idx) => {
            const Icon = CATEGORY_ICONS[cat.icon] ?? Smartphone
            const isSelected = selectedCategory === cat.handle
            const trackLabel =
              SHORT_TRACKING_TAG[cat.inventory_policy?.tracking_mode ?? 'sku_quantity'] ??
              'Hub Stock'
            const spanClass = idx === 0 ? 'col-span-2 sm:col-span-2 lg:col-span-1' : 'col-span-1'
            return (
              <div
                key={cat.id}
                className={`${spanClass} rounded-md border p-3 shadow-card hover:shadow-card-hover transition flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-gold-500 bg-gold-100/40'
                    : 'border-chrome-200 bg-surface-card hover:border-gold-500'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleCategorySelect(isSelected ? 'all' : cat.handle)}
                  className="text-left space-y-2.5 w-full"
                >
                  {cat.image_url && (
                    <div className="relative h-24 w-full overflow-hidden rounded-xs bg-surface-card">
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        loading="eager"
                        sizes="(max-width: 640px) 45vw, 180px"
                        className="object-contain p-1"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-1">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-xs bg-obsidian-900 text-gold-500 shrink-0">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-mono text-[10px] text-ink-muted whitespace-nowrap">
                      {categoryCounts[cat.handle] ?? 0} SKUs
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-bold leading-snug text-ink-primary line-clamp-2 min-h-[2rem]">
                      {cat.name}
                    </h3>
                    <p className="font-mono text-[10px] text-gold-700 mt-1 whitespace-nowrap truncate">
                      {trackLabel} · HSN {cat.default_hsn}
                    </p>
                  </div>
                </button>

                <Link
                  href={`/categories/${cat.handle}`}
                  className="font-mono text-[10px] font-semibold text-ink-secondary hover:text-gold-700 border-t border-chrome-200/80 pt-1.5"
                >
                  Open Category →
                </Link>
              </div>
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
          {isFiltered && (
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

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSelectedBrand('all')}
            className={`rounded-full border px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition ${
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
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition ${
                  active
                    ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                    : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
                }`}
              >
                <CheckCircle2 className="h-3 w-3 text-commerce-savings shrink-0" />
                <span>{brand.name}</span>
                <span className="font-mono text-[10px] opacity-75">({count})</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Catalog Product Grid */}
      <section id="catalog" className="page-container pb-14 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {selectedCategory === 'all'
                ? 'Verified Hardware, Smartphones & Accessories'
                : categories.find((c) => c.handle === selectedCategory)?.name}
            </h2>
            <p className="text-sm text-ink-muted">
              Showing {visibleProducts.length} of {filteredProducts.length} matching products · Ready stock at Muzaffarpur Hub & Club Road Center
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <Link
              href={`/categories/${selectedCategory}`}
              className="rounded-sm border border-chrome-300 bg-surface-card px-3 py-1.5 text-xs font-semibold text-ink-primary hover:border-gold-500 transition"
            >
              View Dedicated Category Page →
            </Link>
          )}
        </div>

        {visibleProducts.length === 0 ? (
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
              Show Featured Hardware
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.handle} product={product} />
              ))}
            </div>

            {!isFiltered && !showAllProducts && filteredProducts.length > 12 && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllProducts(true)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-obsidian-900 px-6 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-obsidian-700 transition shadow-card"
                >
                  Show All {filteredProducts.length} Sealed Electronics Products
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </StorefrontChrome>
  )
}

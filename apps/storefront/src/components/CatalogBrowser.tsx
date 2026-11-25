'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BatteryCharging,
  CheckCircle2,
  Headphones,
  Keyboard,
  Laptop,
  ShieldCheck,
  Smartphone,
  Tablet,
} from 'lucide-react'
import type {
  ShowcaseEntryDTO,
  StorefrontBrand,
  StorefrontCategory,
  StorefrontHeroBanner,
  StorefrontOffer,
  StorefrontProduct,
  StorefrontTrustBadge,
} from '@mobile-station/types'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ProductCard } from '@/components/ProductCard'
import { HeroSpotlightSlider } from '@/components/catalog/HeroSpotlightSlider'
import { ShowcaseSpotlightSection } from '@/components/showcase/ShowcaseSpotlightSection'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Keyboard,
  BatteryCharging,
  ShieldCheck,
}

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
  featuredShowcase?: ShowcaseEntryDTO[]
}

export function CatalogBrowser({
  products,
  categories,
  brands,
  heroBanners,
  trustBadges,
  offers,
  featuredShowcase = [],
}: CatalogBrowserProps) {
  const [heroIdx, setHeroIdx] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllProducts, setShowAllProducts] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialQuery = params.get('q')
    if (initialQuery) setSearchQuery(initialQuery)
  }, [])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const product of products) {
      counts[product.category_handle] = (counts[product.category_handle] || 0) + 1
    }
    return counts
  }, [products])

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const product of products) {
      const normalizedBrand = product.metadata.brand.toLowerCase()
      counts[normalizedBrand] = (counts[normalizedBrand] || 0) + 1
    }
    return counts
  }, [products])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()
    return products.filter((product) => {
      if (selectedCategory !== 'all' && product.category_handle !== selectedCategory) return false
      if (
        selectedBrand !== 'all' &&
        product.metadata.brand.toLowerCase() !== selectedBrand.toLowerCase()
      ) {
        return false
      }
      if (!normalizedSearch) return true
      const searchableText = [
        product.title,
        product.subtitle,
        product.description,
        product.metadata.brand,
        product.metadata.model_number,
        product.category_handle,
        ...(product.metadata.key_highlights ?? []),
      ]
        .join(' ')
        .toLowerCase()
      return searchableText.includes(normalizedSearch)
    })
  }, [products, selectedCategory, selectedBrand, searchQuery])

  const isFiltered =
    selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery.trim() !== ''
  const visibleProducts =
    isFiltered || showAllProducts ? filteredProducts : filteredProducts.slice(0, 12)

  const handleCategorySelect = (categoryHandle: string) => {
    setSelectedCategory(categoryHandle)
    const catalogElement = document.getElementById('catalog')
    if (catalogElement) catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <StorefrontChrome
      activeCategoryHandle={selectedCategory}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onCategorySelect={handleCategorySelect}
    >
      <HeroSpotlightSlider
        heroBanners={heroBanners}
        activeHeroIdx={heroIdx}
        onSelectHero={setHeroIdx}
        offers={offers}
        categoryCount={categories.length}
        trustBadges={trustBadges}
      />

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
          {categories.map((category, index) => {
            const Icon = CATEGORY_ICONS[category.icon] ?? Smartphone
            const isSelected = selectedCategory === category.handle
            const trackLabel =
              SHORT_TRACKING_TAG[category.inventory_policy?.tracking_mode ?? 'sku_quantity'] ??
              'Hub Stock'
            const spanClass = index === 0 ? 'col-span-2 sm:col-span-2 lg:col-span-1' : 'col-span-1'
            return (
              <div
                key={category.id}
                className={`${spanClass} rounded-md border p-3 shadow-card hover:shadow-card-hover transition flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-gold-500 bg-gold-100/40'
                    : 'border-chrome-200 bg-surface-card hover:border-gold-500'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleCategorySelect(isSelected ? 'all' : category.handle)}
                  className="text-left space-y-2.5 w-full"
                >
                  {category.image_url && (
                    <div className="relative h-24 w-full overflow-hidden rounded-xs bg-surface-card">
                      <Image
                        src={category.image_url}
                        alt={category.name}
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
                      {categoryCounts[category.handle] ?? 0} SKUs
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-bold leading-snug text-ink-primary line-clamp-2 min-h-[2rem]">
                      {category.name}
                    </h3>
                    <p className="font-mono text-[10px] text-gold-700 mt-1 whitespace-nowrap truncate">
                      {trackLabel} · HSN {category.default_hsn}
                    </p>
                  </div>
                </button>

                <Link
                  href={`/categories/${category.handle}`}
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

        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => {
            const count = brandCounts[brand.name.toLowerCase()] ?? 0
            if (count === 0) return null
            const active = selectedBrand.toLowerCase() === brand.name.toLowerCase()
            return (
              <button
                key={brand.handle}
                type="button"
                onClick={() => setSelectedBrand(active ? 'all' : brand.name)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                    : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-commerce-savings" />
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
                : categories.find((category) => category.handle === selectedCategory)?.name}
            </h2>
            <p className="text-sm text-ink-muted">
              Showing {visibleProducts.length} of {filteredProducts.length} matching products · Ready
              stock at Muzaffarpur Hub &amp; Club Road Center
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

      <div className="border-t border-chrome-200 bg-surface-muted/40">
        <ShowcaseSpotlightSection
          title="Verified Video Feedback & Muzaffarpur Store Visits"
          subtitle="Real open-box IMEI inspections, buyer unboxings, and Motijheel (842001) & Club Road (842002) desk experiences uploaded by our hub team."
          badgeLabel="Community & Hub Proof"
          badgeKind="feedback"
          items={featuredShowcase}
          primaryHref="/feedback"
          primaryLabel="Watch Customer Video Feedback"
          secondaryHref="/gallery"
          secondaryLabel="Explore Store Visit Gallery"
        />
      </div>
    </StorefrontChrome>
  )
}

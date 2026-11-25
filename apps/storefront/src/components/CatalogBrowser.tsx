'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import type {
  ShowcaseEntryDTO,
  ShowcaseSummaryStats,
  StorefrontBrand,
  StorefrontCategory,
  StorefrontHeroBanner,
  StorefrontProduct,
} from '@mobile-station/types'
import { sortProductsByRecency } from '@/lib/catalog'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { HeroSpotlightSlider } from '@/components/catalog/HeroSpotlightSlider'
import { MinimalProductCard } from '@/components/catalog/MinimalProductCard'
import { CategoryProductRail } from '@/components/catalog/CategoryProductRail'
import { RecentProductsLazyGrid } from '@/components/catalog/RecentProductsLazyGrid'
import { CleanFeedbackSection } from '@/components/showcase/CleanFeedbackSection'

interface CatalogBrowserProps {
  products: StorefrontProduct[]
  categories: StorefrontCategory[]
  brands: StorefrontBrand[]
  heroBanners: StorefrontHeroBanner[]
  featuredShowcase?: ShowcaseEntryDTO[]
  showcaseStats?: ShowcaseSummaryStats
}

export function CatalogBrowser({
  products,
  categories,
  brands,
  heroBanners,
  featuredShowcase = [],
  showcaseStats,
}: CatalogBrowserProps) {
  const [heroIdx, setHeroIdx] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialQuery = params.get('q')
    if (initialQuery) setSearchQuery(initialQuery)
  }, [])

  const recentProducts = useMemo(() => sortProductsByRecency(products), [products])

  const productsByCategory = useMemo(() => {
    const map = new Map<string, StorefrontProduct[]>()
    for (const product of recentProducts) {
      const list = map.get(product.category_handle) ?? []
      if (list.length < 10) {
        list.push(product)
        map.set(product.category_handle, list)
      }
    }
    return map
  }, [recentProducts])

  const categoryProducts = useMemo(() => {
    if (selectedCategory === 'all') return recentProducts
    return recentProducts.filter((product) => product.category_handle === selectedCategory)
  }, [recentProducts, selectedCategory])

  const availableCategoryBrands = useMemo(() => {
    if (selectedCategory === 'all') return []
    const counts = new Map<string, { name: string; count: number }>()
    for (const product of categoryProducts) {
      const rawBrand = product.metadata.brand.trim()
      const key = rawBrand.toLowerCase()
      const existing = counts.get(key)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(key, { name: rawBrand, count: 1 })
      }
    }

    const ordered: { handle: string; name: string; count: number }[] = []
    for (const brand of brands) {
      const entry = counts.get(brand.name.toLowerCase())
      if (entry) {
        ordered.push({ handle: brand.handle, name: brand.name, count: entry.count })
        counts.delete(brand.name.toLowerCase())
      }
    }
    for (const [key, entry] of counts.entries()) {
      ordered.push({ handle: key, name: entry.name, count: entry.count })
    }
    return ordered
  }, [selectedCategory, categoryProducts, brands])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()
    return categoryProducts.filter((product) => {
      if (
        selectedCategory !== 'all' &&
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
  }, [categoryProducts, selectedCategory, selectedBrand, searchQuery])

  const isFiltered =
    selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery.trim() !== ''

  const handleCategorySelect = (categoryHandle: string) => {
    setSelectedCategory(categoryHandle)
    setSelectedBrand('all')
    const targetId = categoryHandle === 'all' ? 'categories' : 'catalog'
    const targetElement = document.getElementById(targetId)
    if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <StorefrontChrome
      activeCategoryHandle={selectedCategory}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onCategorySelect={handleCategorySelect}
    >
      <h1 className="sr-only">
        Mobile Station — Genuine Electronics, Smartphones, Laptops &amp; Tech Accessories
      </h1>

      <HeroSpotlightSlider
        heroBanners={heroBanners}
        activeHeroIdx={heroIdx}
        onSelectHero={setHeroIdx}
      />

      {/* Responsive 2-Row x 4-Column Category Showcase Grid */}
      <section id="categories" className="page-container scroll-mt-28 pt-6 pb-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Shop by Electronics Category
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Smartphones, tablets, laptops, audio, peripherals, power &amp; everyday gear
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.handle
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(isSelected ? 'all' : category.handle)}
                className={`group rounded-md border p-4 sm:p-5 text-center shadow-card hover:shadow-card-hover transition flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-gold-500 bg-gold-100/40 ring-1 ring-gold-500/30'
                    : 'border-chrome-200 bg-surface-card hover:border-gold-500'
                }`}
              >
                {category.image_url && (
                  <div className="relative h-32 sm:h-40 w-full overflow-hidden rounded-sm bg-surface-card">
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      loading="eager"
                      sizes="(max-width: 1024px) 46vw, 280px"
                      className="object-contain p-2.5 sm:p-3 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <h3 className="font-display text-sm sm:text-base font-bold leading-snug text-ink-primary group-hover:text-gold-700 transition-colors line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                  {category.name}
                </h3>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => handleCategorySelect('all')}
            className="group rounded-md border border-chrome-200 bg-surface-card hover:border-gold-500 p-4 sm:p-5 text-center shadow-card hover:shadow-card-hover transition flex flex-col justify-between gap-3"
          >
            <div className="h-32 sm:h-40 w-full overflow-hidden rounded-sm bg-surface-card p-1.5 grid grid-cols-2 gap-1.5">
              {categories.slice(0, 4).map((previewCat) => (
                <div
                  key={previewCat.id}
                  className="relative w-full h-full rounded-xs border border-chrome-200/60 bg-surface-card overflow-hidden"
                >
                  {previewCat.image_url && (
                    <Image
                      src={previewCat.image_url}
                      alt={previewCat.name}
                      fill
                      loading="eager"
                      sizes="(max-width: 1024px) 22vw, 130px"
                      className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
              ))}
            </div>

            <h3 className="font-display text-sm sm:text-base font-bold leading-snug text-ink-primary group-hover:text-gold-700 transition-colors line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
              All Tech &amp; Hardware
            </h3>
          </button>
        </div>
      </section>

      {isFiltered ? (
        <>
          {/* Available Brand Filter Bar (Shown Only Inside a Selected Category) */}
          {selectedCategory !== 'all' && availableCategoryBrands.length > 0 && (
            <section className="page-container pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
                  Available Brands ({availableCategoryBrands.length})
                </h2>
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
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBrand('all')}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selectedBrand === 'all'
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                      : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
                  }`}
                >
                  <span>All Brands</span>
                </button>
                {availableCategoryBrands.map((brand) => {
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
                      <span className="font-mono text-[10px] opacity-75">({brand.count})</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Filtered Catalog Grid */}
          <section id="catalog" className="page-container scroll-mt-28 pb-12 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {selectedCategory === 'all'
                    ? 'Search Results'
                    : categories.find((category) => category.handle === selectedCategory)?.name}
                </h2>
                <p className="text-sm text-ink-muted">
                  Showing {filteredProducts.length} matching products
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory !== 'all' && (
                  <Link
                    href={`/categories/${selectedCategory}`}
                    className="rounded-sm border border-chrome-300 bg-surface-card px-3 py-1.5 text-xs font-semibold text-ink-primary hover:border-gold-500 transition"
                  >
                    View Dedicated Category Page →
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedBrand('all')
                    setSearchQuery('')
                  }}
                  className="rounded-sm bg-obsidian-900 px-3 py-1.5 text-xs font-semibold text-gold-500 hover:bg-obsidian-800 transition"
                >
                  Show All Categories
                </button>
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
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <MinimalProductCard key={product.handle} product={product} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {/* Per-Category Horizontal Rails (Max 10 Recent Products Each) */}
          <div id="catalog" className="scroll-mt-28 divide-y divide-chrome-200/70">
            {categories.map((category) => (
              <CategoryProductRail
                key={category.id}
                category={category}
                products={productsByCategory.get(category.handle) ?? []}
              />
            ))}
          </div>

          {/* Lazy-Loading Recent 30 Products Revealed One by One */}
          <RecentProductsLazyGrid products={recentProducts} maxProducts={30} />
        </>
      )}

      {/* Cleanest Bottom Customer Reviews & Video Feedback Section */}
      <CleanFeedbackSection items={featuredShowcase} stats={showcaseStats} />
    </StorefrontChrome>
  )
}

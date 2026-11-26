'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type {
  ShowcaseEntryDTO,
  ShowcaseSummaryStats,
  StorefrontBrand,
  StorefrontCategory,
  StorefrontHeroBanner,
  StorefrontProduct,
} from '@mobile-station/types'
import { getCategoryRoute, sortProductsByRecency } from '@/lib/catalog'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { HeroSpotlightSlider } from '@/components/catalog/HeroSpotlightSlider'
import { MinimalProductCard } from '@/components/catalog/MinimalProductCard'
import { CategoryProductRail } from '@/components/catalog/CategoryProductRail'
import { RecentProductsLazyGrid } from '@/components/catalog/RecentProductsLazyGrid'
import { CleanFeedbackSection } from '@/components/showcase/CleanFeedbackSection'
import { RecentlyViewedSection } from '@/components/recommendations/RecentlyViewedSection'
import { PersonalizedHomeSection } from '@/components/recommendations/PersonalizedHomeSection'

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
  heroBanners,
  featuredShowcase = [],
  showcaseStats,
}: CatalogBrowserProps) {
  const [heroIdx, setHeroIdx] = useState(0)
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

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()
    if (!normalizedSearch) return recentProducts
    return recentProducts.filter((product) => {
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
  }, [recentProducts, searchQuery])

  const isSearching = searchQuery.trim() !== ''

  const scrollToCatalog = () => {
    setSearchQuery('')
    const catalogElement = document.getElementById('catalog')
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <StorefrontChrome
      activeCategoryHandle="all"
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <h1 className="sr-only">
        Mobile Station — Genuine Electronics, Smartphones, Laptops &amp; Tech Accessories
      </h1>

      <HeroSpotlightSlider
        heroBanners={heroBanners}
        activeHeroIdx={heroIdx}
        onSelectHero={setHeroIdx}
      />

      {/* Responsive Category Route Grid (Each Category Opens Its Dedicated Route) */}
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
          {categories.map((category) => (
            <Link
              key={category.id}
              href={getCategoryRoute(category.handle)}
              className="group rounded-md border border-chrome-200 bg-surface-card hover:border-gold-500 p-4 sm:p-5 text-center shadow-card hover:shadow-card-hover transition flex flex-col justify-between gap-3"
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
            </Link>
          ))}

          <button
            type="button"
            onClick={scrollToCatalog}
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

      {isSearching ? (
        <section id="catalog" className="page-container scroll-mt-28 pb-12 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Search Results</h2>
              <p className="text-sm text-ink-muted">
                Showing {filteredProducts.length} matching products
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                className="rounded-sm border border-chrome-300 bg-surface-card px-3 py-1.5 text-xs font-semibold text-ink-primary hover:border-gold-500 transition"
              >
                Open Full Search Filters →
              </Link>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-sm bg-obsidian-900 px-3 py-1.5 text-xs font-semibold text-gold-500 hover:bg-obsidian-800 transition"
              >
                Clear Search
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-md border border-chrome-200 bg-surface-card p-10 text-center space-y-3">
              <p className="font-display text-lg font-bold text-ink-primary">
                No matching electronics found for your current search.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-sm bg-gold-500 px-4 py-2 text-xs font-semibold text-obsidian-950"
              >
                Show All Electronics
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
      ) : (
        <>
          <RecentlyViewedSection products={products} />

          <PersonalizedHomeSection products={products} />

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

          {/* Lazy-Loading Recent Products (50 on Mobile/Tablet, 100 on Desktop) Revealed One by One */}
          <RecentProductsLazyGrid products={recentProducts} />
        </>
      )}

      {/* Cleanest Bottom Customer Reviews & Video Feedback Section */}
      <CleanFeedbackSection items={featuredShowcase} stats={showcaseStats} />
    </StorefrontChrome>
  )
}

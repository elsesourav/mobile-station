'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import type { StorefrontCategory, StorefrontProduct } from '@mobile-station/types'
import { getCategoryRoute } from '@/lib/catalog'
import { MinimalProductCard } from '@/components/catalog/MinimalProductCard'
import { CategoryIcon } from '@/components/icons/CategoryIcons'
import type {
  CategoryActiveFilterChip,
  CategoryExperienceProfile,
  CategoryFacetGroup,
  CategoryFacetOption,
  CategoryFilterState,
  CategorySortOption,
} from '@/types/category'
import { CategoryFilterSidebar } from './CategoryFilterSidebar'

interface CategoryProductWorkspaceProps {
  category: StorefrontCategory
  experience: CategoryExperienceProfile
  allProductsCount: number
  filteredProducts: StorefrontProduct[]
  state: CategoryFilterState
  brandOptions: CategoryFacetOption[]
  priceBandCounts: Record<string, number>
  subcategoryCounts: Record<string, number>
  facetGroups: CategoryFacetGroup[]
  activeChips: CategoryActiveFilterChip[]
  pairingCategories: StorefrontCategory[]
  pairingProducts: StorefrontProduct[]
  isMobileFiltersOpen: boolean
  onOpenMobileFilters: () => void
  onCloseMobileFilters: () => void
  onChangeSearch: (q: string) => void
  onSelectSingleSubcategory: (subHandle: string | 'all') => void
  onToggleSubcategory: (subHandle: string) => void
  onToggleBrand: (brandName: string) => void
  onTogglePriceBand: (bandId: string) => void
  onToggleSpecValue: (specKey: string, value: string) => void
  onToggleBooleanFlag: (
    flag: 'inStockOnly' | 'discountOnly' | 'openBoxOnly' | 'emiOnly'
  ) => void
  onChangeSort: (sort: CategorySortOption) => void
  onRemoveChip: (chip: CategoryActiveFilterChip) => void
  onResetAll: () => void
}

const SORT_LABELS: { value: CategorySortOption; label: string }[] = [
  { value: 'featured', label: 'Featured & Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount_desc', label: 'Biggest Discount %' },
  { value: 'newest', label: 'Newest Arrivals' },
]

export function CategoryProductWorkspace({
  category,
  experience,
  allProductsCount,
  filteredProducts,
  state,
  brandOptions,
  priceBandCounts,
  subcategoryCounts,
  facetGroups,
  activeChips,
  pairingCategories,
  pairingProducts,
  isMobileFiltersOpen,
  onOpenMobileFilters,
  onCloseMobileFilters,
  onChangeSearch,
  onSelectSingleSubcategory,
  onToggleSubcategory,
  onToggleBrand,
  onTogglePriceBand,
  onToggleSpecValue,
  onToggleBooleanFlag,
  onChangeSort,
  onRemoveChip,
  onResetAll,
}: CategoryProductWorkspaceProps) {
  const activeCount = activeChips.length

  const sharedSidebarProps = {
    category,
    experience,
    state,
    brandOptions,
    priceBandCounts,
    subcategoryCounts,
    facetGroups,
    activeFilterCount: activeCount,
    onChangeSearch,
    onToggleSubcategory,
    onToggleBrand,
    onTogglePriceBand,
    onToggleSpecValue,
    onToggleBooleanFlag,
    onResetAll,
  }

  return (
    <>
      <section
        aria-label={`All ${category.name}`}
        className="page-container py-5 sm:py-6 space-y-5"
      >
        {/* Subcategory Switcher (Wraps cleanly on desktop, swipeable without scrollbar on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto lg:overflow-visible lg:flex-wrap pb-1 lg:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectSingleSubcategory('all')}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              state.selectedSubcategories.length === 0
                ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
            }`}
          >
            All {category.name} ({allProductsCount})
          </button>
          {category.subcategories.map((sub) => {
            const count = subcategoryCounts[sub.handle] ?? 0
            if (count === 0) return null
            const active =
              state.selectedSubcategories.length === 1 &&
              state.selectedSubcategories[0] === sub.handle
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSingleSubcategory(active ? 'all' : sub.handle)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-obsidian-900 bg-obsidian-900 text-gold-500 font-semibold'
                    : 'border-chrome-200 bg-surface-card text-ink-secondary hover:border-gold-500 hover:text-ink-primary'
                }`}
              >
                {sub.name} ({count})
              </button>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Sticky Filter Rail */}
          <aside
            aria-label={`${category.name} filters`}
            className="hidden lg:block lg:col-span-3 sticky top-36 rounded-md border border-chrome-200 bg-surface-card p-4 shadow-card max-h-[calc(100vh-160px)] overflow-y-auto"
          >
            <CategoryFilterSidebar {...sharedSidebarProps} />
          </aside>

          {/* Main Product Workspace */}
          <div className="lg:col-span-9 space-y-4 min-w-0">
            {/* Results Toolbar + Mobile Filters Trigger + Sort */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-chrome-200 bg-surface-card px-3.5 py-2.5 shadow-card">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={onOpenMobileFilters}
                  className="lg:hidden inline-flex items-center gap-1.5 rounded-sm bg-obsidian-900 px-3 py-1.5 text-xs font-semibold text-gold-500 shrink-0"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filters</span>
                  {activeCount > 0 && (
                    <span className="rounded-full bg-gold-500 px-1.5 py-0.5 font-mono text-[10px] font-bold text-obsidian-950">
                      {activeCount}
                    </span>
                  )}
                </button>
                <p className="text-xs sm:text-sm font-medium text-ink-secondary truncate tabular-nums">
                  Showing <strong className="text-ink-primary">{filteredProducts.length}</strong> of{' '}
                  {allProductsCount} items
                </p>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <label htmlFor="category-sort-select" className="text-xs text-ink-muted hidden sm:inline">
                  Sort by:
                </label>
                <select
                  id="category-sort-select"
                  value={state.sortBy}
                  onChange={(e) => onChangeSort(e.target.value as CategorySortOption)}
                  className="rounded-sm border border-chrome-300 bg-surface-card px-2.5 py-1.5 text-xs font-semibold text-ink-primary focus:border-gold-500 focus:outline-none"
                >
                  {SORT_LABELS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Removable Filter Chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={`${chip.groupKey}-${chip.specKey ?? ''}-${chip.value}`}
                    type="button"
                    onClick={() => onRemoveChip(chip)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-obsidian-900/20 bg-gold-100/70 px-3 py-1 text-xs font-semibold text-ink-primary hover:border-obsidian-900 transition"
                  >
                    <span>{chip.label}</span>
                    <X className="h-3 w-3 text-ink-muted" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onResetAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline px-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear All</span>
                </button>
              </div>
            )}

            {/* Filtered Grid or Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-md border border-chrome-200 bg-surface-card p-8 sm:p-12 text-center space-y-3 shadow-card">
                <p className="font-display text-lg font-bold text-ink-primary">
                  No matching {category.name.toLowerCase()} found for those exact filters
                </p>
                <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
                  Try removing one specification or budget filter to explore all verified options in {category.name}.
                </p>
                <button
                  type="button"
                  onClick={onResetAll}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-semibold text-gold-500 hover:bg-obsidian-800 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Category Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <MinimalProductCard key={product.handle} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category-Specific Compatible Pairings & Sibling Routes */}
        {pairingProducts.length > 0 && (
          <div className="border-t border-chrome-200 pt-8 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-primary">
                  {experience.pairingTitle}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                  {experience.pairingSubtitle}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {pairingCategories.map((sibCat) => (
                  <Link
                    key={sibCat.id}
                    href={getCategoryRoute(sibCat.handle)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-chrome-300 bg-surface-card px-3 py-1.5 text-xs font-semibold text-ink-primary hover:border-gold-500 hover:text-gold-700 transition"
                  >
                    <CategoryIcon
                      name={sibCat.name}
                      handle={sibCat.handle}
                      iconKey={sibCat.icon}
                      className="h-3.5 w-3.5 text-gold-700 shrink-0"
                    />
                    <span>{sibCat.name}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {pairingProducts.map((product) => (
                <MinimalProductCard key={product.handle} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Mobile & Tablet Filter Drawer */}
      {isMobileFiltersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Filter ${category.name}`}
          className="fixed inset-0 z-modal lg:hidden flex justify-end"
        >
          <div
            onClick={onCloseMobileFilters}
            className="fixed inset-0 bg-obsidian-950/70 backdrop-blur-xs"
          />
          <div className="relative z-10 w-[88%] max-w-[360px] h-full bg-surface-canvas border-l border-chrome-200 shadow-modal flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <CategoryFilterSidebar
                {...sharedSidebarProps}
                onCloseDrawer={onCloseMobileFilters}
              />
            </div>
            <div className="border-t border-chrome-200 bg-surface-card p-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onResetAll}
                className="flex-1 rounded-sm border border-chrome-300 bg-surface-card py-2.5 text-xs font-semibold text-ink-primary"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={onCloseMobileFilters}
                className="flex-[2] rounded-sm bg-obsidian-900 py-2.5 text-xs font-bold text-gold-500"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

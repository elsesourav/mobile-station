'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import type { StorefrontCategory, StorefrontProduct } from '@mobile-station/types'
import {
  applyCategoryQuickPreset,
  filterAndSortCategoryProducts,
  isPresetActive,
} from '@/lib/category-filters'
import { CategoryIcon } from '@/components/icons/CategoryIcons'
import type {
  CategoryExperienceProfile,
  CategoryFilterState,
  CategoryQuickPreset,
} from '@/types/category'

interface CategoryTierBarProps {
  category: StorefrontCategory
  products: StorefrontProduct[]
  experience: CategoryExperienceProfile
  filterState: CategoryFilterState
  onSelectPreset: (preset: CategoryQuickPreset) => void
  onResetAll: () => void
}

/**
 * Clean visual segment/tier bar displayed at the top of every category page
 * (e.g., Flagship, Mid-Range, 12GB+ RAM, 120Hz Display) with miniature previews
 * and live item counts so shoppers orient immediately without heavy text blocks.
 */
export function CategoryTierBar({
  category,
  products,
  experience,
  filterState,
  onSelectPreset,
  onResetAll,
}: CategoryTierBarProps) {
  const hasAnyActiveFilter =
    filterState.selectedSubcategories.length > 0 ||
    filterState.selectedBrands.length > 0 ||
    filterState.selectedPriceBands.length > 0 ||
    Object.values(filterState.selectedSpecs).some((vals) => vals.length > 0) ||
    filterState.inStockOnly ||
    filterState.discountOnly ||
    filterState.openBoxOnly ||
    filterState.emiOnly ||
    filterState.searchQuery.trim() !== ''

  const segmentTiles = useMemo(() => {
    const usedThumbnails = new Set<string>()
    return experience.quickPresets
      .map((preset) => {
        const matched = filterAndSortCategoryProducts(
          products,
          experience,
          applyCategoryQuickPreset(preset)
        )
        const distinct = matched.find(
          (item) => item.thumbnail && !usedThumbnails.has(item.thumbnail)
        )
        const thumbnail = distinct?.thumbnail ?? matched[0]?.thumbnail ?? category.image_url
        if (thumbnail) usedThumbnails.add(thumbnail)
        return {
          preset,
          count: matched.length,
          thumbnail,
        }
      })
      .filter((entry) => entry.count > 0)
  }, [products, experience, category.image_url])

  if (segmentTiles.length === 0) return null

  return (
    <section
      aria-label={`${category.name} segments`}
      className="border-b border-chrome-200/80 bg-surface-card"
    >
      <div className="page-container py-3 sm:py-3.5">
        <div className="flex items-stretch gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={onResetAll}
            aria-pressed={!hasAnyActiveFilter}
            className={`shrink-0 inline-flex items-center gap-2.5 rounded-md border px-2.5 py-1.5 sm:px-3 sm:py-2 text-left transition ${
              !hasAnyActiveFilter
                ? 'border-obsidian-900 bg-obsidian-900 text-gold-500 shadow-card'
                : 'border-chrome-200 bg-surface-canvas text-ink-primary hover:border-gold-500'
            }`}
          >
            <span
              className={`inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-sm shrink-0 ${
                !hasAnyActiveFilter
                  ? 'bg-obsidian-800 text-gold-500'
                  : 'bg-surface-card border border-chrome-200 text-ink-primary'
              }`}
            >
              <CategoryIcon
                name={category.name}
                handle={category.handle}
                iconKey={category.icon}
                className="h-4 w-4"
              />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xs sm:text-[13px] font-bold whitespace-nowrap leading-tight">
                All Models
              </span>
              <span
                className={`block font-mono text-[10px] tabular-nums leading-tight mt-0.5 ${
                  !hasAnyActiveFilter ? 'text-chrome-300' : 'text-ink-muted'
                }`}
              >
                {products.length} items
              </span>
            </span>
          </button>

          {segmentTiles.map(({ preset, count, thumbnail }) => {
            const active = isPresetActive(preset, filterState)
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => (active ? onResetAll() : onSelectPreset(preset))}
                aria-pressed={active}
                className={`shrink-0 inline-flex items-center gap-2.5 rounded-md border px-2.5 py-1.5 sm:px-3 sm:py-2 text-left transition ${
                  active
                    ? 'border-obsidian-900 bg-obsidian-900 text-gold-500 shadow-card'
                    : 'border-chrome-200 bg-surface-canvas text-ink-primary hover:border-gold-500'
                }`}
              >
                {thumbnail && (
                  <span className="relative h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-sm bg-surface-card border border-chrome-200/70 shrink-0">
                    <Image
                      src={thumbnail}
                      alt={preset.label}
                      fill
                      loading="eager"
                      sizes="36px"
                      className="object-contain p-0.5"
                    />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-display text-xs sm:text-[13px] font-bold whitespace-nowrap leading-tight">
                    {preset.label}
                  </span>
                  <span
                    className={`block font-mono text-[10px] tabular-nums leading-tight mt-0.5 ${
                      active ? 'text-chrome-300' : 'text-ink-muted'
                    }`}
                  >
                    {count} items
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

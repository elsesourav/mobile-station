'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Box, ShieldCheck, Sparkles } from 'lucide-react'
import type { StorefrontCategory } from '@mobile-station/types'
import { formatINR } from '@/lib/format'
import { CategoryIcon } from '@/components/icons/CategoryIcons'
import type {
  CategoryExperienceProfile,
  CategoryFilterState,
  CategoryQuickPreset,
} from '@/types/category'
import { isPresetActive } from '@/lib/category-filters'

interface CategoryHeroSectionProps {
  category: StorefrontCategory
  experience: CategoryExperienceProfile
  totalCount: number
  brandCount: number
  lowestPricePaise: number
  filterState: CategoryFilterState
  onApplyPreset: (preset: CategoryQuickPreset) => void
  onResetFilters: () => void
}

export function CategoryHeroSection({
  category,
  experience,
  totalCount,
  brandCount,
  lowestPricePaise,
  filterState,
  onApplyPreset,
  onResetFilters,
}: CategoryHeroSectionProps) {
  const returnDays = category.inventory_policy?.return_window_days ?? 7
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

  return (
    <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
      <div className="page-container py-6 sm:py-9 space-y-6">
        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-chrome-300">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-medium text-chrome-300 hover:text-gold-500 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span className="text-chrome-400/50">/</span>
              <span className="font-semibold text-gold-500 truncate">{category.name}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-semibold text-gold-500 uppercase tracking-wider">
                <CategoryIcon
                  name={category.name}
                  handle={category.handle}
                  iconKey={category.icon}
                  className="h-3.5 w-3.5 shrink-0"
                />
                <span>{experience.eyebrow}</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink-inverse leading-tight">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-chrome-300 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5 text-[11px]">
              <span className="inline-flex items-center gap-1.5 rounded-md sm:rounded-full bg-obsidian-800 border border-obsidian-700 px-3 py-1 font-mono text-gold-500">
                HSN {category.default_hsn} · {category.gst_rate_percent}% GST
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md sm:rounded-full bg-obsidian-800 border border-obsidian-700 px-3 py-1 text-chrome-200 tabular-nums">
                <ShieldCheck className="h-3.5 w-3.5 text-commerce-savings shrink-0" />
                <span>
                  {totalCount} Models · {brandCount} Brands
                </span>
              </span>
              {lowestPricePaise > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-md sm:rounded-full bg-obsidian-800 border border-obsidian-700 px-3 py-1 text-chrome-200 tabular-nums">
                  <Box className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                  <span>
                    Starting {formatINR(lowestPricePaise)} · {returnDays}-Day Replacement
                  </span>
                </span>
              )}
            </div>
          </div>

          {category.image_url && (
            <div className="md:col-span-4">
              <div className="relative h-36 sm:h-44 w-full overflow-hidden rounded-lg bg-surface-card ms-gold-ring">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 340px"
                  className="object-contain p-3"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category-Specific Buyer Assurance Cards */}
        <div className="grid sm:grid-cols-3 gap-2.5 sm:gap-3">
          {experience.buyerAssurances.map((assurance) => (
            <div
              key={assurance.title}
              className="rounded-md border border-obsidian-700/90 bg-obsidian-800/70 px-3.5 py-2.5 space-y-0.5"
            >
              <p className="font-display text-xs font-bold text-gold-500">{assurance.title}</p>
              <p className="text-[11px] text-chrome-300 leading-snug">{assurance.detail}</p>
            </div>
          ))}
        </div>

        {/* Curated Quick-Intent Shortcuts for This Category */}
        {experience.quickPresets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-chrome-400 mr-1">
              <Sparkles className="h-3 w-3 text-gold-500" />
              <span>Quick Picks:</span>
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                !hasAnyActiveFilter
                  ? 'border-gold-500 bg-gold-500 text-obsidian-950'
                  : 'border-obsidian-700 bg-obsidian-800 text-chrome-200 hover:border-gold-500'
              }`}
            >
              All {category.name}
            </button>
            {experience.quickPresets.map((preset) => {
              const active = isPresetActive(preset, filterState)
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => (active ? onResetFilters() : onApplyPreset(preset))}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? 'border-gold-500 bg-gold-500 text-obsidian-950'
                      : 'border-obsidian-700 bg-obsidian-800 text-chrome-200 hover:border-gold-500 hover:text-gold-500'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

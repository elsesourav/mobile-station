'use client'

import React, { useState } from 'react'
import { Check, ChevronDown, ChevronUp, RotateCcw, Search, X } from 'lucide-react'
import type { StorefrontCategory } from '@mobile-station/types'
import type {
  CategoryExperienceProfile,
  CategoryFacetGroup,
  CategoryFacetOption,
  CategoryFilterState,
} from '@/types/category'

interface CategoryFilterSidebarProps {
  category: StorefrontCategory
  experience: CategoryExperienceProfile
  state: CategoryFilterState
  brandOptions: CategoryFacetOption[]
  priceBandCounts: Record<string, number>
  subcategoryCounts: Record<string, number>
  facetGroups: CategoryFacetGroup[]
  activeFilterCount: number
  onChangeSearch: (q: string) => void
  onToggleSubcategory: (subHandle: string) => void
  onToggleBrand: (brandName: string) => void
  onTogglePriceBand: (bandId: string) => void
  onToggleSpecValue: (specKey: string, value: string) => void
  onToggleBooleanFlag: (
    flag: 'inStockOnly' | 'discountOnly' | 'openBoxOnly' | 'emiOnly'
  ) => void
  onResetAll: () => void
  onCloseDrawer?: () => void
}

function FilterAccordion({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-chrome-200/80 py-3.5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left text-xs font-display font-bold uppercase tracking-wider text-ink-primary hover:text-gold-700 transition"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-ink-muted shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-muted shrink-0" />
        )}
      </button>
      {open && <div className="mt-3 space-y-1.5">{children}</div>}
    </div>
  )
}

function FilterCheckboxRow({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string
  count?: number
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`w-full flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition ${
        checked
          ? 'bg-obsidian-900 text-gold-500 font-semibold'
          : 'text-ink-secondary hover:bg-surface-muted hover:text-ink-primary'
      }`}
    >
      <span className="flex items-center gap-2 min-w-0">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-xs border shrink-0 transition ${
            checked
              ? 'border-gold-500 bg-gold-500 text-obsidian-950'
              : 'border-chrome-300 bg-surface-card'
          }`}
        >
          {checked && <Check className="h-3 w-3 stroke-[3]" />}
        </span>
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined && (
        <span
          className={`font-mono text-[10px] shrink-0 tabular-nums ${
            checked ? 'text-gold-500/90' : 'text-ink-muted'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

export function CategoryFilterSidebar({
  category,
  experience,
  state,
  brandOptions,
  priceBandCounts,
  subcategoryCounts,
  facetGroups,
  activeFilterCount,
  onChangeSearch,
  onToggleSubcategory,
  onToggleBrand,
  onTogglePriceBand,
  onToggleSpecValue,
  onToggleBooleanFlag,
  onResetAll,
  onCloseDrawer,
}: CategoryFilterSidebarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-chrome-200">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-sm font-bold text-ink-primary">
            Filter {category.name}
          </h2>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-gold-500 px-2 py-0.5 font-mono text-[10px] font-bold text-obsidian-950">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetAll}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-700 hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
          {onCloseDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              aria-label="Close filters"
              className="rounded-full p-1 text-ink-muted hover:bg-surface-muted hover:text-ink-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category-Scoped Text Search */}
      <div className="pt-1 pb-2 border-b border-chrome-200/80">
        <label htmlFor="category-filter-search" className="sr-only">
          Search inside {category.name}
        </label>
        <div className="relative flex items-center">
          <Search className="h-3.5 w-3.5 text-ink-muted absolute left-2.5 pointer-events-none" />
          <input
            id="category-filter-search"
            type="text"
            value={state.searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder={experience.searchPlaceholder}
            className="w-full rounded-sm border border-chrome-300 bg-surface-card pl-8 pr-7 py-1.5 text-xs text-ink-primary placeholder:text-ink-muted focus:border-gold-500 focus:outline-none"
          />
          {state.searchQuery && (
            <button
              type="button"
              onClick={() => onChangeSearch('')}
              aria-label="Clear search inside category"
              className="absolute right-2 text-ink-muted hover:text-ink-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Price Budgets */}
      <FilterAccordion title="Budget & Price (INR)" defaultOpen>
        {experience.priceBands.map((band) => {
          const count = priceBandCounts[band.id] ?? 0
          const checked = state.selectedPriceBands.includes(band.id)
          if (count === 0 && !checked) return null
          return (
            <FilterCheckboxRow
              key={band.id}
              label={band.label}
              count={count}
              checked={checked}
              onToggle={() => onTogglePriceBand(band.id)}
            />
          )
        })}
      </FilterAccordion>

      {/* Brands */}
      {brandOptions.length > 0 && (
        <FilterAccordion title="Authorized Brands" defaultOpen>
          {brandOptions.map((brand) => {
            const checked = state.selectedBrands.some(
              (b) => b.toLowerCase() === brand.value.toLowerCase()
            )
            return (
              <FilterCheckboxRow
                key={brand.value}
                label={brand.label}
                count={brand.count}
                checked={checked}
                onToggle={() => onToggleBrand(brand.value)}
              />
            )
          })}
        </FilterAccordion>
      )}

      {/* Subcategories inside sidebar for multi-select power */}
      {category.subcategories.some((s) => (subcategoryCounts[s.handle] ?? 0) > 0) && (
        <FilterAccordion title="Series & Type" defaultOpen={false}>
          {category.subcategories.map((sub) => {
            const count = subcategoryCounts[sub.handle] ?? 0
            const checked = state.selectedSubcategories.includes(sub.handle)
            if (count === 0 && !checked) return null
            return (
              <FilterCheckboxRow
                key={sub.id}
                label={sub.name}
                count={count}
                checked={checked}
                onToggle={() => onToggleSubcategory(sub.handle)}
              />
            )
          })}
        </FilterAccordion>
      )}

      {/* Dynamic Technical Specification Facets */}
      {facetGroups.map((group, index) => (
        <FilterAccordion key={group.key} title={group.label} defaultOpen={index < 3}>
          {group.options.map((opt) => {
            const selectedValues = state.selectedSpecs[group.key] ?? []
            const checked = selectedValues.includes(opt.value)
            return (
              <FilterCheckboxRow
                key={`${group.key}-${opt.value}`}
                label={opt.label}
                count={opt.count}
                checked={checked}
                onToggle={() => onToggleSpecValue(group.key, opt.value)}
              />
            )
          })}
        </FilterAccordion>
      ))}

      {/* Service & Checkout Toggles */}
      <FilterAccordion title="Hub Stock & Delivery" defaultOpen={false}>
        <FilterCheckboxRow
          label="In Stock Ready to Ship"
          checked={state.inStockOnly}
          onToggle={() => onToggleBooleanFlag('inStockOnly')}
        />
        <FilterCheckboxRow
          label="Discounted Offers Only"
          checked={state.discountOnly}
          onToggle={() => onToggleBooleanFlag('discountOnly')}
        />
        <FilterCheckboxRow
          label="Open-Box Verification"
          checked={state.openBoxOnly}
          onToggle={() => onToggleBooleanFlag('openBoxOnly')}
        />
        <FilterCheckboxRow
          label="No-Cost EMI Eligible"
          checked={state.emiOnly}
          onToggle={() => onToggleBooleanFlag('emiOnly')}
        />
      </FilterAccordion>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useOptionalBehavior } from '@/context/BehaviorContext'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { CategoryHeroSection } from '@/components/category/CategoryHeroSection'
import { CategoryProductWorkspace } from '@/components/category/CategoryProductWorkspace'
import {
  applyCategoryQuickPreset,
  buildActiveFilterChips,
  DEFAULT_CATEGORY_FILTER_STATE,
  extractCategoryBrandOptions,
  extractCategoryFacetGroups,
  filterAndSortCategoryProducts,
  getEffectiveProductPricePaise,
} from '@/lib/category-filters'
import type {
  CategoryActiveFilterChip,
  CategoryFilterState,
  CategoryPageViewProps,
  CategoryQuickPreset,
  CategorySortOption,
} from '@/types/category'

function toggleValue(list: readonly string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function CategoryPageClient({
  category,
  products,
  brands,
  experience,
  pairingCategories,
  pairingProducts,
}: CategoryPageViewProps) {
  const [filterState, setFilterState] = useState<CategoryFilterState>(
    DEFAULT_CATEGORY_FILTER_STATE
  )
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const behavior = useOptionalBehavior()
  const trackCategoryBrowse = behavior?.trackCategoryBrowse

  useEffect(() => {
    trackCategoryBrowse?.(category.handle)
  }, [category.handle, trackCategoryBrowse])

  const brandOptions = useMemo(
    () => extractCategoryBrandOptions(products, brands),
    [products, brands]
  )

  const facetGroups = useMemo(
    () => extractCategoryFacetGroups(products, experience),
    [products, experience]
  )

  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const product of products) {
      counts[product.subcategory_handle] = (counts[product.subcategory_handle] ?? 0) + 1
    }
    return counts
  }, [products])

  const priceBandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const band of experience.priceBands) {
      counts[band.id] = products.filter((product) => {
        const price = getEffectiveProductPricePaise(product)
        return price >= band.minPaise && (band.maxPaise === null || price < band.maxPaise)
      }).length
    }
    return counts
  }, [products, experience.priceBands])

  const lowestPricePaise = useMemo(() => {
    const prices = products.map(getEffectiveProductPricePaise).filter((p) => p > 0)
    return prices.length > 0 ? Math.min(...prices) : 0
  }, [products])

  const filteredProducts = useMemo(
    () => filterAndSortCategoryProducts(products, experience, filterState),
    [products, experience, filterState]
  )

  const activeChips = useMemo(
    () => buildActiveFilterChips(filterState, experience, category),
    [filterState, experience, category]
  )

  const handleResetFilters = () => {
    setFilterState(DEFAULT_CATEGORY_FILTER_STATE)
  }

  const handleApplyPreset = (preset: CategoryQuickPreset) => {
    setFilterState(applyCategoryQuickPreset(preset))
  }

  const handleToggleSpecValue = (specKey: string, value: string) => {
    setFilterState((prev) => {
      const current = prev.selectedSpecs[specKey] ?? []
      const next = toggleValue(current, value)
      const nextSpecs = { ...prev.selectedSpecs }
      if (next.length === 0) delete nextSpecs[specKey]
      else nextSpecs[specKey] = next
      return { ...prev, selectedSpecs: nextSpecs }
    })
  }

  const handleRemoveChip = (chip: CategoryActiveFilterChip) => {
    setFilterState((prev) => {
      if (chip.groupKey === 'search') return { ...prev, searchQuery: '' }
      if (chip.groupKey === 'subcategory') {
        return {
          ...prev,
          selectedSubcategories: prev.selectedSubcategories.filter((s) => s !== chip.value),
        }
      }
      if (chip.groupKey === 'brand') {
        return {
          ...prev,
          selectedBrands: prev.selectedBrands.filter((b) => b !== chip.value),
        }
      }
      if (chip.groupKey === 'price') {
        return {
          ...prev,
          selectedPriceBands: prev.selectedPriceBands.filter((id) => id !== chip.value),
        }
      }
      if (chip.groupKey === 'spec' && chip.specKey) {
        const current = prev.selectedSpecs[chip.specKey] ?? []
        const updated = current.filter((v) => v !== chip.value)
        const nextSpecs = { ...prev.selectedSpecs }
        if (updated.length === 0) delete nextSpecs[chip.specKey]
        else nextSpecs[chip.specKey] = updated
        return { ...prev, selectedSpecs: nextSpecs }
      }
      if (chip.groupKey === 'toggle') {
        return { ...prev, [chip.value]: false }
      }
      return prev
    })
  }

  return (
    <StorefrontChrome
      activeCategoryHandle={category.handle}
      searchValue={filterState.searchQuery}
      onSearchChange={(q) => setFilterState((prev) => ({ ...prev, searchQuery: q }))}
    >
      <CategoryHeroSection
        category={category}
        experience={experience}
        totalCount={products.length}
        brandCount={brandOptions.length}
        lowestPricePaise={lowestPricePaise}
        filterState={filterState}
        onApplyPreset={handleApplyPreset}
        onResetFilters={handleResetFilters}
      />

      <CategoryProductWorkspace
        category={category}
        experience={experience}
        allProductsCount={products.length}
        filteredProducts={filteredProducts}
        state={filterState}
        brandOptions={brandOptions}
        priceBandCounts={priceBandCounts}
        subcategoryCounts={subcategoryCounts}
        facetGroups={facetGroups}
        activeChips={activeChips}
        pairingCategories={pairingCategories}
        pairingProducts={pairingProducts}
        isMobileFiltersOpen={isMobileFiltersOpen}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        onCloseMobileFilters={() => setIsMobileFiltersOpen(false)}
        onChangeSearch={(q) => setFilterState((prev) => ({ ...prev, searchQuery: q }))}
        onSelectSingleSubcategory={(subHandle) =>
          setFilterState((prev) => ({
            ...prev,
            selectedSubcategories: subHandle === 'all' ? [] : [subHandle],
          }))
        }
        onToggleSubcategory={(subHandle) =>
          setFilterState((prev) => ({
            ...prev,
            selectedSubcategories: toggleValue(prev.selectedSubcategories, subHandle),
          }))
        }
        onToggleBrand={(brandName) =>
          setFilterState((prev) => ({
            ...prev,
            selectedBrands: toggleValue(prev.selectedBrands, brandName),
          }))
        }
        onTogglePriceBand={(bandId) =>
          setFilterState((prev) => ({
            ...prev,
            selectedPriceBands: toggleValue(prev.selectedPriceBands, bandId),
          }))
        }
        onToggleSpecValue={handleToggleSpecValue}
        onToggleBooleanFlag={(flag) =>
          setFilterState((prev) => ({ ...prev, [flag]: !prev[flag] }))
        }
        onChangeSort={(sortBy: CategorySortOption) =>
          setFilterState((prev) => ({ ...prev, sortBy }))
        }
        onRemoveChip={handleRemoveChip}
        onResetAll={handleResetFilters}
      />
    </StorefrontChrome>
  )
}

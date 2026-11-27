import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ALL_CATEGORIES, getCategoryRoute, getProductsByCategory } from '@/lib/catalog'
import {
  CATEGORY_EXPERIENCE_PROFILES,
  getCategoryExperienceProfile,
} from '@/lib/category-experience'
import {
  applyCategoryQuickPreset,
  DEFAULT_CATEGORY_FILTER_STATE,
  extractCategoryFacetGroups,
  filterAndSortCategoryProducts,
} from '@/lib/category-filters'

describe('Dedicated category routes, filter engine, and permanent history guards', () => {
  it('maps each electronics category to a distinct App Router route directory', () => {
    const routes = ALL_CATEGORIES.map((category) => getCategoryRoute(category.handle))
    expect(new Set(routes).size).toBe(ALL_CATEGORIES.length)
    expect(routes).toContain('/smartphones')
    expect(routes).toContain('/laptops')
    expect(routes).toContain('/audio')

    for (const category of ALL_CATEGORIES) {
      const pageFile = path.resolve(__dirname, `../app/${category.handle}/page.tsx`)
      expect(existsSync(pageFile)).toBe(true)
    }
  })

  it('provides distinct category profiles and extracts tailored technical facet groups', () => {
    const smartphonesExp = getCategoryExperienceProfile('smartphones')
    const audioExp = getCategoryExperienceProfile('audio')

    expect(smartphonesExp.eyebrow).not.toBe(audioExp.eyebrow)
    expect(smartphonesExp.priceBands).not.toEqual(audioExp.priceBands)

    const smartphoneFacets = extractCategoryFacetGroups(
      getProductsByCategory('smartphones'),
      smartphonesExp
    )
    const audioFacets = extractCategoryFacetGroups(
      getProductsByCategory('audio'),
      audioExp
    )

    expect(smartphoneFacets.some((f) => f.key === 'ram_gb')).toBe(true)
    expect(smartphoneFacets.some((f) => f.key === 'refresh_rate_hz')).toBe(true)
    expect(audioFacets.some((f) => f.key === 'form_factor')).toBe(true)
    expect(audioFacets.some((f) => f.key === 'anc')).toBe(true)
    expect(Object.keys(CATEGORY_EXPERIENCE_PROFILES)).toHaveLength(ALL_CATEGORIES.length)
  })

  it('filters smartphones cleanly by brand, specs (including 256GB variants), budget, and presets', () => {
    const smartphones = getProductsByCategory('smartphones')
    const exp = getCategoryExperienceProfile('smartphones')

    const apple256 = filterAndSortCategoryProducts(smartphones, exp, {
      ...DEFAULT_CATEGORY_FILTER_STATE,
      selectedBrands: ['Apple'],
      selectedSpecs: { storage_gb: ['256'] },
    })
    expect(apple256.length).toBeGreaterThanOrEqual(1)
    expect(apple256.every((p) => p.metadata.brand === 'Apple')).toBe(true)

    const preset = exp.quickPresets.find((q) => q.id === '12gb_multitask')
    expect(preset).toBeDefined()
    if (preset) {
      const presetFiltered = filterAndSortCategoryProducts(
        smartphones,
        exp,
        applyCategoryQuickPreset(preset)
      )
      expect(presetFiltered.length).toBeGreaterThanOrEqual(2)
      expect(presetFiltered.every((p) => Number(p.metadata.specs?.ram_gb) === 12)).toBe(true)
    }
  })

  it('enforces permanent viewing history without clear controls across components and context', () => {
    const recentlyViewedSrc = readFileSync(
      path.resolve(__dirname, '../components/recommendations/RecentlyViewedSection.tsx'),
      'utf8'
    )
    const personalizedSrc = readFileSync(
      path.resolve(__dirname, '../components/recommendations/PersonalizedHomeSection.tsx'),
      'utf8'
    )
    const contextSrc = readFileSync(
      path.resolve(__dirname, '../context/BehaviorContext.tsx'),
      'utf8'
    )

    expect(recentlyViewedSrc).not.toContain('Clear History')
    expect(personalizedSrc).not.toContain('Clear History')
    expect(contextSrc).not.toContain('clearBehaviorHistory')
  })

  it('separates top category sections by tiers (Flagship, Mid-Range) and uses minimal cards without inline detail bloat', () => {
    const smartphoneExp = getCategoryExperienceProfile('smartphones')
    const smartphones = getProductsByCategory('smartphones')
    const flagshipPreset = smartphoneExp.quickPresets.find((q) => q.id === 'flagship_pro')
    const midRangePreset = smartphoneExp.quickPresets.find((q) => q.id === 'mid_range')

    expect(flagshipPreset?.label).toContain('Flagship')
    expect(midRangePreset?.label).toContain('Mid-Range')
    expect(
      filterAndSortCategoryProducts(
        smartphones,
        smartphoneExp,
        applyCategoryQuickPreset(flagshipPreset!)
      ).length
    ).toBeGreaterThanOrEqual(4)
    expect(
      filterAndSortCategoryProducts(
        smartphones,
        smartphoneExp,
        applyCategoryQuickPreset(midRangePreset!)
      ).length
    ).toBeGreaterThanOrEqual(4)

    const heroSrc = readFileSync(
      path.resolve(__dirname, '../components/category/CategoryHeroSection.tsx'),
      'utf8'
    )
    const tierBarSrc = readFileSync(
      path.resolve(__dirname, '../components/category/CategoryTierBar.tsx'),
      'utf8'
    )
    const workspaceSrc = readFileSync(
      path.resolve(__dirname, '../components/category/CategoryProductWorkspace.tsx'),
      'utf8'
    )

    expect(heroSrc).not.toContain('buyerAssurances')
    expect(tierBarSrc).toContain('quickPresets')
    expect(tierBarSrc).toContain('All Models')
    expect(workspaceSrc).toContain('<MinimalProductCard')
    expect(workspaceSrc).not.toContain('<ProductCard')
  })
})

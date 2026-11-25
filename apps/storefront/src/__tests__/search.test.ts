import { describe, expect, it } from 'vitest'
import { ALL_CATEGORIES, ALL_PRODUCTS } from '@/lib/catalog'
import { buildSearchCategoryOptions, computeSearchResults } from '@/lib/search'

describe('Mobile Station search engine helpers', () => {
  it('builds category options with "All" and all catalog categories', () => {
    const options = buildSearchCategoryOptions(ALL_CATEGORIES)
    expect(options[0]).toEqual({ handle: 'all', label: 'All' })
    expect(options.length).toBe(ALL_CATEGORIES.length + 1)
  })

  it('ranks closest matching smartphone first and computes keyword suggestions', () => {
    const res = computeSearchResults(ALL_PRODUCTS, 'iPhone 16 Pro', 'all', 'relevance', false)
    expect(res.closestProduct).not.toBeNull()
    expect(res.closestProduct?.title.toLowerCase()).toContain('iphone 16 pro')
    expect(res.rankedProducts.length).toBeGreaterThanOrEqual(1)
    expect(res.keywordSuggestions.length).toBeGreaterThanOrEqual(1)
  })

  it('supports Browse by Category queries containing "&" such as "Keyboards & Mice"', () => {
    const res = computeSearchResults(
      ALL_PRODUCTS,
      'Keyboards & Mice',
      'keyboards-mice',
      'relevance',
      true
    )
    expect(res.rankedProducts.length).toBeGreaterThan(0)
    expect(res.rankedProducts.every((p) => p.category_handle === 'keyboards-mice')).toBe(true)
  })

  it('sorts submitted search results by ascending and descending price accurately', () => {
    const asc = computeSearchResults(ALL_PRODUCTS, 'Samsung', 'all', 'price_asc', true)
    const desc = computeSearchResults(ALL_PRODUCTS, 'Samsung', 'all', 'price_desc', true)
    expect(asc.rankedProducts.length).toBeGreaterThan(1)
    expect(asc.rankedProducts[0].variants[0].price_paise).toBeLessThanOrEqual(
      asc.rankedProducts[asc.rankedProducts.length - 1].variants[0].price_paise
    )
    expect(desc.rankedProducts[0].variants[0].price_paise).toBeGreaterThanOrEqual(
      desc.rankedProducts[desc.rankedProducts.length - 1].variants[0].price_paise
    )
  })
})

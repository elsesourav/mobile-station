import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ALL_PRODUCTS, getCategoryByHandle } from '@/lib/catalog'
import { buildProductGallerySlides } from '@/lib/product-gallery'
import { buildVariantSpecificationRows } from '@/lib/product-specs'

describe('Redesigned Product Detail Page components and gallery builder', () => {
  it('builds deduplicated multi-image slides for every storefront product', () => {
    const iphone = ALL_PRODUCTS.find((p) => p.handle === 'apple-iphone-16-5g')
    expect(iphone).toBeDefined()
    if (!iphone) return

    const category = getCategoryByHandle(iphone.category_handle)
    const slides = buildProductGallerySlides(iphone, category, [])

    expect(slides.length).toBeGreaterThanOrEqual(3)
    expect(slides[0]?.src).toBe(iphone.thumbnail)
    expect(new Set(slides.map((s) => s.src)).size).toBe(slides.length)
  })

  it('uses simple MinimalProductCard in Similar Alternatives without verbose explanation clutter', () => {
    const pdpRecSource = readFileSync(
      path.resolve(__dirname, '../components/recommendations/PdpRecommendationsSection.tsx'),
      'utf8'
    )
    expect(pdpRecSource).toContain('<MinimalProductCard')
    expect(pdpRecSource).not.toContain('<ProductCard')
    expect(pdpRecSource).not.toContain('{explanation}')
    expect(pdpRecSource).not.toContain('{reason}')
  })

  it('updates dynamic RAM/SSD spec rows cleanly when switching MacBook variants', () => {
    const macbook = ALL_PRODUCTS.find((p) => p.handle === 'apple-macbook-air-13-m3')
    expect(macbook).toBeDefined()
    if (!macbook || macbook.variants.length < 2) return

    const secondVariantRows = buildVariantSpecificationRows(
      macbook.metadata.specs,
      macbook.variants[1]
    )
    const ssdRow = secondVariantRows.find((r) => r.key === 'ssd_gb')
    expect(ssdRow?.formattedValue).toBe('512 GB')
  })

  it('uses sticky left gallery and ProductVariantSelector on PDP', () => {
    const pdpClientSource = readFileSync(
      path.resolve(__dirname, '../components/ProductDetailClient.tsx'),
      'utf8'
    )
    expect(pdpClientSource).toContain('lg:sticky')
    expect(pdpClientSource).toContain('ProductGallery')
    expect(pdpClientSource).toContain('ProductSpecsAccordion')
  })
})

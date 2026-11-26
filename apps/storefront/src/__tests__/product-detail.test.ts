import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ALL_PRODUCTS } from '@/lib/catalog'
import { buildProductGallerySlides } from '@/lib/product-gallery'
import { buildVariantSpecificationRows } from '@/lib/product-specs'
import {
  analyzeVariantDimensions,
  buildActiveVariantProductTitle,
  getVariantPreviewImage,
  getVariantVisualKey,
} from '@/lib/product-variants'

describe('Redesigned Product Detail Page components, variant imagery, and GST guards', () => {
  it('builds product-only gallery slides and switches cleanly for color-mapped variant photos', () => {
    const spigenGlass = ALL_PRODUCTS.find(
      (p) => p.handle === 'spigen-glas-tr-ez-fit-tempered-glass'
    )
    expect(spigenGlass).toBeDefined()
    if (!spigenGlass) return

    const slides = buildProductGallerySlides(spigenGlass, spigenGlass.variants[0])
    expect(slides.length).toBe(2)
    expect(slides.some((s) => s.src.includes('store-visits'))).toBe(false)
    expect(slides.some((s) => s.src.includes('/categories/'))).toBe(false)

    // Color-mapped photos swap gallery cleanly while preserving visual context across same-color storage edits
    const syntheticMultiColor = {
      ...spigenGlass,
      metadata: {
        ...spigenGlass.metadata,
        color_images: {
          Midnight: ['https://res.cloudinary.com/ekbuxdbd/image/upload/v1/midnight.webp'],
          Starlight: ['https://res.cloudinary.com/ekbuxdbd/image/upload/v1/starlight.webp'],
        },
      },
      variants: [
        {
          ...spigenGlass.variants[0],
          sku: 'SKU-MDN-128',
          title: '128GB / Midnight',
          options: { Color: 'Midnight', Storage: '128GB' },
        },
        {
          ...spigenGlass.variants[0],
          sku: 'SKU-MDN-256',
          title: '256GB / Midnight',
          options: { Color: 'Midnight', Storage: '256GB' },
        },
        {
          ...spigenGlass.variants[0],
          sku: 'SKU-STR-256',
          title: '256GB / Starlight',
          options: { Color: 'Starlight', Storage: '256GB' },
        },
      ],
    }

    const v0Slides = buildProductGallerySlides(syntheticMultiColor, syntheticMultiColor.variants[0])
    const v2Slides = buildProductGallerySlides(syntheticMultiColor, syntheticMultiColor.variants[2])
    expect(v0Slides[0]?.src).toContain('midnight.webp')
    expect(v2Slides[0]?.src).toContain('starlight.webp')
    expect(getVariantVisualKey(syntheticMultiColor, syntheticMultiColor.variants[0])).toBe(
      getVariantVisualKey(syntheticMultiColor, syntheticMultiColor.variants[1])
    )
    expect(getVariantVisualKey(syntheticMultiColor, syntheticMultiColor.variants[0])).not.toBe(
      getVariantVisualKey(syntheticMultiColor, syntheticMultiColor.variants[2])
    )
    expect(analyzeVariantDimensions(syntheticMultiColor, 0).hasTrueMatrix).toBe(true)
    expect(getVariantPreviewImage(syntheticMultiColor, syntheticMultiColor.variants[2])).toContain(
      'starlight.webp'
    )
  })

  it('dynamically updates active title and spec rows when switching configurations', () => {
    const macbook = ALL_PRODUCTS.find((p) => p.handle === 'apple-macbook-air-13-m3')
    expect(macbook).toBeDefined()
    if (!macbook || macbook.variants.length < 2) return

    const updatedTitle = buildActiveVariantProductTitle(macbook, macbook.variants[1])
    expect(updatedTitle).toContain('16GB / 512GB SSD / Starlight')

    const secondVariantRows = buildVariantSpecificationRows(
      macbook.metadata.specs,
      macbook.variants[1]
    )
    expect(secondVariantRows.find((r) => r.key === 'ssd_gb')?.formattedValue).toBe('512 GB')
  })

  it('removes fake default pincode, duplicate configuration text, and unconditional GST clutter', () => {
    const pdpClientSrc = readFileSync(
      path.resolve(__dirname, '../components/ProductDetailClient.tsx'),
      'utf8'
    )
    const purchaseBoxSrc = readFileSync(
      path.resolve(__dirname, '../components/product/ProductPurchaseBox.tsx'),
      'utf8'
    )
    const variantSelSrc = readFileSync(
      path.resolve(__dirname, '../components/product/ProductVariantSelector.tsx'),
      'utf8'
    )
    const productCardSrc = readFileSync(
      path.resolve(__dirname, '../components/ProductCard.tsx'),
      'utf8'
    )

    expect(pdpClientSrc).not.toContain("useState('842001')")
    expect(pdpClientSrc).not.toContain('warehouse_bin')
    expect(purchaseBoxSrc).toContain('product.metadata.gst_invoice_available === true')
    expect(purchaseBoxSrc).toContain('product.metadata.b2b_gst_available === true')
    expect(variantSelSrc).not.toContain('{activeVariant.title}')
    expect(productCardSrc).not.toContain('HSN {product.metadata.hsn_code}')
  })

  it('isolates fullscreen portal lightbox, uses smooth accordion transitions, and uses MinimalProductCard', () => {
    const gallerySrc = readFileSync(
      path.resolve(__dirname, '../components/product/ProductGallery.tsx'),
      'utf8'
    )
    const accordionSrc = readFileSync(
      path.resolve(__dirname, '../components/product/ProductSpecsAccordion.tsx'),
      'utf8'
    )
    const pdpRecSource = readFileSync(
      path.resolve(__dirname, '../components/recommendations/PdpRecommendationsSection.tsx'),
      'utf8'
    )

    expect(gallerySrc).toContain('createPortal')
    expect(gallerySrc).toContain('z-[100050]')
    expect(gallerySrc).toContain('lightboxIndex')
    expect(accordionSrc).toContain('grid-rows-[1fr]')
    expect(accordionSrc).toContain('grid-rows-[0fr]')
    expect(pdpRecSource).toContain('<MinimalProductCard')
    expect(pdpRecSource).not.toContain('<ProductCard')
  })
})

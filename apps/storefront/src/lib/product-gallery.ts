import type { StorefrontProduct, StorefrontVariant } from '@mobile-station/types'
import { getVariantColorLabel } from '@/lib/product-variants'

export interface ProductGallerySlide {
  id: string
  src: string
  alt: string
  label: string
  isPreTransformed?: boolean
}

function buildDetailCloseUpUrl(src: string): string | null {
  if (!src.includes('res.cloudinary.com/') || !src.includes('/image/upload/')) {
    return null
  }
  const [prefix, suffix] = src.split('/image/upload/')
  if (!suffix) return null
  return `${prefix}/image/upload/c_fill,g_north,w_1000,h_1000,z_1.45,f_auto,q_auto/${suffix}`
}

function getColorMappedImages(
  product: StorefrontProduct,
  variant?: StorefrontVariant
): string[] {
  if (!variant) return []
  const urls: string[] = []

  if (variant.thumbnail) urls.push(variant.thumbnail)
  for (const img of variant.images ?? []) {
    if (img) urls.push(img)
  }

  const colorLabel = getVariantColorLabel(variant)
  if (colorLabel && product.metadata.color_images) {
    const lowerTarget = colorLabel.toLowerCase()
    for (const [key, colorUrls] of Object.entries(product.metadata.color_images)) {
      if (key.toLowerCase() === lowerTarget) {
        urls.push(...colorUrls)
      }
    }
  }

  return Array.from(new Set(urls.filter(Boolean)))
}

/**
 * Builds clean, product-only gallery slides respecting Color/Finish variant images.
 * Non-visual storage/size variants share the active color's gallery cleanly without showing unrelated products.
 */
export function buildProductGallerySlides(
  product: StorefrontProduct,
  activeVariant?: StorefrontVariant
): ProductGallerySlide[] {
  const slides: ProductGallerySlide[] = []
  const seenSrcs = new Set<string>()
  const colorLabel = activeVariant ? getVariantColorLabel(activeVariant) : null
  const labelPrefix = colorLabel ? `${colorLabel}` : 'Product View'

  const pushSlide = (slide: ProductGallerySlide) => {
    if (!slide.src || seenSrcs.has(slide.src)) return
    seenSrcs.add(slide.src)
    slides.push(slide)
  }

  const colorUrls = getColorMappedImages(product, activeVariant)
  if (colorUrls.length > 0) {
    colorUrls.forEach((url, index) => {
      pushSlide({
        id: `${product.handle}-color-${index}`,
        src: url,
        alt: `${product.title} (${labelPrefix}) — View ${index + 1}`,
        label: index === 0 ? labelPrefix : `${labelPrefix} · View ${index + 1}`,
      })
    })
  } else {
    pushSlide({
      id: `${product.handle}-primary`,
      src: product.thumbnail,
      alt: `${product.title} — Primary View`,
      label: 'Product View',
    })

    product.images.forEach((imgUrl, index) => {
      pushSlide({
        id: `${product.handle}-img-${index}`,
        src: imgUrl,
        alt: `${product.title} — Angle ${index + 2}`,
        label: `View ${index + 2}`,
      })
    })
  }

  // Only synthesize one macro product close-up when product/color has a single uploaded photo
  if (slides.length === 1 && slides[0]?.src) {
    const detailZoom = buildDetailCloseUpUrl(slides[0].src)
    if (detailZoom) {
      pushSlide({
        id: `${product.handle}-closeup`,
        src: detailZoom,
        alt: `${product.title} — Detail Close-Up`,
        label: 'Detail Zoom',
        isPreTransformed: true,
      })
    }
  }

  return slides.slice(0, 6)
}

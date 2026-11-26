import type { StorefrontProduct, StorefrontVariant } from '@mobile-station/types'

export function getVariantColorLabel(variant: StorefrontVariant): string | null {
  const colorValue = variant.options?.Color || variant.options?.Finish
  return colorValue ? colorValue.trim() : null
}

/**
 * Returns the visual key that determines whether switching variants should update gallery images.
 * Non-visual attributes (Storage, RAM, Size) keep the same gallery unless Color/Finish or variant-level media differs.
 */
export function getVariantVisualKey(
  product: StorefrontProduct,
  variant: StorefrontVariant
): string {
  const color = getVariantColorLabel(variant)
  if (color) return `color:${color.toLowerCase()}`
  if (variant.thumbnail || (variant.images && variant.images.length > 0)) {
    return `sku:${variant.sku}`
  }
  const modelKey = variant.options?.Model || variant.options?.Edition
  if (modelKey) return `model:${modelKey.toLowerCase()}`
  return `product:${product.handle}`
}

export function getVariantPreviewImage(
  product: StorefrontProduct,
  variant: StorefrontVariant
): string {
  if (variant.thumbnail) return variant.thumbnail
  if (variant.images && variant.images.length > 0) return variant.images[0]

  const colorLabel = getVariantColorLabel(variant)
  if (colorLabel && product.metadata.color_images) {
    const direct = product.metadata.color_images[colorLabel]
    if (direct && direct.length > 0) return direct[0]

    const lowerTarget = colorLabel.toLowerCase()
    for (const [key, urls] of Object.entries(product.metadata.color_images)) {
      if (key.toLowerCase() === lowerTarget && urls.length > 0) {
        return urls[0]
      }
    }
  }

  return product.thumbnail
}

/**
 * Updates product display heading smoothly when changing model/variant configurations.
 */
export function buildActiveVariantProductTitle(
  product: StorefrontProduct,
  activeVariant: StorefrontVariant
): string {
  if (activeVariant.display_title?.trim()) {
    return activeVariant.display_title.trim()
  }
  if (product.variants.length <= 1) {
    return product.title
  }
  const variantLabel = activeVariant.title.trim()
  if (!variantLabel) return product.title
  if (product.title.toLowerCase().includes(variantLabel.toLowerCase())) {
    return product.title
  }
  return `${product.title} — ${variantLabel}`
}

export interface SeparatedVariantDimensions {
  hasTrueMatrix: boolean
  colorOptions: Array<{
    color: string
    previewSrc: string
    inStock: boolean
    representativeIndex: number
  }>
  nonVisualOptionName: string
  specOptions: Array<{
    label: string
    pricePaise: number
    mrpPaise: number
    stock: number
    variantIndex: number
    availableForColor: boolean
  }>
}

/**
 * Detects whether a product has independent Color/Finish + Storage/Spec dimensions
 * (e.g. multiple colors x storage tiers), so Color switches images and Storage adjusts capacity/price cleanly.
 */
export function analyzeVariantDimensions(
  product: StorefrontProduct,
  selectedVariantIdx: number
): SeparatedVariantDimensions {
  const variants = product.variants
  const activeVariant = variants[selectedVariantIdx] ?? variants[0]
  const colorMap = new Map<string, { idx: number; preview: string; inStock: boolean }>()

  for (let i = 0; i < variants.length; i++) {
    const color = getVariantColorLabel(variants[i])
    if (!color) continue
    const existing = colorMap.get(color)
    const preview = getVariantPreviewImage(product, variants[i])
    const inStock = variants[i].stock > 0
    if (!existing) {
      colorMap.set(color, { idx: i, preview, inStock })
    } else if (inStock && !existing.inStock) {
      colorMap.set(color, { idx: i, preview, inStock })
    }
  }

  const nonColorKeys = Array.from(
    new Set(
      variants.flatMap((v) =>
        Object.keys(v.options ?? {}).filter((k) => {
          const lower = k.toLowerCase()
          return lower !== 'color' && lower !== 'finish'
        })
      )
    )
  )

  const hasTrueMatrix =
    colorMap.size > 1 &&
    nonColorKeys.length >= 1 &&
    variants.length > colorMap.size

  const activeColor = getVariantColorLabel(activeVariant)
  const nonVisualKey = nonColorKeys[0] ?? 'Variant'

  const colorOptions = Array.from(colorMap.entries()).map(([color, meta]) => {
    let targetIdx = meta.idx
    if (activeColor !== color && nonVisualKey) {
      const matchingActiveSpecVal = activeVariant.options?.[nonVisualKey]
      const pairedIdx = variants.findIndex(
        (v) =>
          getVariantColorLabel(v) === color &&
          v.options?.[nonVisualKey] === matchingActiveSpecVal &&
          v.stock > 0
      )
      if (pairedIdx >= 0) targetIdx = pairedIdx
    }
    return {
      color,
      previewSrc: meta.preview,
      inStock: meta.inStock,
      representativeIndex: targetIdx,
    }
  })

  const specValueMap = new Map<string, number>()
  for (let i = 0; i < variants.length; i++) {
    const val = variants[i].options?.[nonVisualKey] || variants[i].title
    const matchesActiveColor = !activeColor || getVariantColorLabel(variants[i]) === activeColor
    if (!specValueMap.has(val) || matchesActiveColor) {
      specValueMap.set(val, i)
    }
  }

  const specOptions = Array.from(specValueMap.entries()).map(([label, variantIndex]) => {
    const v = variants[variantIndex]
    const matchesActiveColor = !activeColor || getVariantColorLabel(v) === activeColor
    return {
      label,
      pricePaise: v.price_paise,
      mrpPaise: v.mrp_paise,
      stock: v.stock,
      variantIndex,
      availableForColor: matchesActiveColor && v.stock > 0,
    }
  })

  return {
    hasTrueMatrix,
    colorOptions,
    nonVisualOptionName: nonVisualKey,
    specOptions,
  }
}

'use client'

import Image from 'next/image'
import type { StorefrontProduct } from '@mobile-station/types'
import { discountPercent, formatINR } from '@/lib/format'
import {
  analyzeVariantDimensions,
  getVariantColorLabel,
  getVariantPreviewImage,
} from '@/lib/product-variants'

interface ProductVariantSelectorProps {
  product: StorefrontProduct
  selectedVariantIdx: number
  onSelectVariant: (variantIndex: number) => void
}

/**
 * Compact Rectangular Configuration Tiles:
 * - Completely hidden when a product only has 1 default variant (`variants.length <= 1`)
 * - Compact box cards with larger framed product photo on top + small title & price below
 * - Automatically separates Color/Finish image selectors from non-visual Storage/RAM options when multi-dimensional
 */
export function ProductVariantSelector({
  product,
  selectedVariantIdx,
  onSelectVariant,
}: ProductVariantSelectorProps) {
  const variants = product.variants
  if (variants.length <= 1) return null

  const activeVariant = variants[selectedVariantIdx] ?? variants[0]
  const matrix = analyzeVariantDimensions(product, selectedVariantIdx)
  const activeColor = getVariantColorLabel(activeVariant)

  if (matrix.hasTrueMatrix) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Finish
          </p>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
            {matrix.colorOptions.map((opt) => {
              const selected = activeColor === opt.color
              return (
                <button
                  key={opt.color}
                  type="button"
                  onClick={() => onSelectVariant(opt.representativeIndex)}
                  aria-pressed={selected}
                  className={`sm:w-[104px] rounded-md border overflow-hidden text-left transition flex flex-col ${
                    selected
                      ? 'border-obsidian-900 bg-obsidian-900/5 ring-1 ring-obsidian-900 shadow-card'
                      : 'border-chrome-300 bg-surface-card hover:border-gold-500'
                  }`}
                >
                  <div className="relative w-full h-14 sm:h-16 bg-surface-card">
                    <Image
                      src={opt.previewSrc}
                      alt={opt.color}
                      fill
                      sizes="104px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="px-2 py-1 border-t border-chrome-200/70 w-full">
                    <span className="block font-display text-[11px] font-bold text-ink-primary truncate text-center">
                      {opt.color}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            {matrix.nonVisualOptionName}
          </p>
          <div className="flex flex-wrap gap-2">
            {matrix.specOptions.map((specOpt) => {
              const activeVal = activeVariant.options?.[matrix.nonVisualOptionName]
              const selected = activeVal === specOpt.label
              return (
                <button
                  key={specOpt.label}
                  type="button"
                  disabled={!specOpt.availableForColor && specOpt.stock <= 0}
                  onClick={() => onSelectVariant(specOpt.variantIndex)}
                  aria-pressed={selected}
                  className={`rounded-md border px-3 py-1.5 text-left transition tabular-nums ${
                    selected
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500 shadow-card'
                      : 'border-chrome-300 bg-surface-card text-ink-primary hover:border-gold-500'
                  } ${specOpt.stock <= 0 ? 'opacity-45 cursor-not-allowed' : ''}`}
                >
                  <span className="block font-display text-xs font-bold">{specOpt.label}</span>
                  <span
                    className={`block font-mono text-[10.5px] ${
                      selected ? 'text-chrome-200' : 'text-ink-muted'
                    }`}
                  >
                    {formatINR(specOpt.pricePaise)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
        Select Option
      </p>

      <div
        role="radiogroup"
        aria-label="Product configurations"
        className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5"
      >
        {variants.map((variant, index) => {
          const isSelected = index === selectedVariantIdx
          const isAvailable = variant.stock > 0
          const previewSrc = getVariantPreviewImage(product, variant)
          const off = discountPercent(variant.mrp_paise, variant.price_paise)

          return (
            <button
              key={variant.sku}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!isAvailable}
              onClick={() => onSelectVariant(index)}
              className={`sm:w-[136px] rounded-md border overflow-hidden text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'border-obsidian-900 bg-obsidian-900/5 ring-1 ring-obsidian-900 shadow-card'
                  : 'border-chrome-300 bg-surface-card hover:border-gold-500'
              } ${!isAvailable ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="relative w-full h-16 sm:h-[72px] bg-surface-card">
                <Image
                  src={previewSrc}
                  alt={variant.title}
                  fill
                  sizes="136px"
                  className="object-contain p-1.5"
                />
              </div>

              <div className="px-2 py-1.5 border-t border-chrome-200/70 w-full space-y-0.5">
                <span className="block font-display text-[11px] font-bold leading-tight text-ink-primary line-clamp-2">
                  {variant.title}
                </span>

                <div className="flex items-center justify-between gap-1 tabular-nums">
                  <span className="font-mono text-[11px] font-bold text-ink-primary">
                    {formatINR(variant.price_paise)}
                  </span>
                  {isAvailable ? (
                    off > 0 && (
                      <span className="font-mono text-[9.5px] font-bold text-commerce-savings">
                        -{off}%
                      </span>
                    )
                  ) : (
                    <span className="font-mono text-[9.5px] text-commerce-errorText">Out</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

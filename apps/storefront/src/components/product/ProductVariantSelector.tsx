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
 * Industry-standard Electronics Variant Selector:
 * - Separate Finish/Color thumbnail cards from non-visual Storage/RAM options when multi-dimensional
 * - Single-axis configuration cards show clean mini product/variant preview + concise title + price
 * - Eliminates redundant "Model: ..." subtitle and top duplicate selected-name repetition
 */
export function ProductVariantSelector({
  product,
  selectedVariantIdx,
  onSelectVariant,
}: ProductVariantSelectorProps) {
  const variants = product.variants
  if (variants.length === 0) return null

  const activeVariant = variants[selectedVariantIdx] ?? variants[0]
  const matrix = analyzeVariantDimensions(product, selectedVariantIdx)
  const activeColor = getVariantColorLabel(activeVariant)

  if (matrix.hasTrueMatrix) {
    return (
      <div className="space-y-4">
        {/* Visual Color / Finish Selector with Product Thumbnails */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Select Finish
          </p>
          <div className="flex flex-wrap gap-2">
            {matrix.colorOptions.map((opt) => {
              const selected = activeColor === opt.color
              return (
                <button
                  key={opt.color}
                  type="button"
                  onClick={() => onSelectVariant(opt.representativeIndex)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition ${
                    selected
                      ? 'border-obsidian-900 bg-obsidian-900/5 ring-1 ring-obsidian-900 shadow-card'
                      : 'border-chrome-300 bg-surface-card hover:border-gold-500'
                  }`}
                >
                  <span className="relative w-8 h-8 rounded-xs border border-chrome-200 bg-surface-card shrink-0 overflow-hidden">
                    <Image
                      src={opt.previewSrc}
                      alt={opt.color}
                      fill
                      sizes="32px"
                      className="object-contain p-0.5"
                    />
                  </span>
                  <span className="font-display text-xs font-bold text-ink-primary">
                    {opt.color}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Non-Visual Specification Tiers (Storage / Memory) without Separate Photos */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Select {matrix.nonVisualOptionName}
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
                  className={`rounded-md border px-3 py-2 text-left transition tabular-nums ${
                    selected
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500 shadow-card'
                      : 'border-chrome-300 bg-surface-card text-ink-primary hover:border-gold-500'
                  } ${specOpt.stock <= 0 ? 'opacity-45 cursor-not-allowed' : ''}`}
                >
                  <span className="block font-display text-xs font-bold">{specOpt.label}</span>
                  <span
                    className={`block font-mono text-[11px] ${
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
        Select Configuration
      </p>

      <div
        role="radiogroup"
        aria-label="Product configurations"
        className={`grid gap-2.5 ${
          variants.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
        }`}
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
              className={`rounded-md border p-2.5 text-left transition flex items-center justify-between gap-2.5 ${
                isSelected
                  ? 'border-obsidian-900 bg-obsidian-900/5 ring-1 ring-obsidian-900 shadow-card'
                  : 'border-chrome-300 bg-surface-card hover:border-gold-500'
              } ${!isAvailable ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative w-9 h-9 rounded-xs border border-chrome-200 bg-surface-card shrink-0 overflow-hidden">
                  <Image
                    src={previewSrc}
                    alt={variant.title}
                    fill
                    sizes="36px"
                    className="object-contain p-0.5"
                  />
                </span>

                <span className="font-display text-xs sm:text-[13px] font-bold text-ink-primary line-clamp-2 leading-snug">
                  {variant.title}
                </span>
              </div>

              <div className="text-right shrink-0 tabular-nums space-y-0.5">
                <p className="font-display text-xs sm:text-sm font-bold text-ink-primary">
                  {formatINR(variant.price_paise)}
                </p>
                {isAvailable ? (
                  off > 0 && (
                    <span className="block font-mono text-[10px] font-bold text-commerce-savings">
                      -{off}%
                    </span>
                  )
                ) : (
                  <span className="block font-mono text-[10px] text-commerce-errorText">
                    Out of stock
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { Check } from 'lucide-react'
import type { StorefrontVariant } from '@mobile-station/types'
import { discountPercent, formatINR } from '@/lib/format'

interface ProductVariantSelectorProps {
  variants: readonly StorefrontVariant[]
  selectedVariantIdx: number
  onSelectVariant: (variantIndex: number) => void
}

function resolveColorSwatchClass(variant: StorefrontVariant): string | null {
  const hint = (
    variant.options?.Color ||
    variant.options?.Finish ||
    variant.title
  ).toLowerCase()

  if (hint.includes('ultramarine') || hint.includes('blue') || hint.includes('iceblue') || hint.includes('navy')) {
    return 'bg-sky-700'
  }
  if (hint.includes('desert') || hint.includes('gold') || hint.includes('sand')) {
    return 'bg-gold-500'
  }
  if (hint.includes('natural titanium') || hint.includes('silver') || hint.includes('porcelain') || hint.includes('starlight') || hint.includes('mist')) {
    return 'bg-chrome-300'
  }
  if (hint.includes('green') || hint.includes('trail') || hint.includes('emerald') || hint.includes('teal')) {
    return 'bg-emerald-700'
  }
  if (
    hint.includes('black') ||
    hint.includes('obsidian') ||
    hint.includes('noir') ||
    hint.includes('gray') ||
    hint.includes('grey') ||
    hint.includes('graphite') ||
    hint.includes('midnight') ||
    hint.includes('space')
  ) {
    return 'bg-obsidian-900'
  }
  if (hint.includes('white') || hint.includes('ivory')) {
    return 'bg-surface-card border border-chrome-300'
  }
  if (hint.includes('red') || hint.includes('rose') || hint.includes('pink')) {
    return 'bg-commerce-deal'
  }
  return null
}

/**
 * Organized variant configuration grid showing finish/color swatches,
 * structured option attributes, individual variant savings, and live stock availability.
 */
export function ProductVariantSelector({
  variants,
  selectedVariantIdx,
  onSelectVariant,
}: ProductVariantSelectorProps) {
  if (variants.length === 0) return null

  const activeVariant = variants[selectedVariantIdx] ?? variants[0]

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-ink-muted">
            Configuration
          </span>
          <span className="font-semibold text-ink-primary">{activeVariant.title}</span>
        </div>
        <span className="font-mono text-[10.5px] text-ink-muted">
          SKU {activeVariant.sku}
        </span>
      </div>

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
          const swatchClass = resolveColorSwatchClass(variant)
          const off = discountPercent(variant.mrp_paise, variant.price_paise)
          const optionEntries = Object.entries(variant.options ?? {})

          return (
            <button
              key={variant.sku}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!isAvailable}
              onClick={() => onSelectVariant(index)}
              className={`group rounded-md border p-3 text-left transition flex items-center justify-between gap-3 ${
                isSelected
                  ? 'border-obsidian-900 bg-obsidian-900/5 ring-1 ring-obsidian-900 shadow-card'
                  : 'border-chrome-300 bg-surface-card hover:border-gold-500'
              } ${!isAvailable ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {swatchClass ? (
                  <span
                    aria-hidden="true"
                    className={`mt-1 w-3.5 h-3.5 rounded-full shrink-0 ${swatchClass} ${
                      isSelected ? 'ring-2 ring-gold-500 ring-offset-1' : ''
                    }`}
                  />
                ) : (
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                      isSelected
                        ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                        : 'border-chrome-300 bg-surface-muted text-transparent'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}

                <div className="min-w-0 space-y-0.5">
                  <p className="font-display text-xs sm:text-[13px] font-bold text-ink-primary truncate">
                    {variant.title}
                  </p>
                  {optionEntries.length > 0 && (
                    <p className="text-[11px] text-ink-muted truncate">
                      {optionEntries.map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0 tabular-nums space-y-0.5">
                <p className="font-display text-xs sm:text-sm font-bold text-ink-primary">
                  {formatINR(variant.price_paise)}
                </p>
                <div className="flex items-center justify-end gap-1">
                  {off > 0 && (
                    <span className="font-mono text-[10px] font-bold text-commerce-savings">
                      -{off}%
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-ink-muted">
                    {isAvailable ? `${variant.stock} left` : 'Out'}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

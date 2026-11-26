'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, Zap } from 'lucide-react'
import type { CartItem } from '@mobile-station/types'
import { discountPercent, formatINR, formatTitleWithoutBrand } from '@/lib/format'

interface CartItemRowProps {
  item: CartItem
  appliedCoupon?: string | null
  onUpdateQuantity: (sku: string, delta: number) => void
  onRemove: (sku: string) => void
}

/**
 * Compact cart line-item card structured after Glorov's CartItemRow:
 * square image left, title + top-right remove trash icon, variant pill,
 * unit pricing + savings badge, pill quantity stepper, and right-aligned item subtotal.
 */
export function CartItemRow({
  item,
  appliedCoupon,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const unitPrice = item.price_paise
  const unitMrp = Math.max(item.mrp_paise, unitPrice)
  const unitSavings = unitMrp - unitPrice
  const off = discountPercent(unitMrp, unitPrice)
  const displayTitle = formatTitleWithoutBrand(item.title, item.brand)
  const showVariantChip =
    item.variantTitle && item.variantTitle.trim().toLowerCase() !== 'default'

  return (
    <article className="w-full rounded-md border border-chrome-200 bg-surface-card p-3 shadow-card transition-colors hover:border-gold-500/70">
      <div className="flex items-start gap-3">
        <Link
          href={`/products/${item.productHandle}`}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-sm border border-chrome-200 bg-surface-card shrink-0 overflow-hidden"
        >
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            sizes="64px"
            className="object-contain p-1.5"
          />
        </Link>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {item.brand && (
                <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-gold-700 block leading-none mb-0.5">
                  {item.brand}
                </span>
              )}
              <Link
                href={`/products/${item.productHandle}`}
                className="font-display text-xs sm:text-sm font-bold text-ink-primary hover:text-gold-700 line-clamp-2 leading-snug"
              >
                {displayTitle}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.sku)}
              aria-label={`Remove ${item.title}`}
              className="p-1.5 -mt-1 -mr-1 text-ink-muted hover:text-commerce-errorText rounded transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {(showVariantChip || appliedCoupon) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {showVariantChip && (
                <span className="rounded-xs bg-surface-muted px-2 py-0.5 text-[10.5px] font-medium text-ink-secondary leading-none">
                  {item.variantTitle}
                </span>
              )}
              {appliedCoupon && (
                <span className="inline-flex items-center gap-0.5 rounded-xs bg-commerce-obdBg px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-commerce-obdText leading-none">
                  <Zap className="w-2.5 h-2.5 shrink-0" />
                  <span>{appliedCoupon}</span>
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-baseline gap-1.5 tabular-nums pt-0.5">
            <span className="font-display text-sm sm:text-base font-bold text-ink-primary leading-none">
              {formatINR(unitPrice)}
            </span>
            {unitSavings > 0 && (
              <>
                <span className="text-[11px] text-ink-muted line-through leading-none">
                  {formatINR(unitMrp)}
                </span>
                <span className="rounded-xs bg-commerce-obdBg px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-commerce-savings leading-none">
                  Save {formatINR(unitSavings)}
                  {off > 0 ? ` · ${off}%` : ''}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1.5">
            <div
              aria-label={`Quantity for ${item.title}`}
              className="inline-flex items-center rounded-full border border-chrome-300 bg-surface-canvas"
            >
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.title}`}
                onClick={() => onUpdateQuantity(item.sku, -1)}
                className="w-8 h-8 flex items-center justify-center text-ink-primary hover:bg-surface-muted rounded-l-full transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-mono text-xs font-bold text-ink-primary tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.title}`}
                onClick={() => onUpdateQuantity(item.sku, 1)}
                className="w-8 h-8 flex items-center justify-center text-ink-primary hover:bg-surface-muted rounded-r-full transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-right tabular-nums">
              <span className="text-[10.5px] text-ink-muted block leading-none">Subtotal</span>
              <span className="font-display text-sm font-bold text-ink-primary">
                {formatINR(unitPrice * item.quantity)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

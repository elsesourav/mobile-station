'use client'

import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { formatINR } from '@/lib/format'
import type { MobileStickyPurchaseBarProps } from '@/types/storefront'

/**
 * Scroll-reactive sticky bottom purchase bar on PDP (< 1024px) mirroring Glorov's
 * `MobileStickyPurchaseBar`, sliding smoothly into view while suppressing the standard bottom nav.
 */
export function MobileStickyPurchaseBar({
  visible,
  sublabel,
  pricePaise,
  mrpPaise,
  discountPercent,
  isAvailable,
  onAddToCart,
}: MobileStickyPurchaseBarProps) {
  const showMrp = mrpPaise > pricePaise

  return (
    <aside
      aria-label="Quick purchase bar"
      aria-hidden={!visible}
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-chrome-200 shadow-modal px-3.5 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 flex-wrap tabular-nums">
            <span className="font-display text-lg sm:text-xl font-bold text-ink-primary leading-none">
              {formatINR(pricePaise)}
            </span>
            {showMrp && (
              <span className="text-xs text-ink-muted line-through leading-none">
                {formatINR(mrpPaise)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="rounded-xs bg-commerce-obdBg px-1.5 py-0.5 font-mono text-[10px] font-bold text-commerce-savings leading-none">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <p className="text-[11px] text-ink-muted truncate mt-1">{sublabel}</p>
        </div>

        <button
          type="button"
          disabled={!isAvailable}
          onClick={onAddToCart}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-sm bg-gold-500 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 disabled:opacity-50 active:scale-[0.98] transition"
        >
          <ShoppingCart className="w-4 h-4 shrink-0" />
          <span>{isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </aside>
  )
}

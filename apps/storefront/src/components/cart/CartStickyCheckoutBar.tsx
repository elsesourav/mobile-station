'use client'

import React from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { formatINR } from '@/lib/format'

interface CartStickyCheckoutBarProps {
  totalPaise: number
  mrpTotalPaise: number
  overallDiscountPercent: number
  onOpenTaxBreakdown: () => void
  onCheckout: () => void
}

/**
 * Fixed mobile bottom checkout dock (< 640px) matching Glorov's CartStickyCheckoutBar:
 * Total price + MRP strike + % OFF + expandable tax sheet trigger on left; primary CTA on right.
 */
export function CartStickyCheckoutBar({
  totalPaise,
  mrpTotalPaise,
  overallDiscountPercent,
  onOpenTaxBreakdown,
  onCheckout,
}: CartStickyCheckoutBarProps) {
  const showCompare = mrpTotalPaise > totalPaise && overallDiscountPercent > 0

  return (
    <aside
      aria-label="Mobile Checkout Dock"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-chrome-200 bg-surface-card/95 backdrop-blur-md px-3.5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-modal"
    >
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5 whitespace-nowrap tabular-nums">
            <span className="font-display text-lg font-bold text-ink-primary leading-none">
              {formatINR(totalPaise)}
            </span>
            {showCompare && (
              <>
                <span className="text-xs text-ink-muted line-through leading-none">
                  {formatINR(mrpTotalPaise)}
                </span>
                <span className="rounded-xs bg-commerce-obdBg px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-commerce-savings leading-none">
                  {overallDiscountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenTaxBreakdown}
            className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-ink-secondary hover:text-ink-primary whitespace-nowrap"
          >
            <span>Incl. 18% GST &amp; taxes</span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-bold tracking-wide uppercase text-obsidian-950 shadow-gold hover:bg-gold-600 active:scale-95 transition shrink-0 whitespace-nowrap"
        >
          <span>Checkout</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </aside>
  )
}

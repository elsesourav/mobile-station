'use client'

import React from 'react'
import { ArrowRight, Lock, Receipt, Sparkles } from 'lucide-react'
import { formatINR } from '@/lib/format'

interface CartOrderSummaryProps {
  totalCount: number
  subtotalPaise: number
  mrpTotalPaise: number
  discountPaise: number
  shippingPaise: number
  totalPaise: number
  totalSavingsPaise: number
  overallDiscountPercent: number
  appliedCoupon: string | null
  onCheckout: () => void
}

/**
 * Right-column Order Summary ledger matching Glorov's CartOrderSummary position,
 * featuring itemized subtotal, promo discount, shipping unlock, total payable, and primary CTA.
 */
export function CartOrderSummary({
  totalCount,
  subtotalPaise,
  mrpTotalPaise,
  discountPaise,
  shippingPaise,
  totalPaise,
  totalSavingsPaise,
  overallDiscountPercent,
  appliedCoupon,
  onCheckout,
}: CartOrderSummaryProps) {
  const showCompareMrp = mrpTotalPaise > totalPaise && overallDiscountPercent > 0

  return (
    <section
      aria-label="Order Summary"
      className="w-full rounded-md border border-chrome-200 bg-surface-card p-4 sm:p-5 shadow-card space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-gold-700" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
            Order Summary
          </h2>
        </div>
        <span className="font-mono text-xs text-ink-muted tabular-nums">
          {totalCount} {totalCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-2.5 text-xs tabular-nums">
        <div className="flex items-center justify-between text-ink-secondary">
          <span>Items Subtotal</span>
          <span className="font-bold text-ink-primary">{formatINR(subtotalPaise)}</span>
        </div>

        {discountPaise > 0 && (
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="truncate pr-2">
              Coupon Discount {appliedCoupon ? `(${appliedCoupon})` : ''}
            </span>
            <span className="font-bold text-commerce-savings whitespace-nowrap">
              -{formatINR(discountPaise)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-ink-secondary">
          <span>Insured Courier</span>
          <span
            className={`font-bold ${
              shippingPaise === 0 ? 'text-commerce-savings' : 'text-ink-primary'
            }`}
          >
            {shippingPaise === 0 ? 'FREE' : formatINR(shippingPaise)}
          </span>
        </div>

        <div className="flex items-center justify-between text-ink-secondary">
          <span>18% GST &amp; Safe Packing</span>
          <span className="font-semibold text-ink-primary">Included in MRP</span>
        </div>
      </div>

      <div className="h-[1px] bg-chrome-200" />

      <div className="flex items-start justify-between gap-3 tabular-nums">
        <div>
          <p className="text-sm font-bold text-ink-primary">Total Payable</p>
          <p className="text-[11px] text-ink-muted">Inclusive of all taxes</p>
          {showCompareMrp && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-ink-muted line-through">
                {formatINR(mrpTotalPaise)}
              </span>
              <span className="text-[11px] font-bold text-commerce-savings">
                ({overallDiscountPercent}% OFF)
              </span>
            </div>
          )}
        </div>

        <span className="font-display text-2xl font-bold text-ink-primary leading-none">
          {formatINR(totalPaise)}
        </span>
      </div>

      {totalSavingsPaise > 0 && (
        <div className="flex items-center justify-center gap-1.5 rounded-sm bg-commerce-obdBg px-3 py-2 text-xs font-semibold text-commerce-obdText tabular-nums">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>You save {formatINR(totalSavingsPaise)} on this order</span>
        </div>
      )}

      <button
        type="button"
        onClick={onCheckout}
        className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-sm bg-gold-500 px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wide uppercase text-obsidian-950 shadow-gold hover:bg-gold-600 active:scale-[0.99] transition"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4 shrink-0" />
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
        <Lock className="w-3.5 h-3.5 shrink-0" />
        <span>IMEI-Sealed Dispatch · UPI, Cards &amp; NetBanking</span>
      </div>
    </section>
  )
}

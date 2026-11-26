'use client'

import React, { useState } from 'react'
import { ArrowRight, Percent, Sparkles, Tag, X } from 'lucide-react'
import type { CouponActionResult, StorefrontOffer } from '@mobile-station/types'
import { ALL_OFFERS } from '@/lib/catalog'
import {
  evaluateCouponDiscount,
  findBestEligibleDiscountOffer,
} from '@/lib/cart-pricing'
import { formatINR } from '@/lib/format'

interface CartCouponVoucherCardProps {
  subtotalPaise: number
  appliedCoupon: string | null
  offers?: readonly StorefrontOffer[]
  onApplyCoupon: (code: string) => CouponActionResult
  onRemoveCoupon: () => void
  onOpenOffersModal: () => void
}

/**
 * Right-column / in-flow coupon voucher card matching Glorov's CouponVoucherCard structure:
 * active discount state with Remove & upgrade hint, or 1-tap best offer apply / unlock progress.
 */
export function CartCouponVoucherCard({
  subtotalPaise,
  appliedCoupon,
  offers = ALL_OFFERS,
  onApplyCoupon,
  onRemoveCoupon,
  onOpenOffersModal,
}: CartCouponVoucherCardProps) {
  const [manualCode, setManualCode] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [feedback, setFeedback] = useState<CouponActionResult | null>(null)

  const bestEligible = findBestEligibleDiscountOffer(subtotalPaise, offers)
  const activeEval = evaluateCouponDiscount(subtotalPaise, appliedCoupon, offers)

  const higherUpgradeOffer =
    activeEval.valid &&
    bestEligible &&
    bestEligible.offer.code !== activeEval.code &&
    bestEligible.savingsPaise > activeEval.discountPaise
      ? bestEligible
      : null

  const nextLockedOffer = offers
    .filter((o) => o.is_active !== false && o.discount_type !== 'free_shipping')
    .sort((a, b) => (a.min_cart_paise ?? 0) - (b.min_cart_paise ?? 0))
    .find((o) => subtotalPaise < (o.min_cart_paise ?? 0))

  const handleApplyCode = (code: string) => {
    const res = onApplyCoupon(code)
    setFeedback(res)
    if (res.ok) {
      setManualCode('')
      setShowInput(false)
    }
  }

  return (
    <section
      aria-label="Apply Coupon or Promo Code"
      className={`w-full rounded-md border p-3.5 shadow-card space-y-2.5 transition-colors ${
        activeEval.valid
          ? 'border-commerce-savings/40 bg-commerce-obdBg/60'
          : 'border-chrome-200 bg-surface-card'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-obsidian-900 text-gold-500 flex items-center justify-center shrink-0">
            <Percent className="w-3.5 h-3.5" />
          </div>
          <span className="font-display text-xs sm:text-sm font-bold text-ink-primary truncate">
            Apply Coupon &amp; Bank Promo
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenOffersModal}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-700 hover:underline shrink-0"
        >
          <Sparkles className="w-3 h-3" />
          <span>View All</span>
        </button>
      </div>

      {activeEval.valid && activeEval.offer ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-sm border border-commerce-savings/30 bg-surface-card px-3 py-2">
            <div className="min-w-0">
              <p className="font-mono text-xs font-bold text-commerce-savings truncate">
                {activeEval.code} Active
              </p>
              <p className="text-[11px] text-ink-secondary truncate">
                {activeEval.discountPaise > 0
                  ? `You save ${formatINR(activeEval.discountPaise)} on this order`
                  : activeEval.offer.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onRemoveCoupon()
                setFeedback(null)
              }}
              aria-label="Remove applied coupon"
              className="p-1.5 text-ink-muted hover:text-commerce-errorText rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {higherUpgradeOffer && (
            <div className="flex items-center justify-between gap-2 rounded-sm border border-gold-500/50 bg-gold-100/70 px-2.5 py-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-ink-primary truncate">
                  Upgrade to {higherUpgradeOffer.offer.code}
                </p>
                <p className="text-[10.5px] text-ink-secondary truncate">
                  Save {formatINR(higherUpgradeOffer.savingsPaise)} total
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyCode(higherUpgradeOffer.offer.code)}
                className="rounded-xs bg-obsidian-900 px-2.5 py-1.5 text-[10.5px] font-bold text-gold-500 hover:bg-obsidian-800 transition shrink-0"
              >
                Switch
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-primary truncate">
                {bestEligible
                  ? `Apply ${bestEligible.offer.code} — Save ${formatINR(bestEligible.savingsPaise)}`
                  : nextLockedOffer
                    ? `Add ${formatINR(Math.max(0, (nextLockedOffer.min_cart_paise ?? 0) - subtotalPaise))} for ${nextLockedOffer.code}`
                    : 'Have a promo code?'}
              </p>
              <p className="text-[11px] text-ink-muted truncate">
                {bestEligible ? bestEligible.offer.title : 'Instant checkout promo validation'}
              </p>
            </div>

            {bestEligible ? (
              <button
                type="button"
                onClick={() => handleApplyCode(bestEligible.offer.code)}
                className="rounded-sm bg-gold-500 px-3 py-1.5 text-xs font-bold text-obsidian-950 hover:bg-gold-600 transition shrink-0"
              >
                APPLY
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowInput((v) => !v)}
                className="inline-flex items-center gap-1 rounded-sm border border-chrome-300 bg-surface-canvas px-2.5 py-1.5 text-[11px] font-semibold text-ink-primary hover:border-gold-500 transition shrink-0"
              >
                <Tag className="w-3 h-3 text-gold-700" />
                <span>{showInput ? 'Hide' : 'Enter Code'}</span>
              </button>
            )}
          </div>

          {(showInput || bestEligible) && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (manualCode.trim()) handleApplyCode(manualCode)
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g. TECH500, DESK10)"
                aria-label="Enter promo code"
                className="flex-1 min-w-0 rounded-sm border border-chrome-300 bg-surface-canvas px-2.5 py-1.5 font-mono text-xs uppercase text-ink-primary placeholder:normal-case placeholder:font-sans placeholder:text-ink-muted focus:border-gold-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="rounded-sm bg-obsidian-900 px-3 py-1.5 text-xs font-bold text-gold-500 hover:bg-obsidian-800 disabled:opacity-45 transition shrink-0"
              >
                Apply
              </button>
            </form>
          )}
        </div>
      )}

      {feedback && (
        <p
          className={`text-[11px] font-medium ${
            feedback.ok ? 'text-commerce-savings' : 'text-commerce-errorText'
          }`}
        >
          {feedback.message}
        </p>
      )}

      <div className="pt-1 border-t border-chrome-200/70">
        <button
          type="button"
          onClick={onOpenOffersModal}
          className="w-full flex items-center justify-center gap-1 text-xs font-bold text-gold-700 hover:underline py-0.5"
        >
          <span>View all available coupons</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  )
}

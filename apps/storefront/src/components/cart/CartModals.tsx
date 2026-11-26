'use client'

import React from 'react'
import { CheckCircle2, Receipt, Sparkles, Tag, Truck, X } from 'lucide-react'
import type { CartItem, CouponActionResult, StorefrontOffer } from '@mobile-station/types'
import { ALL_OFFERS, ALL_PRODUCTS, computeGstSplit } from '@/lib/catalog'
import {
  buildEffectiveOffers,
  evaluateCouponDiscount,
  formatOfferScopeLabel,
  FREE_SHIPPING_THRESHOLD_PAISE,
} from '@/lib/cart-pricing'
import { formatINR } from '@/lib/format'
import { CartMilestoneBar } from '@/components/cart/CartMilestoneBar'

interface CartAvailableOffersModalProps {
  isOpen: boolean
  onClose: () => void
  items: readonly CartItem[]
  subtotalPaise: number
  appliedCoupon: string | null
  offers?: readonly StorefrontOffer[]
  onApplyCoupon: (code: string) => CouponActionResult
  onRemoveCoupon: () => void
}

/**
 * Available offers sheet displaying category-scoped & product-exclusive eligibility cleanly.
 */
export function CartAvailableOffersModal({
  isOpen,
  onClose,
  items,
  subtotalPaise,
  appliedCoupon,
  offers = ALL_OFFERS,
  onApplyCoupon,
  onRemoveCoupon,
}: CartAvailableOffersModalProps) {
  if (!isOpen) return null

  const effectiveOffers = buildEffectiveOffers(offers, ALL_PRODUCTS)
  const isFreeShipUnlocked = subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE
  const shippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Available Cart Offers"
      onClick={onClose}
      className="fixed inset-0 z-modal flex items-end sm:items-center justify-center bg-obsidian-950/60 backdrop-blur-xs p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[88dvh] rounded-t-lg sm:rounded-lg bg-surface-card border border-chrome-200 shadow-modal flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3.5 bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gold-500" />
            <h3 className="font-display text-base font-bold text-ink-inverse">
              Available Offers
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close offers modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-chrome-300 hover:bg-obsidian-800 hover:text-gold-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-2 bg-surface-canvas border-b border-chrome-200">
          <CartMilestoneBar
            items={items}
            subtotalPaise={subtotalPaise}
            appliedCoupon={appliedCoupon}
            offers={effectiveOffers}
            hideViewOffersLink
          />
        </div>

        <div className="p-4 overflow-y-auto ms-scrollbar space-y-3 flex-1">
          <div
            className={`rounded-md border p-3.5 flex items-start justify-between gap-3 ${
              isFreeShipUnlocked
                ? 'border-commerce-savings/50 bg-commerce-obdBg/60'
                : 'border-chrome-200 bg-surface-canvas'
            }`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-commerce-savings shrink-0" />
                <p className="font-display text-sm font-bold text-ink-primary">
                  Free Express Shipping
                </p>
              </div>
              <p className="text-xs text-ink-secondary">
                Automatic on orders above {formatINR(FREE_SHIPPING_THRESHOLD_PAISE)}.
              </p>
              {!isFreeShipUnlocked && (
                <p className="text-[11px] font-bold text-commerce-errorText">
                  Add {formatINR(shippingGap)} more to unlock
                </p>
              )}
            </div>
            <span
              className={`rounded-xs px-2 py-1 font-mono text-[10px] font-bold shrink-0 ${
                isFreeShipUnlocked
                  ? 'bg-commerce-savings text-ink-inverse'
                  : 'bg-surface-muted text-ink-muted'
              }`}
            >
              {isFreeShipUnlocked ? 'UNLOCKED' : 'LOCKED'}
            </span>
          </div>

          {effectiveOffers
            .filter((o) => o.is_active !== false && o.discount_type !== 'free_shipping')
            .map((offer) => {
              const isApplied = appliedCoupon?.toUpperCase() === offer.code.toUpperCase()
              const evalResult = evaluateCouponDiscount(items, offer.code, effectiveOffers, ALL_PRODUCTS)
              const eligible = evalResult.valid
              const scopeLabel = formatOfferScopeLabel(offer, ALL_PRODUCTS)

              return (
                <div
                  key={offer.id}
                  className={`rounded-md border p-3.5 flex items-start justify-between gap-3 ${
                    isApplied
                      ? 'border-commerce-savings/50 bg-commerce-obdBg/60'
                      : 'border-chrome-200 bg-surface-card'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-display text-sm font-bold text-ink-primary">
                      {offer.title}
                    </h4>
                    <p className="text-xs text-ink-secondary">{offer.description}</p>
                    <p className="font-mono text-[11px] text-ink-primary">
                      Code: <strong>{offer.code}</strong> · {scopeLabel}
                    </p>
                    {!eligible && evalResult.reason && (
                      <p className="text-[11px] font-semibold text-commerce-errorText">
                        {evalResult.reason}
                      </p>
                    )}
                  </div>

                  {isApplied ? (
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveCoupon()
                        onClose()
                      }}
                      className="rounded-sm border border-chrome-300 bg-surface-card px-3 py-1.5 text-xs font-bold text-ink-primary hover:border-commerce-errorText hover:text-commerce-errorText transition shrink-0"
                    >
                      REMOVE
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!eligible}
                      onClick={() => {
                        onApplyCoupon(offer.code)
                        onClose()
                      }}
                      className={`rounded-sm px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                        eligible
                          ? 'bg-gold-500 text-obsidian-950 hover:bg-gold-600'
                          : 'bg-surface-muted text-ink-disabled cursor-not-allowed'
                      }`}
                    >
                      {eligible ? 'APPLY' : 'LOCKED'}
                    </button>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

interface CartTaxBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  subtotalPaise: number
  mrpTotalPaise: number
  discountPaise: number
  shippingPaise: number
  totalPaise: number
  totalSavingsPaise: number
  appliedCoupon: string | null
}

/**
 * Itemized INR + 18% GST tax breakdown bottom sheet triggered from mobile sticky bar.
 */
export function CartTaxBreakdownModal({
  isOpen,
  onClose,
  subtotalPaise,
  mrpTotalPaise,
  discountPaise,
  shippingPaise,
  totalPaise,
  totalSavingsPaise,
  appliedCoupon,
}: CartTaxBreakdownModalProps) {
  if (!isOpen) return null

  const gstSplit = computeGstSplit(totalPaise, 18, true)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Price and GST Breakdown"
      onClick={onClose}
      className="fixed inset-0 z-modal flex items-end sm:items-center justify-center bg-obsidian-950/60 backdrop-blur-xs p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-lg sm:rounded-lg bg-surface-card border border-chrome-200 p-5 shadow-modal space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gold-700" />
            <h3 className="font-display text-base font-bold text-ink-primary">
              Price &amp; 18% GST Breakdown
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tax breakdown"
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface-muted hover:text-ink-primary transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs tabular-nums">
          <div className="flex justify-between text-ink-secondary">
            <span>Subtotal</span>
            <strong className="text-ink-primary">{formatINR(subtotalPaise)}</strong>
          </div>
          {mrpTotalPaise > subtotalPaise && (
            <div className="flex justify-between text-ink-secondary">
              <span>Catalog MRP</span>
              <span className="text-ink-muted line-through">{formatINR(mrpTotalPaise)}</span>
            </div>
          )}
          {discountPaise > 0 && (
            <div className="flex justify-between text-ink-secondary">
              <span>Discount ({appliedCoupon})</span>
              <strong className="text-commerce-savings">-{formatINR(discountPaise)}</strong>
            </div>
          )}
          <div className="flex justify-between text-ink-secondary">
            <span>Shipping</span>
            <strong className={shippingPaise === 0 ? 'text-commerce-savings' : 'text-ink-primary'}>
              {shippingPaise === 0 ? 'FREE' : formatINR(shippingPaise)}
            </strong>
          </div>
          <div className="rounded-sm bg-surface-muted p-2.5 space-y-1 font-mono text-[11px] text-ink-secondary">
            <div className="flex justify-between">
              <span>Taxable Value</span>
              <span>{formatINR(gstSplit.taxablePaise)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (9%) + SGST (9%)</span>
              <span>
                {formatINR(gstSplit.cgstPaise)} + {formatINR(gstSplit.sgstPaise)}
              </span>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-chrome-200" />

        <div className="flex items-center justify-between tabular-nums">
          <span className="text-sm font-bold text-ink-primary">Total Payable</span>
          <span className="font-display text-xl font-bold text-ink-primary">
            {formatINR(totalPaise)}
          </span>
        </div>

        {totalSavingsPaise > 0 && (
          <div className="flex items-center justify-center gap-1.5 rounded-sm bg-commerce-obdBg px-3 py-2 text-xs font-bold text-commerce-obdText">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Total Savings: {formatINR(totalSavingsPaise)}</span>
          </div>
        )}

        <p className="flex items-center justify-center gap-1 text-[11px] text-ink-muted">
          <CheckCircle2 className="w-3.5 h-3.5 text-commerce-savings" />
          <span>Optional B2B GSTIN input available at checkout.</span>
        </p>
      </div>
    </div>
  )
}

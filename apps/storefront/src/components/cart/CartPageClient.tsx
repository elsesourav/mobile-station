'use client'

import React, { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import { ALL_OFFERS } from '@/lib/catalog'
import { useCart } from '@/components/CartContext'
import { CartEmptyState } from '@/components/cart/CartEmptyState'
import { CartMilestoneBar } from '@/components/cart/CartMilestoneBar'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartRecommendedCarousel } from '@/components/cart/CartRecommendedCarousel'
import { CartCouponVoucherCard } from '@/components/cart/CartCouponVoucherCard'
import { CartPincodeBox } from '@/components/cart/CartPincodeBox'
import { CartOrderSummary } from '@/components/cart/CartOrderSummary'
import { CartTrustGuarantee } from '@/components/cart/CartTrustGuarantee'
import { CartStickyCheckoutBar } from '@/components/cart/CartStickyCheckoutBar'
import {
  CartAvailableOffersModal,
  CartTaxBreakdownModal,
} from '@/components/cart/CartModals'
import { CartCheckoutModal } from '@/components/cart/CartCheckoutModal'

/**
 * Dedicated full-screen Cart page (`/cart`) matching Glorov's exact position and two-column /
 * mobile sticky-dock structure, rendered cleanly in Mobile Station's Obsidian & Gold tokens.
 */
export function CartPageClient() {
  const router = useRouter()
  const {
    items,
    isHydrated,
    totalCount,
    subtotalPaise,
    mrpTotalPaise,
    discountPaise,
    shippingPaise,
    totalPaise,
    totalSavingsPaise,
    overallDiscountPercent,
    appliedCoupon,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart()

  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false)
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null)

  const showNotice = useCallback((message: string) => {
    setNoticeBanner(message)
    window.setTimeout(() => {
      setNoticeBanner((curr) => (curr === message ? null : curr))
    }, 3000)
  }, [])

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen w-full bg-surface-canvas text-ink-primary flex flex-col">
      {/* 1. Dedicated Top Cart Bar (Back arrow + Cart title + count pill left; Close X right) */}
      <header className="w-full bg-obsidian-900 text-ink-inverse border-b border-obsidian-800 px-4 py-3 shrink-0 select-none">
        <div className="max-w-content mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className="w-9 h-9 rounded-full flex items-center justify-center text-chrome-300 hover:bg-obsidian-800 hover:text-gold-500 transition active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg sm:text-xl font-bold text-ink-inverse leading-none">
              Cart
            </h1>
            {totalCount > 0 && (
              <span className="rounded-full bg-gold-500 px-2.5 py-0.5 font-mono text-[11px] font-bold text-obsidian-950 leading-none tabular-nums">
                {totalCount}
              </span>
            )}
          </div>

          <Link
            href="/"
            aria-label="Close cart"
            className="w-9 h-9 rounded-full flex items-center justify-center text-chrome-300 hover:bg-obsidian-800 hover:text-gold-500 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {noticeBanner && (
        <div
          role="status"
          className="bg-obsidian-800 text-gold-500 border-b border-obsidian-700 px-4 py-2 text-center font-mono text-xs font-semibold"
        >
          {noticeBanner}
        </div>
      )}

      {/* 2. Main Cart Content */}
      <main className="flex-1 w-full">
        {!isHydrated ? (
          <div className="max-w-content mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[360px]">
            <div className="w-9 h-9 rounded-full border-2 border-chrome-300 border-t-gold-500 animate-spin mb-3" />
            <p className="text-xs font-medium text-ink-muted">Loading your tech cart...</p>
          </div>
        ) : items.length === 0 ? (
          <CartEmptyState onAddItem={addItem} />
        ) : (
          <div className="max-w-content mx-auto px-3 sm:px-6 py-3 sm:py-5">
            {/* Desktop & Tablet Two-Column Layout (>= 640px, matching Glorov ratios & sticky sidebar) */}
            <div className="hidden sm:flex items-start gap-4 lg:gap-6">
              {/* Left Column: Milestone Bar -> Item List -> Recommended Electronics */}
              <div className="flex-[12] lg:flex-[13] min-w-0 flex flex-col gap-3">
                <CartMilestoneBar
                  subtotalPaise={subtotalPaise}
                  appliedCoupon={appliedCoupon}
                  offers={ALL_OFFERS}
                  onOpenOffers={() => setIsOffersModalOpen(true)}
                  onApplyCoupon={(code) => {
                    const res = applyCoupon(code)
                    showNotice(res.message)
                  }}
                  onNotice={showNotice}
                />

                <div className="flex flex-col gap-2.5">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.sku}
                      item={item}
                      appliedCoupon={appliedCoupon}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                <CartRecommendedCarousel
                  items={items}
                  subtotalPaise={subtotalPaise}
                  onAddItem={addItem}
                />
              </div>

              {/* Right Column: Coupon -> Pincode -> Order Summary -> Trust Guarantee */}
              <div className="flex-[9] lg:flex-[8] min-w-0 flex flex-col gap-3.5 sticky top-4">
                <CartCouponVoucherCard
                  subtotalPaise={subtotalPaise}
                  appliedCoupon={appliedCoupon}
                  offers={ALL_OFFERS}
                  onApplyCoupon={applyCoupon}
                  onRemoveCoupon={removeCoupon}
                  onOpenOffersModal={() => setIsOffersModalOpen(true)}
                />

                <CartPincodeBox />

                <CartOrderSummary
                  totalCount={totalCount}
                  subtotalPaise={subtotalPaise}
                  mrpTotalPaise={mrpTotalPaise}
                  discountPaise={discountPaise}
                  shippingPaise={shippingPaise}
                  totalPaise={totalPaise}
                  totalSavingsPaise={totalSavingsPaise}
                  overallDiscountPercent={overallDiscountPercent}
                  appliedCoupon={appliedCoupon}
                  onCheckout={() => setIsCheckoutModalOpen(true)}
                />

                <CartTrustGuarantee />
              </div>
            </div>

            {/* Mobile Single-Column Layout (< 640px, matching Glorov item->recs->coupon->pin->trust flow) */}
            <div className="flex sm:hidden flex-col gap-2.5 pb-28">
              <CartMilestoneBar
                subtotalPaise={subtotalPaise}
                appliedCoupon={appliedCoupon}
                offers={ALL_OFFERS}
                onOpenOffers={() => setIsOffersModalOpen(true)}
                onApplyCoupon={(code) => {
                  const res = applyCoupon(code)
                  showNotice(res.message)
                }}
                onNotice={showNotice}
              />

              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <CartItemRow
                    key={item.sku}
                    item={item}
                    appliedCoupon={appliedCoupon}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              <CartRecommendedCarousel
                items={items}
                subtotalPaise={subtotalPaise}
                onAddItem={addItem}
              />

              <CartCouponVoucherCard
                subtotalPaise={subtotalPaise}
                appliedCoupon={appliedCoupon}
                offers={ALL_OFFERS}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                onOpenOffersModal={() => setIsOffersModalOpen(true)}
              />

              <CartPincodeBox />

              <CartTrustGuarantee />
            </div>
          </div>
        )}
      </main>

      {/* 3. Mobile Sticky Bottom Checkout Dock */}
      {items.length > 0 && (
        <CartStickyCheckoutBar
          totalPaise={totalPaise}
          mrpTotalPaise={mrpTotalPaise}
          overallDiscountPercent={overallDiscountPercent}
          onOpenTaxBreakdown={() => setIsTaxModalOpen(true)}
          onCheckout={() => setIsCheckoutModalOpen(true)}
        />
      )}

      {/* 4. Sheets */}
      <CartAvailableOffersModal
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        subtotalPaise={subtotalPaise}
        appliedCoupon={appliedCoupon}
        offers={ALL_OFFERS}
        onApplyCoupon={applyCoupon}
        onRemoveCoupon={removeCoupon}
      />

      <CartTaxBreakdownModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        subtotalPaise={subtotalPaise}
        mrpTotalPaise={mrpTotalPaise}
        discountPaise={discountPaise}
        shippingPaise={shippingPaise}
        totalPaise={totalPaise}
        totalSavingsPaise={totalSavingsPaise}
        appliedCoupon={appliedCoupon}
      />

      <CartCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        items={items}
        totalPaise={totalPaise}
        appliedCoupon={appliedCoupon}
        onOrderConfirmed={clearCart}
      />
    </div>
  )
}

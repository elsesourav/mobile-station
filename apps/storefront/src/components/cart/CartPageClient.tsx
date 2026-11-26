'use client'

import React, { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import { ALL_OFFERS, ALL_PRODUCTS } from '@/lib/catalog'
import { buildEffectiveOffers, doesCartItemMatchOffer } from '@/lib/cart-pricing'
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
 * mobile sticky-dock structure, enforcing category & product coupon scoping.
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

  const effectiveOffers = useMemo(() => buildEffectiveOffers(ALL_OFFERS, ALL_PRODUCTS), [])
  const activeOfferObj = useMemo(
    () =>
      appliedCoupon
        ? effectiveOffers.find((o) => o.code.toUpperCase() === appliedCoupon.toUpperCase()) ?? null
        : null,
    [appliedCoupon, effectiveOffers]
  )

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

      <main className="flex-1 w-full">
        {!isHydrated ? (
          <div className="max-w-content mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[360px]">
            <div className="w-9 h-9 rounded-full border-2 border-chrome-300 border-t-gold-500 animate-spin mb-3" />
            <p className="text-xs font-medium text-ink-muted">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <CartEmptyState onAddItem={addItem} />
        ) : (
          <div className="max-w-content mx-auto px-3 sm:px-6 py-3 sm:py-5">
            {/* Desktop & Tablet Two-Column Layout (>= 640px) */}
            <div className="hidden sm:flex items-start gap-4 lg:gap-6">
              <div className="flex-[12] lg:flex-[13] min-w-0 flex flex-col gap-3">
                <CartMilestoneBar
                  items={items}
                  subtotalPaise={subtotalPaise}
                  appliedCoupon={appliedCoupon}
                  offers={effectiveOffers}
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
                      isCouponEligible={
                        activeOfferObj
                          ? doesCartItemMatchOffer(item, activeOfferObj, ALL_PRODUCTS)
                          : false
                      }
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

              <div className="flex-[9] lg:flex-[8] min-w-0 flex flex-col gap-3.5 sticky top-4">
                <CartCouponVoucherCard
                  items={items}
                  subtotalPaise={subtotalPaise}
                  appliedCoupon={appliedCoupon}
                  offers={effectiveOffers}
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

            {/* Mobile Single-Column Layout (< 640px) */}
            <div className="flex sm:hidden flex-col gap-2.5 pb-28">
              <CartMilestoneBar
                items={items}
                subtotalPaise={subtotalPaise}
                appliedCoupon={appliedCoupon}
                offers={effectiveOffers}
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
                    isCouponEligible={
                      activeOfferObj
                        ? doesCartItemMatchOffer(item, activeOfferObj, ALL_PRODUCTS)
                        : false
                    }
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
                items={items}
                subtotalPaise={subtotalPaise}
                appliedCoupon={appliedCoupon}
                offers={effectiveOffers}
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

      {items.length > 0 && (
        <CartStickyCheckoutBar
          totalPaise={totalPaise}
          mrpTotalPaise={mrpTotalPaise}
          overallDiscountPercent={overallDiscountPercent}
          onOpenTaxBreakdown={() => setIsTaxModalOpen(true)}
          onCheckout={() => setIsCheckoutModalOpen(true)}
        />
      )}

      <CartAvailableOffersModal
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        items={items}
        subtotalPaise={subtotalPaise}
        appliedCoupon={appliedCoupon}
        offers={effectiveOffers}
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

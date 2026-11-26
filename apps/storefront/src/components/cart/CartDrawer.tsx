'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Minus, Plus, ShoppingBag, Sparkles, Trash2, Truck, X } from 'lucide-react'
import type { CartItem, NewCartItemInput, StorefrontProduct } from '@mobile-station/types'
import { ALL_PRODUCTS } from '@/lib/catalog'
import { FREE_SHIPPING_THRESHOLD_PAISE } from '@/lib/cart-pricing'
import { formatINR, formatTitleWithoutBrand } from '@/lib/format'
import { EMPTY_BEHAVIOR_PROFILE } from '@/lib/recommendations/behavior'
import { getCartCrossSellRecommendations } from '@/lib/recommendations/engine'
import { useOptionalBehavior } from '@/context/BehaviorContext'

interface CartDrawerProps {
  isOpen: boolean
  items: CartItem[]
  totalCount: number
  subtotalPaise: number
  shippingPaise: number
  totalSavingsPaise: number
  onClose: () => void
  onUpdateQuantity: (sku: string, delta: number) => void
  onRemoveItem: (sku: string) => void
  onAddItem?: (incomingItem: NewCartItemInput) => void
}

/**
 * Quick-add slide-over cart drawer mirroring Glorov's CartDrawer positions
 * (shipping progress banner -> compact item rows -> add-on upsells -> totals & /cart CTA).
 */
export function CartDrawer({
  isOpen,
  items,
  totalCount,
  subtotalPaise,
  shippingPaise,
  totalSavingsPaise,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onAddItem,
}: CartDrawerProps) {
  const behavior = useOptionalBehavior()
  const crossSells = useMemo(() => {
    if (!isOpen || items.length === 0) return []
    return getCartCrossSellRecommendations(
      items,
      ALL_PRODUCTS,
      behavior?.profile ?? EMPTY_BEHAVIOR_PROFILE,
      3
    )
  }, [isOpen, items, behavior?.profile])

  const handleQuickAddCrossSell = (product: StorefrontProduct) => {
    const variant = product.variants[0]
    if (!variant || !onAddItem) return
    onAddItem({
      sku: variant.sku,
      productHandle: product.handle,
      categoryHandle: product.category_handle,
      title: product.title,
      variantTitle: variant.title,
      brand: product.metadata.brand,
      price_paise: variant.price_paise,
      mrp_paise: variant.mrp_paise,
      thumbnail: product.thumbnail,
      requires_open_box_delivery: product.metadata.requires_open_box_delivery,
    })
  }

  if (!isOpen) return null

  const isFreeShipping = subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE
  const shortfallPaise = Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise)
  const estimatedTotalPaise = subtotalPaise + shippingPaise

  return (
    <div
      className="fixed inset-0 z-drawer flex justify-end bg-obsidian-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
    >
      <div className="flex h-full w-full max-w-md flex-col bg-surface-card shadow-modal border-l border-chrome-200">
        <div className="flex items-center justify-between bg-obsidian-900 px-4 py-4 text-ink-inverse border-b border-obsidian-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-gold-500" />
            <h2 className="font-display text-base font-bold text-ink-inverse">
              Your Tech Cart ({totalCount})
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close cart drawer"
            onClick={onClose}
            className="rounded-sm p-1.5 text-chrome-300 hover:bg-obsidian-800 hover:text-ink-inverse"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto ms-scrollbar p-4 space-y-3">
          {items.length > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-commerce-savings/30 bg-commerce-obdBg px-3 py-2 text-xs font-semibold text-commerce-obdText">
              <Truck className="w-4 h-4 shrink-0 text-commerce-savings" />
              {isFreeShipping ? (
                <span>Unlocked FREE Insured Express Delivery across India</span>
              ) : (
                <span>
                  Add <strong className="font-mono">{formatINR(shortfallPaise)}</strong> more for
                  FREE Express Delivery
                </span>
              )}
            </div>
          )}

          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="h-10 w-10 mx-auto text-chrome-400" />
              <p className="font-display text-base font-bold text-ink-primary">Your cart is empty</p>
              <p className="text-xs text-ink-muted max-w-xs mx-auto">
                Add smartphones, audio gear, laptops, or accessories to review GST pricing and
                dispatch options.
              </p>
              <Link
                href="/"
                onClick={onClose}
                className="inline-flex rounded-sm bg-gold-500 px-4 py-2 text-xs font-semibold text-obsidian-950"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.sku}
                className="flex gap-3 rounded-md border border-chrome-200 bg-surface-canvas p-3"
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-xs border border-chrome-200 bg-surface-card object-contain p-1"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.productHandle}`}
                      onClick={onClose}
                      className="font-display text-xs font-bold text-ink-primary hover:text-gold-700 line-clamp-2"
                    >
                      {formatTitleWithoutBrand(item.title, item.brand)}
                    </Link>
                    <button
                      type="button"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => onRemoveItem(item.sku)}
                      className="text-ink-muted hover:text-commerce-errorText p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-ink-muted truncate">{item.variantTitle}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-display text-sm font-bold text-ink-primary tabular-nums">
                      {formatINR(item.price_paise * item.quantity)}
                    </span>
                    <div className="inline-flex items-center rounded-sm border border-chrome-300 bg-surface-card">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => onUpdateQuantity(item.sku, -1)}
                        className="p-1.5 text-ink-secondary hover:text-ink-primary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 font-mono text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => onUpdateQuantity(item.sku, 1)}
                        className="p-1.5 text-ink-secondary hover:text-ink-primary"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {items.length > 0 && crossSells.length > 0 && (
            <div className="pt-3 mt-2 border-t border-chrome-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-700">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Recommended Accessories</span>
              </div>

              <div className="space-y-2">
                {crossSells.map(({ product: acc }) => {
                  const variant = acc.variants[0]
                  if (!variant) return null
                  return (
                    <div
                      key={acc.handle}
                      className="flex items-center gap-2.5 rounded-md border border-chrome-200 bg-surface-card p-2"
                    >
                      <Image
                        src={acc.thumbnail}
                        alt={acc.title}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-xs border border-chrome-200 bg-surface-card object-contain p-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-gold-700 truncate">
                          {acc.metadata.brand}
                        </p>
                        <Link
                          href={`/products/${acc.handle}`}
                          onClick={onClose}
                          className="font-display text-[11.5px] font-bold text-ink-primary hover:text-gold-700 line-clamp-1"
                        >
                          {formatTitleWithoutBrand(acc.title, acc.metadata.brand)}
                        </Link>
                        <p className="font-mono text-[11px] font-bold text-ink-primary tabular-nums mt-0.5">
                          {formatINR(variant.price_paise)}
                        </p>
                      </div>
                      {onAddItem && (
                        <button
                          type="button"
                          onClick={() => handleQuickAddCrossSell(acc)}
                          className="inline-flex min-h-[34px] items-center gap-1 rounded-sm bg-obsidian-900 px-2.5 py-1 text-[11px] font-bold text-gold-500 hover:bg-obsidian-800 transition shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-chrome-200 bg-surface-card p-4 pb-5 space-y-2.5">
            <div className="space-y-1 text-xs tabular-nums">
              <div className="flex justify-between text-ink-secondary">
                <span>Subtotal (Incl. 18% GST)</span>
                <span className="font-semibold text-ink-primary">{formatINR(subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-ink-secondary">
                <span>Insured Delivery</span>
                <span className={shippingPaise === 0 ? 'font-bold text-commerce-savings' : 'font-semibold text-ink-primary'}>
                  {shippingPaise === 0 ? 'FREE' : formatINR(shippingPaise)}
                </span>
              </div>
              {totalSavingsPaise > 0 && (
                <div className="flex justify-between text-commerce-savings font-medium">
                  <span>MRP Savings</span>
                  <span>-{formatINR(totalSavingsPaise)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t border-chrome-200 text-sm font-bold text-ink-primary">
                <span>Estimated Total</span>
                <span className="font-display text-base">{formatINR(estimatedTotalPaise)}</span>
              </div>
            </div>

            <Link
              href="/cart"
              onClick={onClose}
              className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm bg-gold-500 px-4 py-2 text-xs sm:text-sm font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
            >
              <span>Go to Full Cart &amp; Checkout</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

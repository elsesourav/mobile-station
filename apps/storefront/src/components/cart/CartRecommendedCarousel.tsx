'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react'
import type { CartItem, NewCartItemInput, StorefrontProduct } from '@mobile-station/types'
import { ALL_PRODUCTS } from '@/lib/catalog'
import { FREE_SHIPPING_THRESHOLD_PAISE } from '@/lib/cart-pricing'
import { discountPercent, formatINR, formatTitleWithoutBrand } from '@/lib/format'
import { EMPTY_BEHAVIOR_PROFILE } from '@/lib/recommendations/behavior'
import {
  getCartCrossSellRecommendations,
  getHomeRecommendations,
} from '@/lib/recommendations/engine'
import { useOptionalBehavior } from '@/context/BehaviorContext'

type CartRecTab = 'for-you' | 'compatible' | 'audio-power'

interface CartRecommendedCarouselProps {
  items: readonly CartItem[]
  subtotalPaise: number
  onAddItem: (item: NewCartItemInput) => void
}

/**
 * Horizontal recommendation carousel rendered below cart items on both desktop (left col)
 * and mobile (right after item rows), matching Glorov's RecommendedProductsSection position.
 */
export function CartRecommendedCarousel({
  items,
  subtotalPaise,
  onAddItem,
}: CartRecommendedCarouselProps) {
  const behavior = useOptionalBehavior()
  const [activeTab, setActiveTab] = useState<CartRecTab>('for-you')
  const [justAddedHandle, setJustAddedHandle] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const railRef = useRef<HTMLDivElement>(null)

  const profile = behavior?.profile ?? EMPTY_BEHAVIOR_PROFILE
  const inCartHandles = useMemo(() => new Set(items.map((i) => i.productHandle)), [items])
  const freeShippingGapPaise = Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise)

  const recommendedProducts = useMemo(() => {
    if (activeTab === 'compatible') {
      return getCartCrossSellRecommendations(items, ALL_PRODUCTS, profile, 8).map(
        (entry) => entry.product
      )
    }
    if (activeTab === 'audio-power') {
      return ALL_PRODUCTS.filter(
        (p) =>
          !inCartHandles.has(p.handle) &&
          (p.category_handle === 'audio' ||
            p.category_handle === 'power-charging' ||
            p.category_handle === 'accessories-storage')
      ).slice(0, 8)
    }
    const crossSells = getCartCrossSellRecommendations(items, ALL_PRODUCTS, profile, 4).map(
      (entry) => entry.product
    )
    const homePicks = getHomeRecommendations(ALL_PRODUCTS, profile, items, {}, 8).map(
      (entry) => entry.product
    )
    const merged: StorefrontProduct[] = []
    const seen = new Set<string>(inCartHandles)
    for (const candidate of [...crossSells, ...homePicks]) {
      if (seen.has(candidate.handle)) continue
      seen.add(candidate.handle)
      merged.push(candidate)
    }
    return merged.slice(0, 8)
  }, [activeTab, items, profile, inCartHandles])

  const updateScrollBounds = useCallback(() => {
    const el = railRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }, [])

  useEffect(() => {
    updateScrollBounds()
    window.addEventListener('resize', updateScrollBounds, { passive: true })
    return () => window.removeEventListener('resize', updateScrollBounds)
  }, [recommendedProducts, updateScrollBounds])

  const scrollRail = (dir: 'left' | 'right') => {
    railRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' })
  }

  const handleQuickAdd = (product: StorefrontProduct) => {
    const variant = product.variants[0]
    if (!variant) return
    onAddItem({
      sku: variant.sku,
      productHandle: product.handle,
      title: product.title,
      variantTitle: variant.title,
      brand: product.metadata.brand,
      price_paise: variant.price_paise,
      mrp_paise: variant.mrp_paise,
      thumbnail: product.thumbnail,
      requires_open_box_delivery: product.metadata.requires_open_box_delivery,
    })
    setJustAddedHandle(product.handle)
    window.setTimeout(() => {
      setJustAddedHandle((curr) => (curr === product.handle ? null : curr))
    }, 1200)
  }

  if (recommendedProducts.length === 0) return null

  return (
    <section aria-label="Recommended Electronics" className="w-full space-y-2.5 pt-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-obsidian-900 text-gold-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-display text-base sm:text-lg font-bold text-ink-primary truncate">
            Recommended For Your Setup
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => scrollRail('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll recommendations left"
            className="w-7 h-7 rounded-full border border-chrome-200 bg-surface-card flex items-center justify-center text-ink-primary disabled:opacity-35 hover:border-gold-500 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollRail('right')}
            disabled={!canScrollRight}
            aria-label="Scroll recommendations right"
            className="w-7 h-7 rounded-full border border-chrome-200 bg-surface-card flex items-center justify-center text-ink-primary disabled:opacity-35 hover:border-gold-500 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'for-you', label: 'For You' },
          { id: 'compatible', label: 'Compatible Add-Ons' },
          { id: 'audio-power', label: 'Audio & GaN' },
        ].map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as CartRecTab)
                railRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
              }}
              className={`rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap transition shrink-0 ${
                active
                  ? 'bg-obsidian-900 text-gold-500'
                  : 'border border-chrome-200 bg-surface-card text-ink-secondary hover:border-gold-500'
              }`}
            >
              {tab.label}
            </button>
          )
        })}

        {freeShippingGapPaise > 0 && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-gold-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-gold-700 whitespace-nowrap ml-auto">
            Add {formatINR(freeShippingGapPaise)} for Free Shipping
          </span>
        )}
      </div>

      <div
        ref={railRef}
        onScroll={updateScrollBounds}
        className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-2"
      >
        {recommendedProducts.map((prod) => {
          const variant = prod.variants[0]
          const price = variant?.price_paise ?? 0
          const mrp = variant?.mrp_paise ?? price
          const off = discountPercent(mrp, price)
          const added = justAddedHandle === prod.handle

          return (
            <div
              key={prod.handle}
              className="w-[164px] sm:w-[174px] shrink-0 rounded-md border border-chrome-200 bg-surface-card overflow-hidden flex flex-col justify-between shadow-card hover:border-gold-500 transition group"
            >
              <Link href={`/products/${prod.handle}`} className="block">
                <div className="relative aspect-square w-full bg-surface-card border-b border-chrome-200/60 overflow-hidden">
                  <Image
                    src={prod.thumbnail}
                    alt={prod.title}
                    fill
                    sizes="174px"
                    className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
                  />
                  {off > 0 && (
                    <span className="absolute top-2 left-2 rounded-xs bg-commerce-errorBg px-1.5 py-0.5 font-mono text-[9px] font-bold text-commerce-errorText">
                      -{off}%
                    </span>
                  )}
                </div>

                <div className="p-2.5 pb-1 space-y-0.5">
                  <p className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-gold-700 truncate">
                    {prod.metadata.brand}
                  </p>
                  <h3 className="font-display text-xs font-bold text-ink-primary group-hover:text-gold-700 line-clamp-2 min-h-[2.1rem] leading-snug">
                    {formatTitleWithoutBrand(prod.title, prod.metadata.brand)}
                  </h3>
                </div>
              </Link>

              <div className="px-2.5 pb-2.5 pt-1 flex items-center justify-between gap-2">
                <div className="tabular-nums min-w-0">
                  <span className="font-display text-sm font-bold text-ink-primary block leading-none">
                    {formatINR(price)}
                  </span>
                  {mrp > price && (
                    <span className="text-[10px] text-ink-muted line-through">
                      {formatINR(mrp)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickAdd(prod)}
                  aria-label={`Add ${prod.title} to cart`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition active:scale-90 ${
                    added
                      ? 'bg-commerce-savings text-ink-inverse'
                      : 'bg-obsidian-900 text-gold-500 hover:bg-obsidian-800'
                  }`}
                >
                  {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

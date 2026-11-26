'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ShoppingBag, Sparkles } from 'lucide-react'
import type { NewCartItemInput, StorefrontProduct } from '@mobile-station/types'
import { ALL_PRODUCTS } from '@/lib/catalog'
import { discountPercent, formatINR, formatTitleWithoutBrand } from '@/lib/format'
import { EMPTY_BEHAVIOR_PROFILE } from '@/lib/recommendations/behavior'
import { getHomeRecommendations } from '@/lib/recommendations/engine'

interface CartEmptyStateProps {
  onAddItem: (item: NewCartItemInput) => void
}

/**
 * Empty cart screen matching Glorov's CartEmptyState positions:
 * centered 84px bag circle -> heading -> subtitle -> catalog CTA pill -> 4 popular picks grid.
 */
export function CartEmptyState({ onAddItem }: CartEmptyStateProps) {
  const [justAddedHandle, setJustAddedHandle] = useState<string | null>(null)
  const popularPicks = getHomeRecommendations(ALL_PRODUCTS, EMPTY_BEHAVIOR_PROFILE, [], {}, 4).map(
    (entry) => entry.product
  )

  const handleQuickAdd = (product: StorefrontProduct) => {
    const variant = product.variants[0]
    if (!variant) return
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
    setJustAddedHandle(product.handle)
    window.setTimeout(() => {
      setJustAddedHandle((curr) => (curr === product.handle ? null : curr))
    }, 1200)
  }

  return (
    <div className="page-container py-8 sm:py-12 flex flex-col items-center text-center">
      <div className="w-[84px] h-[84px] rounded-full bg-obsidian-900 text-gold-500 flex items-center justify-center shadow-gold">
        <ShoppingBag className="w-9 h-9" />
      </div>

      <h2 className="mt-4 font-display text-xl sm:text-2xl font-bold text-ink-primary">
        Your Tech Cart is Empty
      </h2>

      <p className="mt-1.5 text-xs sm:text-sm text-ink-muted max-w-md leading-relaxed">
        Explore sealed 5G smartphones, laptops, TWS earphones, GaN chargers, and accessories with
        official brand warranty and 18% GST invoices.
      </p>

      <div className="mt-5">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gold-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore Catalog</span>
        </Link>
      </div>

      <div className="mt-10 w-full text-left space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-obsidian-900 text-gold-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
            Popular Electronics Picks
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {popularPicks.map((prod) => {
            const variant = prod.variants[0]
            const price = variant?.price_paise ?? 0
            const mrp = variant?.mrp_paise ?? price
            const off = discountPercent(mrp, price)
            const added = justAddedHandle === prod.handle

            return (
              <div
                key={prod.handle}
                className="rounded-md border border-chrome-200 bg-surface-card overflow-hidden flex flex-col justify-between shadow-card hover:border-gold-500 transition group"
              >
                <Link href={`/products/${prod.handle}`} className="block">
                  <div className="relative aspect-square w-full bg-surface-card border-b border-chrome-200/60 overflow-hidden">
                    <Image
                      src={prod.thumbnail}
                      alt={prod.title}
                      fill
                      sizes="(max-width: 768px) 46vw, 240px"
                      className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                    />
                    {off > 0 && (
                      <span className="absolute top-2 left-2 rounded-xs bg-commerce-deal px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-ink-inverse">
                        {off}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-3 pb-1 space-y-0.5">
                    <p className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-gold-700 truncate">
                      {prod.metadata.brand}
                    </p>
                    <h4 className="font-display text-xs sm:text-sm font-bold text-ink-primary group-hover:text-gold-700 line-clamp-2 min-h-[2.25rem] leading-snug">
                      {formatTitleWithoutBrand(prod.title, prod.metadata.brand)}
                    </h4>
                  </div>
                </Link>

                <div className="px-3 pb-3 pt-1.5 flex items-center justify-between gap-2">
                  <div className="tabular-nums min-w-0">
                    <span className="font-display text-sm sm:text-base font-bold text-ink-primary block leading-none">
                      {formatINR(price)}
                    </span>
                    {mrp > price && (
                      <span className="text-[11px] text-ink-muted line-through">
                        {formatINR(mrp)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickAdd(prod)}
                    aria-label={`Add ${prod.title} to cart`}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition active:scale-90 ${
                      added
                        ? 'bg-commerce-savings text-ink-inverse'
                        : 'bg-obsidian-900 text-gold-500 hover:bg-obsidian-800'
                    }`}
                  >
                    {added ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

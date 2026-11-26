'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Plus, ShoppingCart, Sparkles } from 'lucide-react'
import type { StorefrontProduct } from '@mobile-station/types'
import { ALL_PRODUCTS, getCategoryRoute } from '@/lib/catalog'
import { formatINR } from '@/lib/format'
import { EMPTY_BEHAVIOR_PROFILE } from '@/lib/recommendations/behavior'
import { getPdpRecommendations } from '@/lib/recommendations/engine'
import { useCart } from '@/components/CartContext'
import { useOptionalBehavior } from '@/context/BehaviorContext'
import { MinimalProductCard } from '@/components/catalog/MinimalProductCard'

interface PdpRecommendationsSectionProps {
  product: StorefrontProduct
  categoryName?: string
}

/**
 * Clean PDP Recommendations:
 * 1. "Complete Your Setup": Minimal, clutter-free compatible accessory cards with quick + Add
 * 2. "Similar Alternatives": Simple homepage MinimalProductCard items without explanation text
 */
export function PdpRecommendationsSection({
  product,
  categoryName,
}: PdpRecommendationsSectionProps) {
  const { items: cartItems, addItem, openCart } = useCart()
  const behavior = useOptionalBehavior()
  const profile = behavior?.profile ?? EMPTY_BEHAVIOR_PROFILE

  const { completeSetup, similarAlternatives } = useMemo(
    () => getPdpRecommendations(product, ALL_PRODUCTS, profile, cartItems, 4, 4),
    [product, profile, cartItems]
  )

  const handleAddSingleAccessory = (accessory: StorefrontProduct) => {
    const variant = accessory.variants[0]
    if (!variant) return
    addItem({
      sku: variant.sku,
      productHandle: accessory.handle,
      title: accessory.title,
      variantTitle: variant.title,
      brand: accessory.metadata.brand,
      price_paise: variant.price_paise,
      mrp_paise: variant.mrp_paise,
      thumbnail: accessory.thumbnail,
      requires_open_box_delivery: accessory.metadata.requires_open_box_delivery,
    })
    openCart()
  }

  const handleAddCompleteBundle = () => {
    const primaryVariant = product.variants[0]
    if (primaryVariant) {
      addItem({
        sku: primaryVariant.sku,
        productHandle: product.handle,
        title: product.title,
        variantTitle: primaryVariant.title,
        brand: product.metadata.brand,
        price_paise: primaryVariant.price_paise,
        mrp_paise: primaryVariant.mrp_paise,
        thumbnail: product.thumbnail,
        requires_open_box_delivery: product.metadata.requires_open_box_delivery,
      })
    }
    for (const entry of completeSetup.slice(0, 2)) {
      const variant = entry.product.variants[0]
      if (!variant) continue
      addItem({
        sku: variant.sku,
        productHandle: entry.product.handle,
        title: entry.product.title,
        variantTitle: variant.title,
        brand: entry.product.metadata.brand,
        price_paise: variant.price_paise,
        mrp_paise: variant.mrp_paise,
        thumbnail: entry.product.thumbnail,
        requires_open_box_delivery: entry.product.metadata.requires_open_box_delivery,
      })
    }
    openCart()
  }

  return (
    <div className="space-y-10">
      {/* 1. Complete Your Setup — Simple, Clean Companion Add-ons */}
      {completeSetup.length > 0 && (
        <section
          aria-label="Complete Your Setup"
          className="rounded-lg border border-chrome-200 bg-surface-card p-4 sm:p-5 shadow-card space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink-primary">
                Complete Your Setup
              </h2>
              <p className="text-xs text-ink-muted">
                Compatible accessories for {product.title}
              </p>
            </div>

            {completeSetup.length >= 2 && (
              <button
                type="button"
                onClick={handleAddCompleteBundle}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-sm bg-obsidian-900 px-3.5 py-2 text-xs font-bold text-gold-500 hover:bg-obsidian-800 transition shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add Bundle ({1 + Math.min(2, completeSetup.length)})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {completeSetup.map(({ product: acc }) => {
              const variant = acc.variants[0]
              const price = variant?.price_paise ?? 0
              const mrp = variant?.mrp_paise ?? price

              return (
                <div
                  key={acc.handle}
                  className="rounded-md border border-chrome-200 bg-surface-canvas p-3 flex flex-col justify-between gap-3 hover:border-gold-500 transition"
                >
                  <Link href={`/products/${acc.handle}`} className="space-y-2.5 group">
                    <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-surface-card border border-chrome-200/70">
                      <Image
                        src={acc.thumbnail}
                        alt={acc.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 1024px) 44vw, 220px"
                        className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted truncate">
                        {acc.metadata.brand}
                      </p>
                      <h3 className="font-display text-xs sm:text-sm font-bold text-ink-primary group-hover:text-gold-700 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] leading-snug">
                        {acc.title}
                      </h3>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-chrome-200/70">
                    <div className="tabular-nums min-w-0">
                      <span className="font-display text-sm font-bold text-ink-primary block leading-none">
                        {formatINR(price)}
                      </span>
                      {mrp > price && (
                        <span className="text-[10.5px] text-ink-muted line-through">
                          {formatINR(mrp)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSingleAccessory(acc)}
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-sm bg-gold-500 px-2.5 py-1.5 text-xs font-bold text-obsidian-950 hover:bg-gold-600 transition shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 2. Similar Alternatives — Simple MinimalProductCard Matching Homepage */}
      {similarAlternatives.length > 0 && (
        <section aria-label="Similar Alternatives" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-obsidian-900 text-gold-500 shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink-primary truncate">
                Similar Alternatives {categoryName ? `in ${categoryName}` : ''}
              </h2>
            </div>

            <Link
              href={getCategoryRoute(product.category_handle)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline whitespace-nowrap shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {similarAlternatives.map(({ product: simProd }) => (
              <MinimalProductCard key={simProd.handle} product={simProd} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, Layers, Plus, ShoppingCart, Sparkles } from 'lucide-react'
import type { StorefrontProduct } from '@mobile-station/types'
import { ALL_PRODUCTS } from '@/lib/catalog'
import { discountPercent, formatINR } from '@/lib/format'
import { EMPTY_BEHAVIOR_PROFILE } from '@/lib/recommendations/behavior'
import { getPdpRecommendations } from '@/lib/recommendations/engine'
import { useCart } from '@/components/CartContext'
import { useOptionalBehavior } from '@/context/BehaviorContext'
import { ProductCard } from '@/components/ProductCard'

interface PdpRecommendationsSectionProps {
  product: StorefrontProduct
  categoryName?: string
}

/**
 * Renders two researched PDP recommendation bands:
 * 1. Verified Compatible Accessories ("Complete Your Setup") with 1-click bundle & add
 * 2. Spec & Price-Tier Similar Alternatives ranked via Content Similarity + MMR
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
      {/* 1. Complete Your Setup — Verified Compatible Accessories */}
      {completeSetup.length > 0 && (
        <section
          aria-label="Complete Your Setup Compatible Accessories"
          className="rounded-lg border border-chrome-200 bg-surface-card p-4 sm:p-6 shadow-card space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-commerce-obdBg px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-commerce-obdText">
                <CheckCircle2 className="w-3 h-3" />
                <span>Compatibility Verified for {product.metadata.brand}</span>
              </span>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold-700 shrink-0" />
                <h2 className="font-display text-lg sm:text-xl font-bold text-ink-primary">
                  Complete Your Setup
                </h2>
              </div>
              <p className="text-xs text-ink-muted">
                Essential chargers, audio &amp; ecosystem add-ons matched to {product.title}
              </p>
            </div>

            {completeSetup.length >= 2 && (
              <button
                type="button"
                onClick={handleAddCompleteBundle}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-bold text-gold-500 hover:bg-obsidian-800 transition shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add Device + Top {Math.min(2, completeSetup.length)} Add-ons</span>
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {completeSetup.map(({ product: acc, reason, explanation }) => {
              const variant = acc.variants[0]
              const price = variant?.price_paise ?? 0
              const mrp = variant?.mrp_paise ?? price
              const off = discountPercent(mrp, price)

              return (
                <div
                  key={acc.handle}
                  className="rounded-md border border-chrome-200 bg-surface-canvas p-3 flex flex-col justify-between gap-3 hover:border-gold-500 transition"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="rounded-full bg-gold-100 text-gold-700 px-2 py-0.5 font-mono text-[9.5px] font-bold">
                        {reason}
                      </span>
                      {off > 0 && (
                        <span className="font-mono text-[10px] font-bold text-commerce-savings">
                          Save {off}%
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/products/${acc.handle}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative w-16 h-16 rounded-xs border border-chrome-200 bg-surface-card shrink-0 overflow-hidden">
                        <Image
                          src={acc.thumbnail}
                          alt={acc.title}
                          fill
                          sizes="64px"
                          className="object-contain p-1.5 group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] text-ink-muted uppercase">
                          {acc.metadata.brand}
                        </p>
                        <h3 className="font-display text-xs font-bold text-ink-primary group-hover:text-gold-700 line-clamp-2 leading-snug">
                          {acc.title}
                        </h3>
                      </div>
                    </Link>

                    <p className="text-[11px] text-ink-secondary line-clamp-2">{explanation}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-chrome-200/80">
                    <div className="tabular-nums">
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
                      onClick={() => handleAddSingleAccessory(acc)}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-sm bg-gold-500 px-3 py-1.5 text-xs font-bold text-obsidian-950 hover:bg-gold-600 transition shrink-0"
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

      {/* 2. Spec & Price-Tier Similar Alternatives */}
      {similarAlternatives.length > 0 && (
        <section aria-label="Similar Spec and Price Alternatives" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gold-700">
                <Sparkles className="w-3 h-3" />
                <span>Spec &amp; Tier Comparison</span>
              </span>
              <h2 className="font-display text-xl font-bold text-ink-primary">
                Similar Alternatives {categoryName ? `in ${categoryName}` : ''}
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarAlternatives.map(({ product: simProd, reason, explanation }) => (
              <div key={simProd.handle} className="space-y-1.5 flex flex-col">
                <div className="px-2 py-1 rounded-xs bg-surface-muted border border-chrome-200 flex items-center justify-between gap-2">
                  <span className="font-mono text-[9.5px] font-bold text-gold-700 uppercase truncate">
                    {reason}
                  </span>
                  <span className="text-[10px] text-ink-muted truncate">{explanation}</span>
                </div>
                <div className="flex-1 flex flex-col">
                  <ProductCard product={simProd} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

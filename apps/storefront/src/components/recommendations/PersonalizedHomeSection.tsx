'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { RecommendationReasonTag, StorefrontProduct } from '@mobile-station/types'
import { useCart } from '@/components/CartContext'
import { useOptionalBehavior } from '@/context/BehaviorContext'
import { discountPercent, formatINR, formatTitleWithoutBrand } from '@/lib/format'
import { getHomeRecommendations } from '@/lib/recommendations/engine'

interface PersonalizedHomeSectionProps {
  products: StorefrontProduct[]
}

const COMPACT_REASON_LABELS: Record<RecommendationReasonTag, string> = {
  'Same Brand Ecosystem': 'For You',
  'Inspired By Browsing': 'Picked',
  'Pairs Well With': 'Pairs Well',
  'Accessory Essential': 'Essential',
  'Top Value Deal': 'Deal',
  'Popular In Hub': 'Popular',
  'Spec Match': 'Similar',
}

/**
 * Adaptive homepage recommendation grid combining browsing affinity, cart compatibility,
 * and clean normalized card headers without duplicate brand prefixes or verbose text.
 */
export function PersonalizedHomeSection({ products }: PersonalizedHomeSectionProps) {
  const { items: cartItems } = useCart()
  const behavior = useOptionalBehavior()

  const profile = behavior?.profile
  const hasSignals = Boolean(behavior?.hasPersonalizedSignals || cartItems.length > 0)

  const recommendations = useMemo(() => {
    if (!profile) return []
    return getHomeRecommendations(products, profile, cartItems, {}, 8)
  }, [products, profile, cartItems])

  if (!profile || recommendations.length === 0) return null

  return (
    <section
      aria-label="Personalized Electronics Recommendations"
      className="page-container py-5 sm:py-7 space-y-4 border-b border-chrome-200/70"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg sm:text-2xl font-bold text-ink-primary">
          {hasSignals ? 'Recommended For You' : 'Top Picks For You'}
        </h2>
        <span className="font-mono text-[10.5px] font-medium text-ink-muted shrink-0">
          {hasSignals ? 'Based on your activity' : 'Popular hardware'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {recommendations.map(({ product, reason }) => {
          const activeVariant = product.variants[0]
          const pricePaise = activeVariant?.price_paise ?? 0
          const mrpPaise = activeVariant?.mrp_paise ?? pricePaise
          const off = discountPercent(mrpPaise, pricePaise)
          const cleanTitle = formatTitleWithoutBrand(product.title, product.metadata.brand)
          const badgeText = COMPACT_REASON_LABELS[reason]

          return (
            <Link
              key={product.handle}
              href={`/products/${product.handle}`}
              className="group rounded-md border border-chrome-200 bg-surface-card p-3 sm:p-3.5 shadow-card hover:shadow-card-hover hover:border-gold-500 transition flex flex-col justify-between gap-2.5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1 min-h-[20px]">
                  <span className="rounded-full bg-surface-muted border border-chrome-200 text-ink-secondary px-1.5 py-0.5 font-mono text-[9px] font-medium truncate">
                    {badgeText}
                  </span>
                  {off > 0 && (
                    <span className="rounded-full bg-commerce-errorBg text-commerce-errorText px-1.5 py-0.5 font-mono text-[9.5px] font-bold shrink-0">
                      -{off}%
                    </span>
                  )}
                </div>

                <div className="relative aspect-[5/4] sm:aspect-square w-full overflow-hidden rounded-sm bg-surface-card">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
                    className="object-contain p-2 sm:p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-700 truncate">
                    {product.metadata.brand}
                  </p>
                  <h3 className="font-display text-xs sm:text-sm font-bold leading-snug text-ink-primary group-hover:text-gold-700 transition-colors line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
                    {cleanTitle}
                  </h3>
                </div>
              </div>

              <div className="pt-2 border-t border-chrome-200/70 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums">
                <span className="font-display text-sm sm:text-base font-bold text-ink-primary">
                  {formatINR(pricePaise)}
                </span>
                {mrpPaise > pricePaise && (
                  <span className="text-[11px] text-ink-muted line-through">
                    {formatINR(mrpPaise)}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { History, RotateCcw, Sparkles } from 'lucide-react'
import type { StorefrontProduct } from '@mobile-station/types'
import { useCart } from '@/components/CartContext'
import { useOptionalBehavior } from '@/context/BehaviorContext'
import { discountPercent, formatINR } from '@/lib/format'
import { getHomeRecommendations } from '@/lib/recommendations/engine'

interface PersonalizedHomeSectionProps {
  products: StorefrontProduct[]
}

/**
 * Adaptive homepage recommendation strip combining time-decayed browsing affinity,
 * cart compatibility, cold-start quality picks, and MMR multi-category diversity.
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

  const recentlyViewedProducts = useMemo(() => {
    if (!profile || profile.recentlyViewedHandles.length === 0) return []
    return profile.recentlyViewedHandles
      .map((handle) => products.find((p) => p.handle === handle))
      .filter((p): p is StorefrontProduct => Boolean(p))
      .slice(0, 6)
  }, [products, profile])

  if (!profile || recommendations.length === 0) return null

  const topBrands = Object.entries(profile.preferredBrands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([brand]) => brand.charAt(0).toUpperCase() + brand.slice(1))

  return (
    <section
      aria-label="Personalized Electronics Recommendations"
      className="page-container py-6 sm:py-8 space-y-6 border-b border-chrome-200/70"
    >
      {/* Recently Viewed Strip when user has viewed products */}
      {recentlyViewedProducts.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
              <History className="w-3.5 h-3.5 text-gold-700" />
              <span>Recently Viewed</span>
            </div>
            {behavior && (
              <button
                type="button"
                onClick={behavior.clearBehaviorHistory}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted hover:text-gold-700 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {recentlyViewedProducts.map((product) => {
              const price = product.variants[0]?.price_paise ?? 0
              return (
                <Link
                  key={product.handle}
                  href={`/products/${product.handle}`}
                  className="shrink-0 w-[210px] sm:w-[230px] flex items-center gap-2.5 rounded-md border border-chrome-200 bg-surface-card p-2 hover:border-gold-500 transition shadow-card"
                >
                  <div className="relative w-11 h-11 rounded-xs border border-chrome-200 bg-surface-card shrink-0 overflow-hidden">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      sizes="44px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[11px] font-bold text-ink-primary truncate">
                      {product.title}
                    </p>
                    <p className="font-mono text-[11px] font-semibold text-gold-700 tabular-nums">
                      {formatINR(price)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Personalized / Hybrid Recommendations Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-900 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-500">
              <Sparkles className="w-3 h-3" />
              <span>{hasSignals ? 'Smart Hybrid Recommendations' : 'Curated Top Electronics'}</span>
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-primary">
              {hasSignals ? 'Recommended For You' : 'Top Recommended Flagships & Gear'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">
              {hasSignals && topBrands.length > 0
                ? `Tailored from your session activity across ${topBrands.join(' & ')} with diversified compatible gear.`
                : 'Balanced multi-category hardware picks ranked by value, specs, and live Muzaffarpur Hub availability.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {recommendations.map(({ product, reason, explanation }) => {
            const activeVariant = product.variants[0]
            const pricePaise = activeVariant?.price_paise ?? 0
            const mrpPaise = activeVariant?.mrp_paise ?? pricePaise
            const off = discountPercent(mrpPaise, pricePaise)

            return (
              <Link
                key={product.handle}
                href={`/products/${product.handle}`}
                className="group rounded-md border border-chrome-200 bg-surface-card p-3 sm:p-3.5 shadow-card hover:shadow-card-hover hover:border-gold-500 transition flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-1 min-h-[22px]">
                    <span className="rounded-full bg-obsidian-900/90 text-gold-500 px-1.5 sm:px-2 py-0.5 font-mono text-[8.5px] sm:text-[9.5px] font-semibold truncate">
                      {reason}
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

                  <div className="space-y-1">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-700 truncate">
                      {product.metadata.brand}
                    </p>
                    <h3 className="font-display text-xs sm:text-sm font-bold leading-snug text-ink-primary group-hover:text-gold-700 transition-colors line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-ink-muted line-clamp-1">{explanation}</p>
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
      </div>
    </section>
  )
}

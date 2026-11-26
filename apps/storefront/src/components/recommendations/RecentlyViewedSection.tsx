'use client'

import React, { useMemo } from 'react'
import { History } from 'lucide-react'
import type { StorefrontProduct } from '@mobile-station/types'
import { useOptionalBehavior } from '@/context/BehaviorContext'
import { MinimalProductCard } from '@/components/catalog/MinimalProductCard'

interface RecentlyViewedSectionProps {
  products: StorefrontProduct[]
  maxItems?: number
}

/**
 * Full-card Recently Viewed showcase formatted identically to other catalog product sections,
 * with permanent session-persisted history (no history clear option).
 */
export function RecentlyViewedSection({
  products,
  maxItems = 10,
}: RecentlyViewedSectionProps) {
  const behavior = useOptionalBehavior()
  const profile = behavior?.profile

  const recentlyViewedProducts = useMemo(() => {
    if (!profile || profile.recentlyViewedHandles.length === 0) return []
    const productByHandle = new Map(products.map((product) => [product.handle, product]))
    const matched: StorefrontProduct[] = []
    for (const handle of profile.recentlyViewedHandles) {
      const product = productByHandle.get(handle)
      if (product) {
        matched.push(product)
        if (matched.length >= maxItems) break
      }
    }
    return matched
  }, [products, profile, maxItems])

  if (recentlyViewedProducts.length === 0) return null

  return (
    <section
      aria-label="Recently Viewed Items"
      className="page-container py-6 sm:py-8 space-y-4 border-b border-chrome-200/70"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-obsidian-900 text-gold-500 shrink-0">
            <History className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-primary truncate">
              Recently Viewed Items
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">
              Devices and accessories from your browsing history
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {recentlyViewedProducts.map((product) => (
          <MinimalProductCard key={product.handle} product={product} />
        ))}
      </div>
    </section>
  )
}

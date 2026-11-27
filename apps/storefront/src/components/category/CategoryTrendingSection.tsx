'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import type { StorefrontCategory, StorefrontProduct } from '@mobile-station/types'
import { MinimalProductCard } from '@/components/catalog/MinimalProductCard'

interface CategoryTrendingSectionProps {
  category: StorefrontCategory
  trendingProducts: StorefrontProduct[]
}

/**
 * Top section for every dedicated category page displaying up to 10 trending products
 * in a clean minimal-card two-row horizontal shelf (3x2 = 6 visible + horizontal swipe on
 * mobile; 5x2 = 10 cards on desktop) without inline specification or policy clutter.
 */
export function CategoryTrendingSection({
  category,
  trendingProducts,
}: CategoryTrendingSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const useTwoRows = trendingProducts.length >= 6

  const updateScrollEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    const raf = window.requestAnimationFrame(updateScrollEdges)
    window.addEventListener('resize', updateScrollEdges, { passive: true })
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', updateScrollEdges)
    }
  }, [updateScrollEdges, trendingProducts.length])

  const scrollTrack = (direction: 'prev' | 'next') => {
    const el = trackRef.current
    if (!el) return
    const step = Math.max(180, Math.round(el.clientWidth * 0.85))
    el.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    })
  }

  if (trendingProducts.length === 0) return null

  const gridClass = useTwoRows
    ? 'grid grid-flow-col grid-rows-2 auto-cols-[calc((100%-16px)/3)] gap-2 sm:auto-cols-[calc((100%-36px)/4)] sm:gap-3 lg:grid-flow-row lg:grid-rows-none lg:grid-cols-5 lg:auto-cols-auto lg:gap-3.5 lg:overflow-visible overflow-x-auto snap-x snap-mandatory touch-pan-x no-scrollbar pb-1 lg:pb-0'
    : 'grid grid-flow-col grid-rows-1 auto-cols-[calc((100%-16px)/3)] gap-2 sm:auto-cols-[calc((100%-36px)/4)] sm:gap-3 lg:grid-flow-row lg:grid-rows-none lg:grid-cols-5 lg:auto-cols-auto lg:gap-3.5 lg:overflow-visible overflow-x-auto snap-x snap-mandatory touch-pan-x no-scrollbar pb-1 lg:pb-0'

  return (
    <section
      aria-label={`Top Trending ${category.name}`}
      className="page-container pt-5 pb-4 sm:pt-6 sm:pb-6 space-y-3 sm:space-y-4 border-b border-chrome-200/80"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-sm bg-obsidian-900 text-gold-500 shrink-0">
            <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <h2 className="font-display text-[15px] sm:text-xl font-bold text-ink-primary truncate">
            Top Trending {category.name}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`rounded-full bg-surface-muted border border-chrome-200 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-ink-secondary tabular-nums ${
              canScrollLeft || canScrollRight ? 'hidden sm:inline-flex' : 'inline-flex'
            }`}
          >
            Top {trendingProducts.length}
          </span>
          {(canScrollLeft || canScrollRight) && (
            <div className="flex items-center gap-1 lg:hidden">
              <button
                type="button"
                onClick={() => scrollTrack('prev')}
                disabled={!canScrollLeft}
                aria-label={`Scroll trending ${category.name} left`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-chrome-300 bg-surface-card text-ink-primary disabled:opacity-35 hover:border-gold-500 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrack('next')}
                disabled={!canScrollRight}
                aria-label={`Scroll trending ${category.name} right`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-chrome-300 bg-surface-card text-ink-primary disabled:opacity-35 hover:border-gold-500 transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={trackRef} onScroll={updateScrollEdges} className={gridClass}>
        {trendingProducts.map((product) => (
          <MinimalProductCard
            key={product.handle}
            product={product}
            compact
            className="snap-start"
          />
        ))}
      </div>
    </section>
  )
}

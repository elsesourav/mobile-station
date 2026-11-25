'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { StorefrontCategory, StorefrontProduct } from '@mobile-station/types'
import { CategoryIcon } from '@/components/icons/CategoryIcons'
import { MinimalProductCard } from '@/components/catalog/MinimalProductCard'

interface CategoryProductRailProps {
  category: StorefrontCategory
  products: StorefrontProduct[]
}

/**
 * Horizontal category product strip with touch/mouse drag-to-scroll on mobile
 * and circular left/right slider arrows on tablet and desktop viewports.
 */
export function CategoryProductRail({ category, products }: CategoryProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const didDragRef = useRef(false)

  const updateScrollEdges = useCallback(() => {
    const el = railRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollEdges()
    window.addEventListener('resize', updateScrollEdges, { passive: true })
    return () => window.removeEventListener('resize', updateScrollEdges)
  }, [updateScrollEdges, products.length])

  const scrollByDirection = (direction: 'prev' | 'next') => {
    const el = railRef.current
    if (!el) return
    const step = Math.max(240, Math.round(el.clientWidth * 0.72))
    el.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = railRef.current
    if (!el || e.button !== 0) return
    isDraggingRef.current = true
    didDragRef.current = false
    startXRef.current = e.pageX - el.offsetLeft
    scrollLeftRef.current = el.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const el = railRef.current
    if (!el) return
    const x = e.pageX - el.offsetLeft
    const walk = (x - startXRef.current) * 1.15
    if (Math.abs(walk) > 6) {
      didDragRef.current = true
    }
    el.scrollLeft = scrollLeftRef.current - walk
  }

  const stopDrag = () => {
    isDraggingRef.current = false
  }

  const handleTrackClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (didDragRef.current) {
      e.preventDefault()
      e.stopPropagation()
      didDragRef.current = false
    }
  }

  if (products.length === 0) return null

  return (
    <section
      aria-label={`${category.name} products`}
      className="page-container py-5 space-y-3.5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-obsidian-900 text-gold-500 shrink-0">
            <CategoryIcon
              name={category.name}
              handle={category.handle}
              iconKey={category.icon}
              className="w-4 h-4"
            />
          </span>
          <h2 className="font-display text-lg sm:text-xl font-bold text-ink-primary truncate">
            {category.name}
          </h2>
        </div>

        <Link
          href={`/categories/${category.handle}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline whitespace-nowrap shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="relative group/rail">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByDirection('prev')}
            aria-label={`Scroll ${category.name} left`}
            title="Scroll left"
            className="hidden md:flex absolute left-1.5 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-9 h-9 rounded-full bg-obsidian-900/90 text-ink-inverse border border-gold-500/40 shadow-card hover:border-gold-500 hover:scale-105 active:scale-95 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByDirection('next')}
            aria-label={`Scroll ${category.name} right`}
            title="Scroll right"
            className="hidden md:flex absolute right-1.5 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-9 h-9 rounded-full bg-obsidian-900/90 text-ink-inverse border border-gold-500/40 shadow-card hover:border-gold-500 hover:scale-105 active:scale-95 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div
          ref={railRef}
          onScroll={updateScrollEdges}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onClickCapture={handleTrackClickCapture}
          onDragStart={(e) => e.preventDefault()}
          className="flex gap-3 sm:gap-4 overflow-x-auto touch-pan-x no-scrollbar scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing py-0.5"
        >
          {products.map((product) => (
            <MinimalProductCard
              key={product.handle}
              product={product}
              className="shrink-0 w-[46%] min-w-[164px] sm:w-[31%] md:w-[28%] lg:w-[23.5%] xl:w-[19%] snap-start"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

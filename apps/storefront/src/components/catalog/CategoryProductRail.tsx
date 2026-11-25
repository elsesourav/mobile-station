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

function RailArrowButton({
  direction,
  categoryName,
  onClick,
}: {
  direction: 'prev' | 'next'
  categoryName: string
  onClick: () => void
}) {
  const isPrev = direction === 'prev'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Scroll ${categoryName} ${isPrev ? 'left' : 'right'}`}
      title={isPrev ? 'Scroll left' : 'Scroll right'}
      className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-surface-card/95 backdrop-blur-xs text-ink-primary border border-chrome-300 shadow-card cursor-pointer opacity-0 pointer-events-none transition-all duration-200 ease-out group-hover/rail:opacity-100 group-hover/rail:translate-x-0 group-hover/rail:pointer-events-auto group-focus-within/rail:opacity-100 group-focus-within/rail:translate-x-0 group-focus-within/rail:pointer-events-auto hover:bg-obsidian-900 hover:text-gold-500 hover:border-gold-500 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
        isPrev ? 'left-1.5 -translate-x-1.5' : 'right-1.5 translate-x-1.5'
      }`}
    >
      {isPrev ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
  )
}

/**
 * Horizontal category product strip with touch/mouse drag-to-scroll on mobile/tablet
 * and hover-activated UI-themed slider arrows on desktop.
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
      className="group/rail page-container py-5 space-y-3.5"
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

      <div className="relative">
        {canScrollLeft && (
          <RailArrowButton
            direction="prev"
            categoryName={category.name}
            onClick={() => scrollByDirection('prev')}
          />
        )}

        {canScrollRight && (
          <RailArrowButton
            direction="next"
            categoryName={category.name}
            onClick={() => scrollByDirection('next')}
          />
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
          className="flex gap-3 sm:gap-4 overflow-x-auto touch-pan-x ms-scrollbar-x scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing pt-0.5 pb-2.5"
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

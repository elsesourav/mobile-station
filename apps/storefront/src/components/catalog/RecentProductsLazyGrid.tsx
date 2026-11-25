'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { StorefrontProduct } from '@mobile-station/types'
import { MinimalProductCard } from '@/components/catalog/MinimalProductCard'

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

export function resolveRecentProductsLimit(
  isDesktop: boolean,
  availableCount: number,
  mobileLimit = 50,
  desktopLimit = 100
): number {
  const cap = isDesktop ? desktopLimit : mobileLimit
  return Math.max(0, Math.min(availableCount, cap))
}

interface RecentProductsLazyGridProps {
  products: StorefrontProduct[]
  mobileLimit?: number
  desktopLimit?: number
  batchSize?: number
  staggerMs?: number
}

/**
 * Displays recently updated products lazily by device viewport (up to 50 on mobile/tablet
 * and up to 100 on desktop when available), unlocking batches on scroll and revealing slowly one by one.
 */
export function RecentProductsLazyGrid({
  products,
  mobileLimit = 50,
  desktopLimit = 100,
  batchSize = 8,
  staggerMs = 170,
}: RecentProductsLazyGridProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const updateMatches = () => setIsDesktop(media.matches)
    updateMatches()
    media.addEventListener('change', updateMatches)
    return () => media.removeEventListener('change', updateMatches)
  }, [])

  const targetLimit = resolveRecentProductsLimit(
    isDesktop,
    products.length,
    mobileLimit,
    desktopLimit
  )

  const cappedProducts = useMemo(
    () => products.slice(0, targetLimit),
    [products, targetLimit]
  )
  const totalCount = cappedProducts.length

  const sectionRef = useRef<HTMLElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isSentinelVisibleRef = useRef(false)

  const [hasEntered, setHasEntered] = useState(false)
  const [batchLimit, setBatchLimit] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)

  // Keep counts bounded when viewport switches between mobile (50) and desktop (100)
  useEffect(() => {
    setBatchLimit((prev) => Math.min(prev, totalCount))
    setRevealedCount((prev) => Math.min(prev, totalCount))
  }, [totalCount])

  // Start loading the first batch once the section enters near the viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el || hasEntered || totalCount === 0) return

    if (typeof IntersectionObserver === 'undefined') {
      setHasEntered(true)
      setBatchLimit(totalCount)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEntered(true)
          setBatchLimit((prev) => Math.max(prev, Math.min(totalCount, batchSize)))
          observer.disconnect()
        }
      },
      { rootMargin: '120px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasEntered, totalCount, batchSize])

  // Unlock additional lazy batches as the bottom sentinel enters the viewport
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasEntered || totalCount === 0) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting)
        isSentinelVisibleRef.current = visible
        if (visible) {
          setBatchLimit((prev) => {
            if (prev >= totalCount) return prev
            return Math.min(totalCount, prev + batchSize)
          })
        }
      },
      { rootMargin: '200px 0px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasEntered, totalCount, batchSize])

  // Slowly reveal unlocked cards one by one
  useEffect(() => {
    if (!hasEntered || revealedCount >= batchLimit) return

    const timer = window.setTimeout(() => {
      setRevealedCount((prev) => Math.min(batchLimit, prev + 1))
    }, staggerMs)

    return () => window.clearTimeout(timer)
  }, [hasEntered, revealedCount, batchLimit, staggerMs])

  // Continue unlocking next batch when user stays scrolled near the sentinel
  useEffect(() => {
    if (
      hasEntered &&
      revealedCount >= batchLimit &&
      batchLimit < totalCount &&
      isSentinelVisibleRef.current
    ) {
      setBatchLimit((prev) => Math.min(totalCount, prev + batchSize))
    }
  }, [hasEntered, revealedCount, batchLimit, totalCount, batchSize])

  if (totalCount === 0) return null

  const visibleProducts = cappedProducts.slice(0, revealedCount)
  const remainingCount = totalCount - revealedCount
  const placeholderCount = hasEntered ? Math.min(4, remainingCount) : 4

  return (
    <section
      id="recent-products"
      ref={sectionRef}
      aria-label="Recently Updated Products"
      className="page-container scroll-mt-28 py-8 space-y-5"
    >
      <div className="border-t border-chrome-200 pt-7">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-primary">
          Recently Updated Products
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
          Tap any product to view full specifications, variants &amp; availability
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {visibleProducts.map((product) => (
          <MinimalProductCard
            key={product.handle}
            product={product}
            className="ms-lazy-card-enter"
          />
        ))}

        {Array.from({ length: placeholderCount }).map((_, idx) => (
          <div
            key={`lazy-skeleton-${idx}`}
            aria-hidden="true"
            className="rounded-md border border-chrome-200 bg-surface-card p-3 sm:p-3.5 space-y-3 animate-pulse"
          >
            <div className="aspect-square w-full rounded-sm bg-surface-muted" />
            <div className="space-y-2">
              <div className="h-3.5 w-4/5 rounded-xs bg-surface-muted" />
              <div className="h-3.5 w-2/5 rounded-xs bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} aria-hidden="true" className="h-2 w-full" />
    </section>
  )
}

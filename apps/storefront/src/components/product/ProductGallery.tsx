'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import type { ProductGallerySlide } from '@/lib/product-gallery'

interface ProductGalleryProps {
  title: string
  slides: readonly ProductGallerySlide[]
  visualKey: string
  discountPercent?: number
  stockCount?: number
  lowStockThreshold?: number
}

/**
 * Sticky multi-image hardware gallery:
 * - Resets slide position only when `visualKey` changes (e.g. finish/color change)
 * - Fullscreen lightbox rendered cleanly via portal over the entire window (including header)
 * - Isolated `lightboxIndex` prevents fullscreen navigation from altering inline PDP slides
 */
export function ProductGallery({
  title,
  slides,
  visualKey,
  discountPercent = 0,
  stockCount,
  lowStockThreshold = 5,
}: ProductGalleryProps) {
  const totalSlides = slides.length
  const extendedSlides = useMemo(() => {
    if (totalSlides <= 1) return [...slides]
    return [slides[totalSlides - 1], ...slides, slides[0]]
  }, [slides, totalSlides])

  const [displayIndex, setDisplayIndex] = useState<number>(totalSlides > 1 ? 1 : 0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isPortalMounted, setIsPortalMounted] = useState(false)

  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const dragDeltaRef = useRef(0)
  const isPointerDownRef = useRef(false)
  const isLockedRef = useRef<'none' | 'horizontal' | 'vertical'>('none')
  const capturedPointerIdRef = useRef<number | null>(null)
  const prevVisualKeyRef = useRef<string>(visualKey)

  useEffect(() => {
    setIsPortalMounted(true)
  }, [])

  // Only reset active gallery slide when the visual product/color changes, never on storage/RAM changes
  useEffect(() => {
    if (prevVisualKeyRef.current !== visualKey) {
      prevVisualKeyRef.current = visualKey
      setIsTransitioning(false)
      setDisplayIndex(totalSlides > 1 ? 1 : 0)
    } else if (totalSlides <= 1) {
      setDisplayIndex(0)
    }
  }, [visualKey, totalSlides])

  const activeRealIndex =
    totalSlides > 1 ? (displayIndex - 1 + totalSlides) % totalSlides : 0
  const activeSlide = slides[activeRealIndex] ?? slides[0]
  const activeLightboxSlide = slides[lightboxIndex] ?? slides[0]

  const openLightbox = () => {
    setLightboxIndex(activeRealIndex)
    setIsLightboxOpen(true)
  }

  const handleNext = useCallback(() => {
    if (totalSlides <= 1) return
    setIsTransitioning(true)
    setDisplayIndex((prev) => prev + 1)
  }, [totalSlides])

  const handlePrev = useCallback(() => {
    if (totalSlides <= 1) return
    setIsTransitioning(true)
    setDisplayIndex((prev) => prev - 1)
  }, [totalSlides])

  const handleGoTo = useCallback(
    (targetIdx: number) => {
      if (totalSlides <= 1) return
      setIsTransitioning(true)
      setDisplayIndex(targetIdx + 1)
    },
    [totalSlides]
  )

  const handleLightboxPrev = useCallback(() => {
    if (totalSlides <= 1) return
    setLightboxIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  const handleLightboxNext = useCallback(() => {
    if (totalSlides <= 1) return
    setLightboxIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const handleTransitionEnd = useCallback(() => {
    if (totalSlides <= 1) return
    if (displayIndex >= totalSlides + 1) {
      setIsTransitioning(false)
      setDisplayIndex(1)
    } else if (displayIndex <= 0) {
      setIsTransitioning(false)
      setDisplayIndex(totalSlides)
    }
  }, [displayIndex, totalSlides])

  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsTransitioning(true))
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [isTransitioning])

  useEffect(() => {
    if (!isLightboxOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false)
      else if (e.key === 'ArrowRight') handleLightboxNext()
      else if (e.key === 'ArrowLeft') handleLightboxPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [isLightboxOpen, handleLightboxNext, handleLightboxPrev])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (totalSlides <= 1) return
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if ((e.target as HTMLElement).closest('button')) return

    isPointerDownRef.current = true
    isLockedRef.current = 'none'
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    dragDeltaRef.current = 0
    capturedPointerIdRef.current = null
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return
    const diffX = e.clientX - startXRef.current
    const diffY = e.clientY - startYRef.current

    if (isLockedRef.current === 'vertical') return

    if (isLockedRef.current === 'none') {
      if (Math.abs(diffX) <= 8 && Math.abs(diffY) <= 8) return
      if (Math.abs(diffY) >= Math.abs(diffX)) {
        isLockedRef.current = 'vertical'
        isPointerDownRef.current = false
        return
      }
      isLockedRef.current = 'horizontal'
      setIsDragging(true)
      setDragOffset(0)
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
        capturedPointerIdRef.current = e.pointerId
      } catch {
        // Ignore pointer capture failure
      }
    }

    if (isLockedRef.current === 'horizontal') {
      dragDeltaRef.current = diffX
      setDragOffset(diffX)
    }
  }

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current && isLockedRef.current !== 'horizontal') return
    if (capturedPointerIdRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(capturedPointerIdRef.current)
      } catch {
        // Ignore release error
      }
      capturedPointerIdRef.current = null
    }
    const wasHorizontal = isLockedRef.current === 'horizontal'
    const delta = dragDeltaRef.current

    isPointerDownRef.current = false
    isLockedRef.current = 'none'
    setIsDragging(false)
    setDragOffset(0)

    if (wasHorizontal) {
      if (delta < -42) handleNext()
      else if (delta > 42) handlePrev()
    }
  }

  const isLowStock =
    typeof stockCount === 'number' && stockCount > 0 && stockCount <= lowStockThreshold

  const lightboxModal =
    isLightboxOpen && activeLightboxSlide ? (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title} fullscreen preview`}
        onClick={() => setIsLightboxOpen(false)}
        className="fixed inset-0 z-[100050] bg-obsidian-950/92 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
      >
        {/* Top Bar with ONLY ONE Close Button */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between gap-4 text-ink-inverse max-w-5xl w-full mx-auto"
        >
          <div className="min-w-0">
            <p className="font-display text-sm sm:text-base font-bold truncate">{title}</p>
            <p className="font-mono text-[11px] text-gold-500">
              {activeLightboxSlide.label} · {lightboxIndex + 1} of {totalSlides}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close fullscreen preview"
            className="w-10 h-10 rounded-full border border-chrome-400/40 bg-obsidian-900 text-ink-inverse hover:border-gold-500 hover:text-gold-500 flex items-center justify-center shrink-0 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Image Container (click outside closes modal, inside controls isolate state) */}
        <div className="relative flex-1 my-4 flex items-center justify-center">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-full max-w-3xl max-h-[74vh] rounded-lg bg-surface-card overflow-hidden shadow-modal"
          >
            <Image
              src={activeLightboxSlide.src}
              alt={activeLightboxSlide.alt}
              fill
              unoptimized={activeLightboxSlide.isPreTransformed}
              sizes="90vw"
              className="object-contain p-4 sm:p-6"
            />
          </div>

          {totalSlides > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLightboxPrev()
                }}
                aria-label="Previous image in lightbox"
                className="absolute left-1 sm:left-4 w-10 h-10 rounded-full bg-obsidian-900/95 border border-chrome-400/40 text-ink-inverse hover:border-gold-500 hover:text-gold-500 flex items-center justify-center transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLightboxNext()
                }}
                aria-label="Next image in lightbox"
                className="absolute right-1 sm:right-4 w-10 h-10 rounded-full bg-obsidian-900/95 border border-chrome-400/40 text-ink-inverse hover:border-gold-500 hover:text-gold-500 flex items-center justify-center transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Independent Lightbox Thumbnail Switcher */}
        {totalSlides > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 overflow-x-auto pb-1 max-w-2xl mx-auto"
          >
            {slides.map((slide, idx) => (
              <button
                key={`lb-thumb-${slide.id}-${idx}`}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`Fullscreen ${slide.label}`}
                className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-sm overflow-hidden border-2 bg-surface-card transition ${
                  idx === lightboxIndex
                    ? 'border-gold-500 scale-105'
                    : 'border-obsidian-700 opacity-65 hover:opacity-100'
                }`}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  unoptimized={slide.isPreTransformed}
                  sizes="56px"
                  className="object-contain p-0.5"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    ) : null

  return (
    <div className="w-full space-y-3">
      {/* Main Carousel Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{ cursor: totalSlides > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        className="relative aspect-square sm:aspect-[10/9] lg:aspect-square max-h-[480px] w-full rounded-lg overflow-hidden bg-surface-card border border-chrome-200 shadow-card group select-none touch-pan-y"
      >
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex h-full w-full will-change-transform"
          style={{
            transform: `translateX(calc(-${displayIndex * 100}% + ${dragOffset}px))`,
            transition:
              isDragging || !isTransitioning
                ? 'none'
                : 'transform 280ms cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {extendedSlides.map((slide, idx) => (
            <div
              key={`${slide.id}-${idx}`}
              onClick={() => {
                if (Math.abs(dragDeltaRef.current) < 5) openLightbox()
              }}
              className="relative min-w-full w-full h-full shrink-0 flex items-center justify-center p-4 sm:p-7"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                unoptimized={slide.isPreTransformed}
                draggable={false}
                priority={idx === 1 || totalSlides <= 1}
                sizes="(max-width: 1024px) 95vw, 520px"
                className="object-contain p-3 sm:p-5 select-none pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Top Badges & Zoom Trigger */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5">
            {discountPercent > 0 && (
              <span className="rounded-full bg-commerce-deal px-2.5 py-1 text-[11px] font-bold text-ink-inverse shadow-card">
                {discountPercent}% OFF
              </span>
            )}
            {typeof stockCount === 'number' && (
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold border border-chrome-200/70 ${
                  isLowStock
                    ? 'bg-commerce-warningBg text-commerce-warningText'
                    : 'bg-commerce-obdBg text-commerce-obdText'
                }`}
              >
                {stockCount > 0 ? `${stockCount} In Stock` : 'Out of Stock'}
              </span>
            )}
          </div>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              openLightbox()
            }}
            aria-label="Open fullscreen product photo"
            className="pointer-events-auto w-8 h-8 rounded-full bg-surface-card/90 hover:bg-surface-card border border-chrome-300 text-ink-primary flex items-center justify-center shadow-card hover:border-gold-500 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Left / Right Slide Controls */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              aria-label="Previous product image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-card/90 hover:bg-obsidian-900 text-ink-primary hover:text-gold-500 border border-chrome-300 flex items-center justify-center shadow-card transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              aria-label="Next product image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-card/90 hover:bg-obsidian-900 text-ink-primary hover:text-gold-500 border border-chrome-300 flex items-center justify-center shadow-card transition active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Bottom Subtle Counter */}
        {activeSlide && (
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-900/85 backdrop-blur-xs px-2.5 py-1 font-mono text-[10px] font-medium text-gold-500 border border-gold-500/30">
              <span>{activeSlide.label}</span>
              {totalSlides > 1 && (
                <span className="text-chrome-300">
                  {activeRealIndex + 1}/{totalSlides}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Dots & Thumbnail Strip */}
      {totalSlides > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            {slides.map((slide, idx) => (
              <button
                key={`dot-${slide.id}-${idx}`}
                type="button"
                onClick={() => handleGoTo(idx)}
                aria-label={`View ${slide.label}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeRealIndex
                    ? 'w-5 bg-obsidian-900'
                    : 'w-1.5 bg-chrome-300 hover:bg-chrome-400'
                }`}
              />
            ))}
          </div>

          <div
            role="region"
            aria-label="Product gallery thumbnails"
            className="flex items-center gap-2 overflow-x-auto pb-1 ms-scrollbar-x"
          >
            {slides.map((slide, idx) => {
              const selected = idx === activeRealIndex
              return (
                <button
                  key={`thumb-${slide.id}-${idx}`}
                  type="button"
                  onClick={() => handleGoTo(idx)}
                  aria-label={`Select ${slide.label}`}
                  aria-current={selected ? 'true' : undefined}
                  className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 bg-surface-card transition ${
                    selected
                      ? 'border-obsidian-900 ring-2 ring-gold-500/40'
                      : 'border-chrome-200 opacity-75 hover:opacity-100 hover:border-gold-500'
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    unoptimized={slide.isPreTransformed}
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {isPortalMounted && lightboxModal ? createPortal(lightboxModal, document.body) : null}
    </div>
  )
}

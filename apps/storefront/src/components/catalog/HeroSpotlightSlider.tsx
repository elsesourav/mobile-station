'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSpotlightSliderProps } from '@/types/storefront'

function SliderArrowButton({
  direction,
  onClick,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
}) {
  const isPrev = direction === 'prev'

  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      title={isPrev ? 'Previous slide' : 'Next slide'}
      aria-label={isPrev ? 'Previous banner slide' : 'Next banner slide'}
      className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-30 items-center justify-center w-9 h-9 rounded-full bg-obsidian-900/90 text-ink-inverse border border-gold-500/40 shadow-card cursor-pointer opacity-0 pointer-events-none transition-all duration-200 ease-out group-hover/hero-slider:opacity-100 group-hover/hero-slider:translate-x-0 group-hover/hero-slider:pointer-events-auto group-focus-within/hero-slider:opacity-100 group-focus-within/hero-slider:translate-x-0 group-focus-within/hero-slider:pointer-events-auto hover:border-gold-500 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
        isPrev ? 'left-3 lg:left-4 -translate-x-2' : 'right-3 lg:right-4 translate-x-2'
      }`}
    >
      {isPrev ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
    </button>
  )
}

/**
 * Pure image-only responsive card carousel whose height scales proportionally with card width
 * across mobile, tablet, and multi-card desktop screens without cropping.
 */
export function HeroSpotlightSlider({
  heroBanners,
  activeHeroIdx,
  onSelectHero,
  autoPlayIntervalMs = 6000,
  className = '',
}: HeroSpotlightSliderProps) {
  const activeBanners = useMemo(
    () => heroBanners.filter((banner) => banner.is_active !== false),
    [heroBanners]
  )
  const slidesCount = activeBanners.length
  const extendedSlides = useMemo(() => {
    if (slidesCount <= 1) return activeBanners
    // Prefix last slide and duplicate full sequence on the right so multi-card desktop viewports never expose empty space during wraps.
    return [activeBanners[slidesCount - 1], ...activeBanners, ...activeBanners]
  }, [activeBanners, slidesCount])

  const initialDisplayIndex =
    slidesCount > 1
      ? Math.min(slidesCount, Math.max(1, (activeHeroIdx ?? 0) + 1))
      : 0

  const [displayIndex, setDisplayIndex] = useState(initialDisplayIndex)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setDisplayIndex((current) => {
      if (slidesCount <= 1) return 0
      if (current > slidesCount) return 1
      if (current < 1) return 1
      return current
    })
  }, [slidesCount])

  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)
  const dragDeltaRef = useRef<number>(0)
  const didDragRef = useRef<boolean>(false)
  const isPointerDownRef = useRef<boolean>(false)
  const isLockedRef = useRef<'none' | 'horizontal' | 'vertical'>('none')
  const capturedPointerIdRef = useRef<number | null>(null)

  const activeRealIndex =
    slidesCount > 1 ? (displayIndex - 1 + slidesCount) % slidesCount : 0

  useEffect(() => {
    onSelectHero?.(activeRealIndex)
  }, [activeRealIndex, onSelectHero])

  const handleNext = useCallback(() => {
    if (slidesCount <= 1) return
    setIsTransitioning(true)
    setDisplayIndex((prev) => prev + 1)
  }, [slidesCount])

  const handlePrev = useCallback(() => {
    if (slidesCount <= 1) return
    setIsTransitioning(true)
    setDisplayIndex((prev) => prev - 1)
  }, [slidesCount])

  const handleGoTo = useCallback(
    (targetRealIndex: number) => {
      if (slidesCount <= 1) return
      setIsTransitioning(true)
      setDisplayIndex(targetRealIndex + 1)
    },
    [slidesCount]
  )

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || slidesCount <= 1) return
      if (displayIndex >= slidesCount + 1) {
        setIsTransitioning(false)
        setDisplayIndex(1)
      } else if (displayIndex <= 0) {
        setIsTransitioning(false)
        setDisplayIndex(slidesCount)
      }
    },
    [displayIndex, slidesCount]
  )

  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true)
        })
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [isTransitioning])

  useEffect(() => {
    if (isPaused || isDragging || slidesCount <= 1) return
    const timer = setInterval(handleNext, autoPlayIntervalMs)
    return () => clearInterval(timer)
  }, [isPaused, isDragging, slidesCount, autoPlayIntervalMs, handleNext])

  const gestureThreshold = 8

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (slidesCount <= 1) return
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if ((e.target as HTMLElement).closest('button')) return

    isPointerDownRef.current = true
    isLockedRef.current = 'none'
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    dragDeltaRef.current = 0
    didDragRef.current = false
    capturedPointerIdRef.current = null
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return
    const diffX = e.clientX - startXRef.current
    const diffY = e.clientY - startYRef.current

    if (isLockedRef.current === 'vertical') return

    if (isLockedRef.current === 'none') {
      const absX = Math.abs(diffX)
      const absY = Math.abs(diffY)
      if (absX <= gestureThreshold && absY <= gestureThreshold) return

      if (absY >= absX) {
        isLockedRef.current = 'vertical'
        isPointerDownRef.current = false
        return
      }

      isLockedRef.current = 'horizontal'
      didDragRef.current = true
      setIsDragging(true)
      setIsPaused(true)
      setDragOffset(0)
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
        capturedPointerIdRef.current = e.pointerId
      } catch {
        // Ignore pointer capture rejection on unsupported browsers
      }
    }

    if (isLockedRef.current === 'horizontal') {
      dragDeltaRef.current = diffX
      setDragOffset(diffX)
    }
  }

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>, commitSlide: boolean) => {
    if (capturedPointerIdRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(capturedPointerIdRef.current)
      } catch {
        // Ignore if capture was already released
      }
      capturedPointerIdRef.current = null
    }

    const wasHorizontal = isLockedRef.current === 'horizontal'
    const deltaX = dragDeltaRef.current

    isPointerDownRef.current = false
    isLockedRef.current = 'none'
    setIsDragging(false)
    setIsPaused(false)
    setDragOffset(0)

    if (commitSlide && wasHorizontal) {
      if (deltaX < -40) handleNext()
      else if (deltaX > 40) handlePrev()
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current && isLockedRef.current !== 'horizontal') return
    finishDrag(e, true)
  }

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(e, false)
  }

  if (slidesCount === 0) return null

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Homepage Spotlight Slider"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setIsPaused(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse' && !isDragging) setIsPaused(false)
      }}
      className={`group/hero-slider w-full bg-surface-canvas pt-4 sm:pt-5 pb-1.5 select-none ${className}`}
    >
      <div className="page-container">
        <div
          className="relative -mx-1.5 sm:-mx-2 [--slide-step:100%] lg:[--slide-step:43.5%]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onDragStart={(e) => e.preventDefault()}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="overflow-hidden touch-pan-y">
            {/* Circular Infinite Card Track */}
            <div
              onTransitionEnd={handleTransitionEnd}
              onDragStart={(e) => e.preventDefault()}
              className="flex w-full will-change-transform items-stretch"
              style={{
                transform: `translateX(calc(-${displayIndex} * var(--slide-step) + ${dragOffset}px))`,
                transition:
                  isDragging || !isTransitioning
                    ? 'none'
                    : 'transform 500ms cubic-bezier(0.33, 1, 0.68, 1)',
              }}
            >
              {extendedSlides.map((slide, idx) => {
                const isClone =
                  slidesCount > 1 && (idx === 0 || idx > slidesCount)
                const desktopImg = slide.image_url
                const mobileImg = slide.mobile_image_url || slide.image_url
                const hasCustomMobileImg = Boolean(
                  slide.mobile_image_url && slide.mobile_image_url !== slide.image_url
                )
                const label = slide.alt || `Promotional banner ${idx + 1}`

                const cardMedia = (
                  <div className="group relative w-full rounded-lg sm:rounded-xl overflow-hidden bg-obsidian-900 border border-chrome-200/80 shadow-card">
                    {hasCustomMobileImg ? (
                      <>
                        <Image
                          src={mobileImg}
                          alt={isClone ? '' : label}
                          width={1376}
                          height={768}
                          priority={idx === 1}
                          sizes="95vw"
                          draggable={false}
                          className="block md:hidden w-full h-auto select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <Image
                          src={desktopImg}
                          alt={isClone ? '' : label}
                          width={1376}
                          height={768}
                          priority={idx <= 2}
                          sizes="(max-width: 1023px) 95vw, 45vw"
                          draggable={false}
                          className="hidden md:block w-full h-auto select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </>
                    ) : (
                      <Image
                        src={desktopImg}
                        alt={isClone ? '' : label}
                        width={1376}
                        height={768}
                        priority={idx <= 2}
                        sizes="(max-width: 1023px) 95vw, 45vw"
                        draggable={false}
                        className="block w-full h-auto select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                )

                return (
                  <div
                    key={`${slide.id}-${idx}`}
                    aria-hidden={isClone ? 'true' : undefined}
                    className="shrink-0 w-[var(--slide-step)] px-1.5 sm:px-2"
                  >
                    {slide.cta_route ? (
                      <Link
                        href={slide.cta_route}
                        aria-label={isClone ? undefined : label}
                        tabIndex={isClone ? -1 : 0}
                        draggable={false}
                        onClick={(e) => {
                          if (didDragRef.current) {
                            e.preventDefault()
                            didDragRef.current = false
                          }
                        }}
                        className="block rounded-lg sm:rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                      >
                        {cardMedia}
                      </Link>
                    ) : (
                      cardMedia
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Floating Circular Tablet & Desktop Navigation Arrows */}
          {slidesCount > 1 && (
            <>
              <SliderArrowButton direction="prev" onClick={handlePrev} />
              <SliderArrowButton direction="next" onClick={handleNext} />
            </>
          )}
        </div>

          {/* Upgraded Obsidian Capsule Progress Indicator Dock */}
          {slidesCount > 1 && (
            <div className="mt-1.5 sm:mt-2 flex items-center justify-center">
              <div
                className="inline-flex items-center rounded-full bg-obsidian-900 px-2.5 py-1 border border-obsidian-800 shadow-card"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  {activeBanners.map((slide, idx) => {
                    const isActive = idx === activeRealIndex
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGoTo(idx)
                        }}
                        aria-label={`Go to slide ${idx + 1}${slide.alt ? `: ${slide.alt}` : ''}`}
                        className="group flex items-center justify-center py-1 px-0.5 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
                      >
                        <div
                          className={`h-[7px] sm:h-[8px] rounded-full transition-all duration-300 ease-out ${
                            isActive
                              ? 'w-10 sm:w-12 overflow-hidden relative bg-obsidian-700 ring-1 ring-gold-500/40'
                              : 'w-2.5 sm:w-3 bg-obsidian-700 group-hover:bg-chrome-400'
                          }`}
                        >
                          {isActive && (
                            <div
                              key={`hero-progress-${displayIndex}`}
                              className="h-full w-full bg-gradient-to-r from-gold-600 to-gold-500 origin-left rounded-full hero-progress-bar"
                              style={{
                                animationDuration: `${autoPlayIntervalMs}ms`,
                                animationPlayState: isPaused || isDragging ? 'paused' : 'running',
                              }}
                            />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
      </div>
    </section>
  )
}

'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import type { HeroSpotlightSliderProps } from '@/types/storefront'
import { HeroValuePropsRibbon } from '@/components/catalog/HeroValuePropsRibbon'

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
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 items-center justify-center w-[42px] h-[42px] rounded-full bg-obsidian-900/90 text-ink-inverse border border-gold-500/40 cursor-pointer hover:border-gold-500 hover:scale-110 active:scale-90 transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
        isPrev ? 'left-4 lg:left-6' : 'right-4 lg:right-6'
      }`}
    >
      {isPrev ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
    </button>
  )
}

/**
 * Full-width responsive homepage carousel mirroring Glorov's infinite circular HeroBannerSlider
 * with 2-axis touch swipe disambiguation, floating desktop arrows, and animated progress pills.
 */
export function HeroSpotlightSlider({
  heroBanners,
  activeHeroIdx,
  onSelectHero,
  offers,
  categoryCount,
  trustBadges,
  autoPlayIntervalMs = 6000,
  className = '',
}: HeroSpotlightSliderProps) {
  const slidesCount = heroBanners.length
  const extendedSlides = useMemo(() => {
    if (slidesCount <= 1) return heroBanners
    return [heroBanners[slidesCount - 1], ...heroBanners, heroBanners[0]]
  }, [heroBanners, slidesCount])

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

  const handleTransitionEnd = useCallback(() => {
    if (slidesCount <= 1) return
    if (displayIndex >= slidesCount + 1) {
      setIsTransitioning(false)
      setDisplayIndex(1)
    } else if (displayIndex <= 0) {
      setIsTransitioning(false)
      setDisplayIndex(slidesCount)
    }
  }, [displayIndex, slidesCount])

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
    if ((e.target as HTMLElement).closest('button, a')) return

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
      const absX = Math.abs(diffX)
      const absY = Math.abs(diffY)
      if (absX <= gestureThreshold && absY <= gestureThreshold) return

      if (absY >= absX) {
        isLockedRef.current = 'vertical'
        isPointerDownRef.current = false
        return
      }

      isLockedRef.current = 'horizontal'
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

  if (heroBanners.length === 0) return null

  return (
    <>
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
        className={`relative w-full overflow-hidden select-none bg-obsidian-950 ${className}`}
      >
        <div
          className="relative w-full h-[430px] sm:h-[450px] md:h-[400px] lg:h-[450px] xl:h-[480px] overflow-hidden touch-pan-y"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onDragStart={(e) => e.preventDefault()}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Circular Infinite Track */}
          <div
            onTransitionEnd={handleTransitionEnd}
            onDragStart={(e) => e.preventDefault()}
            className="flex h-full w-full will-change-transform"
            style={{
              transform: `translateX(calc(-${displayIndex * 100}% + ${dragOffset}px))`,
              transition:
                isDragging || !isTransitioning
                  ? 'none'
                  : 'transform 500ms cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            {extendedSlides.map((slide, idx) => {
              const isClone =
                slidesCount > 1 && (idx === 0 || idx === extendedSlides.length - 1)
              const desktopImg = slide.image_url
              const mobileImg = slide.mobile_image_url || slide.image_url

              return (
                <div
                  key={`${slide.id}-${idx}`}
                  aria-hidden={isClone ? 'true' : undefined}
                  className="relative w-full h-full shrink-0 overflow-hidden bg-obsidian-900"
                >
                  {mobileImg && (
                    <div className="block md:hidden w-full h-full relative">
                      <Image
                        src={mobileImg}
                        alt={isClone ? '' : slide.title}
                        fill
                        priority={idx === 1}
                        sizes="100vw"
                        draggable={false}
                        className="object-cover object-center select-none pointer-events-none"
                      />
                    </div>
                  )}

                  {desktopImg && (
                    <div className="hidden md:block w-full h-full relative">
                      <Image
                        src={desktopImg}
                        alt={isClone ? '' : slide.title}
                        fill
                        priority={idx === 1}
                        sizes="100vw"
                        draggable={false}
                        className="object-cover object-center select-none pointer-events-none"
                      />
                    </div>
                  )}

                  {/* Contrast-Safe Responsive Scrim */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/75 to-obsidian-950/25 md:bg-gradient-to-r md:from-obsidian-950/95 md:via-obsidian-950/75 md:to-transparent"
                  />

                  {/* Slide Content Safe Zone */}
                  <div className="absolute inset-0 z-10 flex items-end md:items-center">
                    <div className="w-full max-w-content mx-auto px-5 pb-14 pt-6 md:px-20 md:py-10">
                      <div className="max-w-lg space-y-2.5 sm:space-y-3.5">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 border border-gold-500/40 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-gold-500">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>{slide.tag}</span>
                        </div>

                        {idx === 1 && !isClone ? (
                          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-ink-inverse leading-tight">
                            {slide.title}
                          </h1>
                        ) : (
                          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-ink-inverse leading-tight">
                            {slide.title}
                          </h2>
                        )}

                        <p className="text-xs sm:text-sm md:text-base text-chrome-200 leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {slide.subtitle}
                        </p>

                        <div className="pt-1 flex flex-wrap items-center gap-3">
                          <Link
                            href={slide.cta_route}
                            tabIndex={isClone ? -1 : 0}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-gold-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-obsidian-950 hover:bg-gold-600 transition shadow-gold"
                          >
                            <span>{slide.cta_text}</span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </Link>

                          <Link
                            href="/offers"
                            tabIndex={isClone ? -1 : 0}
                            className="hidden sm:inline-flex min-h-[44px] items-center rounded-sm border border-chrome-300/35 bg-obsidian-900/75 px-4 py-2.5 text-xs font-semibold text-ink-inverse hover:border-gold-500 hover:text-gold-500 transition"
                          >
                            Bank Offers &amp; 18% GST
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Floating Circular Desktop Navigation Arrows */}
          {slidesCount > 1 && (
            <>
              <SliderArrowButton direction="prev" onClick={handlePrev} />
              <SliderArrowButton direction="next" onClick={handleNext} />
            </>
          )}

          {/* Bottom Animated Indicator Pills with Progress Bar */}
          {slidesCount > 1 && (
            <div className="absolute bottom-4 sm:bottom-5 left-0 right-0 z-30 flex items-center justify-center pointer-events-auto">
              <div
                className="flex items-center bg-obsidian-950/75 backdrop-blur-sm px-2.5 py-1 rounded-full border border-chrome-200/15"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {heroBanners.map((slide, idx) => {
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
                      aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                      className="group flex items-center justify-center p-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 cursor-pointer rounded-full"
                    >
                      <div
                        className={`h-[6px] rounded-full transition-all duration-300 ease-out ${
                          isActive
                            ? 'w-[34px] overflow-hidden relative bg-gold-500/35 ring-1 ring-gold-500/50'
                            : 'w-2.5 bg-chrome-200/75 group-hover:bg-ink-inverse'
                        }`}
                      >
                        {isActive && (
                          <div
                            key={`hero-progress-${displayIndex}`}
                            className="h-full w-full bg-gold-500 origin-left rounded-full hero-progress-bar"
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
          )}
        </div>
      </section>

      <HeroValuePropsRibbon
        trustBadges={trustBadges}
        offers={offers}
        categoryCount={categoryCount}
      />
    </>
  )
}

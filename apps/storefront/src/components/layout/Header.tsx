'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BatteryCharging,
  Headphones,
  Keyboard,
  Laptop,
  LayoutGrid,
  Menu,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Tablet,
} from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { ALL_CATEGORIES } from '@/lib/catalog'
import { useCart } from '@/components/CartContext'
import { useOptionalHeaderScroll } from '@/context/HeaderScrollContext'
import { RotatingSearchBar } from '@/components/layout/RotatingSearchBar'
import type { StorefrontHeaderProps } from '@/types/storefront'

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Keyboard,
  BatteryCharging,
  ShieldCheck,
}

const NAV_SHORT_NAMES: Record<string, string> = {
  smartphones: 'Smartphones',
  tablets: 'Tablets',
  laptops: 'Laptops',
  audio: 'Audio & TWS',
  'keyboards-mice': 'Keyboards & Mice',
  'power-charging': 'Power & GaN',
  'accessories-storage': 'Cases & Watch',
}

/**
 * Glorov-style 3-tier Obsidian Header:
 * 1. Top 3px brushed gold hairline bar.
 * 2. Top row with contrast-safe wordmark, pill search with rotating keywords, and right actions.
 * 3. Horizontally scrollable Category Strip with collapsible icon badges & edge fade gradients.
 */
export function Header({
  activeCategoryHandle,
  searchValue = '',
  onSearchChange,
  onCategorySelect,
  onSearchSubmit,
  onOpenMobileMenu,
  className = '',
}: StorefrontHeaderProps) {
  const pathname = usePathname()
  const { totalCount, openCart } = useCart()
  const headerScroll = useOptionalHeaderScroll()

  const showIcons = headerScroll ? headerScroll.showIcons : true
  const selectedCategory = headerScroll?.selectedCategory ?? ''
  const setSelectedCategory = headerScroll?.setSelectedCategory

  const categoryNavRef = useRef<HTMLElement>(null)
  const [leftFadeOpacity, setLeftFadeOpacity] = useState(0)
  const [rightFadeOpacity, setRightFadeOpacity] = useState(0)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const hasDraggedRef = useRef(false)

  const updateCategoryFades = useCallback(() => {
    const el = categoryNavRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    const fadeDistance = 32

    if (maxScroll <= 1) {
      setLeftFadeOpacity(0)
      setRightFadeOpacity(0)
      return
    }
    setLeftFadeOpacity(Math.min(1, Math.max(0, scrollLeft / fadeDistance)))
    setRightFadeOpacity(Math.min(1, Math.max(0, (maxScroll - scrollLeft) / fadeDistance)))
  }, [])

  useEffect(() => {
    updateCategoryFades()
    window.addEventListener('resize', updateCategoryFades, { passive: true })
    return () => window.removeEventListener('resize', updateCategoryFades)
  }, [updateCategoryFades, pathname, showIcons])

  const handleCategoryScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      if (e.currentTarget.scrollTop !== 0) e.currentTarget.scrollTop = 0
      updateCategoryFades()
    },
    [updateCategoryFades]
  )

  const handleCategoryMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = categoryNavRef.current
    if (!el) return
    isDraggingRef.current = true
    startXRef.current = e.pageX - el.offsetLeft
    scrollLeftRef.current = el.scrollLeft
    hasDraggedRef.current = false
  }, [])

  const handleCategoryMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isDraggingRef.current) return
      const el = categoryNavRef.current
      if (!el) return
      const x = e.pageX - el.offsetLeft
      const walk = (x - startXRef.current) * 1.3
      if (Math.abs(walk) > 4) hasDraggedRef.current = true
      el.scrollLeft = scrollLeftRef.current - walk
      updateCategoryFades()
    },
    [updateCategoryFades]
  )

  const handleCategoryMouseUpOrLeave = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleQueryUpdate = useCallback(
    (q: string) => {
      if (onSearchChange) onSearchChange(q)
    },
    [onSearchChange]
  )

  const renderCategoryItem = (
    id: string,
    handle: string,
    label: string,
    href: string,
    IconComponent: React.ComponentType<{ className?: string }>,
    isActive: boolean
  ) => {
    const iconBadge = (
      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] overflow-hidden flex items-center justify-center ${
          showIcons
            ? 'h-[26px] opacity-100 scale-100 mb-0.5'
            : 'h-0 opacity-0 scale-75 mb-0 pointer-events-none'
        }`}
      >
        <div
          className={`px-2.5 sm:px-3 py-0.5 rounded-md transition-all duration-200 flex items-center justify-center ${
            isActive
              ? 'bg-gold-500/20 text-gold-500'
              : 'bg-transparent text-chrome-300 group-hover:bg-obsidian-800 group-hover:text-gold-500'
          }`}
        >
          <IconComponent
            className={`w-[17px] h-[17px] transition-colors duration-150 ${
              isActive ? 'text-gold-500' : 'text-chrome-300 group-hover:text-gold-500'
            }`}
          />
        </div>
      </div>
    )

    const innerContent = (
      <>
        {iconBadge}
        <span
          className={`text-center transition-all duration-200 leading-tight whitespace-nowrap ${
            showIcons ? 'text-[11px] sm:text-[11.5px] lg:text-xs' : 'text-xs'
          } ${
            isActive
              ? 'font-bold text-gold-500'
              : 'font-semibold text-chrome-300 group-hover:text-ink-inverse'
          }`}
        >
          {label}
        </span>
        <span
          className={`mt-0.5 h-[2.5px] rounded-full transition-all duration-200 ${
            isActive ? 'w-6 bg-gold-500' : 'w-0 group-hover:w-3.5 group-hover:bg-gold-500/50'
          }`}
        />
      </>
    )

    if (onCategorySelect) {
      return (
        <button
          key={id}
          type="button"
          onClick={() => {
            if (hasDraggedRef.current) return
            setSelectedCategory?.(handle)
            onCategorySelect(handle)
          }}
          className="group relative flex flex-col items-center justify-center px-2.5 sm:px-3 lg:px-4 py-0.5 rounded-md transition-all duration-200 select-none active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
        >
          {innerContent}
        </button>
      )
    }

    return (
      <Link
        key={id}
        href={href}
        onClick={(e) => {
          if (hasDraggedRef.current) {
            e.preventDefault()
            return
          }
          setSelectedCategory?.(handle)
        }}
        className="group relative flex flex-col items-center justify-center px-2.5 sm:px-3 lg:px-4 py-0.5 rounded-md transition-all duration-200 select-none active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
      >
        {innerContent}
      </Link>
    )
  }

  return (
    <header className={`w-full bg-obsidian-900 text-ink-inverse border-b border-obsidian-800 ${className}`}>
      <div aria-hidden="true" className="h-[3px] w-full bg-gold-500 shrink-0" />

      {/* 1. Desktop Top Row (>= 1024px) */}
      <div className="hidden lg:flex w-full h-[60px] items-center bg-obsidian-900 px-6">
        <div className="w-full max-w-content mx-auto flex items-center justify-between gap-6">
          <Link
            href="/"
            aria-label="Mobile Station Home"
            onClick={() => {
              setSelectedCategory?.('all')
              if (onCategorySelect) onCategorySelect('all')
            }}
            className="flex items-center gap-2.5 shrink-0 rounded-md py-1 pr-1 hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <Image
              src={MOBILE_STATION_BRAND.assets.icon}
              alt="MS emblem"
              width={44}
              height={22}
              className="h-7 w-auto shrink-0 object-contain select-none"
              priority
            />
            <Image
              src={MOBILE_STATION_BRAND.assets.wordmark}
              alt="Mobile Station"
              width={210}
              height={24}
              className="h-6 w-auto object-contain select-none"
              priority
            />
          </Link>

          <RotatingSearchBar
            value={searchValue}
            onChange={handleQueryUpdate}
            onSubmit={onSearchSubmit}
            isDesktop
            ariaLabel="Search electronics catalog"
            clearAriaLabel="Clear search"
            className="flex-1 max-w-2xl"
          />

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/feedback"
              className="inline-flex items-center rounded-full border border-obsidian-700 bg-obsidian-800 px-3 py-1.5 text-xs font-medium text-chrome-200 hover:border-gold-500 hover:text-gold-500 transition whitespace-nowrap"
            >
              Video Reviews
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center rounded-full border border-obsidian-700 bg-obsidian-800 px-3 py-1.5 text-xs font-medium text-chrome-200 hover:border-gold-500 hover:text-gold-500 transition whitespace-nowrap"
            >
              Store Gallery
            </Link>
            <Link
              href="/offers"
              className="inline-flex items-center rounded-full border border-obsidian-700 bg-obsidian-800 px-3 py-1.5 text-xs font-medium text-chrome-200 hover:border-gold-500 hover:text-gold-500 transition whitespace-nowrap"
            >
              Offers &amp; GST
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Cart, ${totalCount} items`}
              title="Open Shopping Cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full border border-obsidian-700 bg-obsidian-800 text-chrome-200 hover:border-gold-500 hover:text-gold-500 active:scale-90 transition"
            >
              <ShoppingCart className="w-[19px] h-[19px]" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold-500 text-obsidian-950 text-[10px] font-bold flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mobile & Tablet Single Top Row (< 1024px) */}
      <div className="flex lg:hidden w-full h-[52px] items-center bg-obsidian-900 px-2.5 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open store navigation menu"
            className="flex items-center justify-center w-9 h-9 rounded-full text-chrome-200 hover:bg-obsidian-800 hover:text-gold-500 active:scale-90 transition shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            href="/"
            aria-label="Mobile Station Home"
            onClick={() => {
              setSelectedCategory?.('all')
              if (onCategorySelect) onCategorySelect('all')
            }}
            className="flex items-center gap-1.5 shrink-0 rounded py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
          >
            <Image
              src={MOBILE_STATION_BRAND.assets.icon}
              alt="MS emblem"
              width={40}
              height={22}
              className="h-6 w-auto shrink-0 object-contain select-none"
              priority
            />
            <Image
              src={MOBILE_STATION_BRAND.assets.wordmark}
              alt="Mobile Station"
              width={180}
              height={22}
              className="hidden sm:block h-5 w-auto object-contain select-none"
              priority
            />
          </Link>

          <RotatingSearchBar
            value={searchValue}
            onChange={handleQueryUpdate}
            onSubmit={onSearchSubmit}
            isDesktop={false}
            ariaLabel="Search electronics on mobile"
            clearAriaLabel="Clear mobile search"
            className="flex-1 min-w-0"
          />

          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart, ${totalCount} items`}
            className="relative flex items-center justify-center w-9 h-9 rounded-full text-chrome-200 hover:bg-obsidian-800 hover:text-gold-500 active:scale-90 transition shrink-0"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 rounded-full bg-gold-500 text-obsidian-950 text-[9.5px] font-bold flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div aria-hidden="true" className="h-[1px] w-full bg-obsidian-800 shrink-0" />

      {/* 3. Horizontally Scrollable Collapsible Category Navigation Strip */}
      <div className="relative w-full bg-obsidian-900 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 z-10 pointer-events-none bg-gradient-to-r from-obsidian-900 via-obsidian-900/80 to-transparent transition-opacity duration-150 ease-out"
          style={{ opacity: leftFadeOpacity }}
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 z-10 pointer-events-none bg-gradient-to-l from-obsidian-900 via-obsidian-900/80 to-transparent transition-opacity duration-150 ease-out"
          style={{ opacity: rightFadeOpacity }}
        />

        <nav
          ref={categoryNavRef}
          aria-label="Primary categories"
          onScroll={handleCategoryScroll}
          onMouseDown={handleCategoryMouseDown}
          onMouseMove={handleCategoryMouseMove}
          onMouseUp={handleCategoryMouseUpOrLeave}
          onMouseLeave={handleCategoryMouseUpOrLeave}
          className={`w-full bg-obsidian-900 overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar transition-[height] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] select-none overscroll-x-contain cursor-grab active:cursor-grabbing ${
            showIcons ? 'h-[62px]' : 'h-[38px]'
          }`}
        >
          <div className="w-max min-w-full max-w-content mx-auto h-full flex items-center justify-start sm:justify-center px-3 sm:px-4 lg:px-6 gap-1 sm:gap-2 lg:gap-3">
            {renderCategoryItem(
              'cat-all',
              'all',
              'All Tech',
              '/',
              LayoutGrid,
              activeCategoryHandle
                ? activeCategoryHandle === 'all'
                : pathname === '/' && (!selectedCategory || selectedCategory === 'all')
            )}

            {ALL_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICON_MAP[category.icon] ?? Smartphone
              const label = NAV_SHORT_NAMES[category.handle] ?? category.name
              const isActive =
                activeCategoryHandle === category.handle ||
                pathname === `/categories/${category.handle}` ||
                selectedCategory === category.handle

              return renderCategoryItem(
                category.id,
                category.handle,
                label,
                `/categories/${category.handle}`,
                Icon,
                isActive
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  )
}

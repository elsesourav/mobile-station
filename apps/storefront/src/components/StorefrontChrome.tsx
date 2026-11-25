'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Search, ShoppingCart, X } from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { ALL_ANNOUNCEMENTS, ALL_CATEGORIES } from '@/lib/catalog'
import { useCart } from '@/components/CartContext'

const NAV_SHORT_NAMES: Record<string, string> = {
  smartphones: 'Smartphones',
  tablets: 'Tablets',
  laptops: 'Laptops & Monitors',
  audio: 'Audio & Earphones',
  'keyboards-mice': 'Keyboards & Mice',
  'power-charging': 'Power & Cables',
  'accessories-storage': 'Cases & Wearables',
}

interface StorefrontChromeProps {
  children: React.ReactNode
  activeCategoryHandle?: string
  searchValue?: string
  onSearchChange?: (q: string) => void
  onCategorySelect?: (handle: string) => void
}

export function StorefrontChrome({
  children,
  activeCategoryHandle,
  searchValue,
  onSearchChange,
  onCategorySelect,
}: StorefrontChromeProps) {
  const router = useRouter()
  const { totalCount, openCart } = useCart()
  const [localSearch, setLocalSearch] = useState(searchValue ?? '')

  const effectiveSearch = searchValue !== undefined ? searchValue : localSearch

  const handleSearchInput = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val)
    } else {
      setLocalSearch(val)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSearchChange) {
      const q = effectiveSearch.trim()
      router.push(q ? `/?q=${encodeURIComponent(q)}#catalog` : '/')
    } else {
      const el = document.getElementById('catalog')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-ink-primary">
      {/* Top Announcement & Hub Strip */}
      <div className="bg-obsidian-950 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-2 flex items-center justify-between gap-2 text-[11px] sm:text-xs">
          <Link
            href={ALL_ANNOUNCEMENTS[0]?.route ?? '/policies/gst-invoicing'}
            className="flex items-center gap-2 min-w-0 hover:text-gold-500 transition-colors"
          >
            <span className="inline-flex shrink-0 whitespace-nowrap items-center rounded-full bg-gold-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-obsidian-950">
              {ALL_ANNOUNCEMENTS[0]?.badge ?? 'B2B READY'}
            </span>
            <span className="text-chrome-200 truncate">
              {ALL_ANNOUNCEMENTS[0]?.text ?? 'Claim 18% GST Input Tax Credit'}
            </span>
          </Link>

          <Link
            href="/stores/muzaffarpur"
            className="hidden sm:inline-flex shrink-0 items-center gap-1.5 text-chrome-400 hover:text-gold-500 transition-colors whitespace-nowrap"
          >
            <MapPin className="h-3.5 w-3.5 text-gold-500" />
            <span>
              {MOBILE_STATION_BRAND.flagshipLocation.city} (
              {MOBILE_STATION_BRAND.flagshipLocation.pincode}) · Pan-India Express
            </span>
          </Link>
        </div>
      </div>

      {/* Obsidian Brand Header (Strictly Zero Clipping down to 320px/350px) */}
      <header className="sticky top-0 z-header bg-obsidian-900 text-ink-inverse border-b border-obsidian-800 shadow-card">
        <div className="page-container h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink"
          >
            <Image
              src={MOBILE_STATION_BRAND.assets.icon}
              alt="MS emblem"
              width={44}
              height={22}
              className="h-5 sm:h-7 w-auto shrink-0 object-contain"
              priority
            />
            <Image
              src={MOBILE_STATION_BRAND.assets.wordmark}
              alt="Mobile Station"
              width={210}
              height={24}
              className="h-4 sm:h-6 w-auto max-w-[138px] sm:max-w-[200px] md:max-w-none object-contain"
              priority
            />
          </Link>

          {/* Desktop / Tablet Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl items-center gap-2 rounded-sm bg-obsidian-800 border border-obsidian-700 px-3 py-1.5 focus-within:border-gold-500"
          >
            <Search className="h-4 w-4 text-chrome-400 shrink-0" />
            <input
              type="search"
              value={effectiveSearch}
              onChange={(e) => handleSearchInput(e.target.value)}
              aria-label="Search electronics"
              placeholder="Search iPhone 16, Vivo X200, S24 Ultra, Keychron, Sony XM5..."
              className="w-full min-w-0 bg-transparent text-sm text-ink-inverse placeholder:text-chrome-400 focus:outline-none"
            />
            {effectiveSearch && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => handleSearchInput('')}
                className="text-chrome-400 hover:text-ink-inverse shrink-0 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/offers"
              className="hidden lg:inline-flex items-center rounded-full border border-obsidian-700 bg-obsidian-800 px-3 py-1 text-xs text-chrome-200 hover:border-gold-500 hover:text-gold-500 transition whitespace-nowrap"
            >
              Offers & 18% GST
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart with ${totalCount} items`}
              className="inline-flex min-h-[38px] sm:min-h-[42px] shrink-0 whitespace-nowrap items-center gap-1.5 sm:gap-2 rounded-sm bg-gold-500 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-obsidian-950 hover:bg-gold-600 transition"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Cart ({totalCount})</span>
            </button>
          </div>
        </div>

        {/* Dedicated Mobile Search Row (<768px) */}
        <div className="md:hidden border-t border-obsidian-800 bg-obsidian-900/95 px-4 py-2">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 rounded-sm bg-obsidian-800 border border-obsidian-700 px-2.5 py-1.5 focus-within:border-gold-500"
          >
            <Search className="h-3.5 w-3.5 text-chrome-400 shrink-0" />
            <input
              type="search"
              value={effectiveSearch}
              onChange={(e) => handleSearchInput(e.target.value)}
              aria-label="Search mobiles, audio, laptops and accessories on mobile"
              placeholder="Search iPhone, Vivo, Samsung, Audio..."
              className="w-full min-w-0 bg-transparent text-xs text-ink-inverse placeholder:text-chrome-400 focus:outline-none"
            />
            {effectiveSearch && (
              <button
                type="button"
                aria-label="Clear mobile search"
                onClick={() => handleSearchInput('')}
                className="text-chrome-400 hover:text-ink-inverse shrink-0 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Concise Category Navigation Strip (Fits cleanly on desktop, scrollable on mobile/tablet) */}
        <nav
          aria-label="Primary categories"
          className="bg-obsidian-800 border-t border-obsidian-700/60"
        >
          <div className="page-container flex items-center justify-start md:justify-between gap-4 md:gap-2 lg:gap-3 overflow-x-auto no-scrollbar py-2.5 text-xs md:text-[11px] lg:text-xs font-medium text-chrome-200">
            {onCategorySelect ? (
              <button
                type="button"
                onClick={() => onCategorySelect('all')}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  activeCategoryHandle === 'all'
                    ? 'text-gold-500 font-semibold'
                    : 'hover:text-gold-500'
                }`}
              >
                All Tech
              </button>
            ) : (
              <Link
                href="/"
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  !activeCategoryHandle ? 'text-gold-500 font-semibold' : 'hover:text-gold-500'
                }`}
              >
                All Tech
              </Link>
            )}

            {ALL_CATEGORIES.map((cat) => {
              const shortLabel = NAV_SHORT_NAMES[cat.handle] ?? cat.name
              const isActive = activeCategoryHandle === cat.handle
              if (onCategorySelect) {
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategorySelect(cat.handle)}
                    className={`whitespace-nowrap shrink-0 transition-colors ${
                      isActive ? 'text-gold-500 font-semibold' : 'hover:text-gold-500'
                    }`}
                  >
                    {shortLabel}
                  </button>
                )
              }
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.handle}`}
                  className={`whitespace-nowrap shrink-0 transition-colors ${
                    isActive ? 'text-gold-500 font-semibold' : 'hover:text-gold-500'
                  }`}
                >
                  {shortLabel}
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-obsidian-950 text-chrome-300 border-t border-obsidian-800 pt-10 pb-14">
        <div className="page-container grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="space-y-2">
            <p className="font-display text-sm font-bold text-ink-inverse">
              {MOBILE_STATION_BRAND.name}
            </p>
            <p className="text-chrome-400">
              {MOBILE_STATION_BRAND.flagshipLocation.addressLine1},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.city},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.state} –{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.pincode}
            </p>
            <Link
              href="/stores/muzaffarpur"
              className="inline-block font-semibold text-gold-500 hover:underline pt-1"
            >
              Store Locations & Hub Pickup →
            </Link>
          </div>

          <div className="space-y-2">
            <p className="font-display font-bold uppercase tracking-wider text-chrome-200">
              Shop Categories
            </p>
            <ul className="space-y-1.5 text-chrome-400">
              {ALL_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/categories/${c.handle}`} className="hover:text-gold-500">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-display font-bold uppercase tracking-wider text-chrome-200">
              Buyer Assurance
            </p>
            <ul className="space-y-1.5 text-chrome-400">
              <li>
                <Link href="/policies/warranty" className="hover:text-gold-500">
                  100% Brand Authorized Warranty
                </Link>
              </li>
              <li>
                <Link href="/policies/open-box-delivery" className="hover:text-gold-500">
                  Insured Open-Box Delivery
                </Link>
              </li>
              <li>
                <Link href="/policies/gst-invoicing" className="hover:text-gold-500">
                  18% GST B2B Tax Credit
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-gold-500">
                  Active Bank & Promo Offers
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-display font-bold uppercase tracking-wider text-chrome-200">
              Fulfillment & Cloud Stack
            </p>
            <p className="text-chrome-400 leading-relaxed">
              IMEI & Serial Verified Inventory · Motijheel Flagship (842001) & Club Road Center (842002) · Pan-India Insured Express Courier
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

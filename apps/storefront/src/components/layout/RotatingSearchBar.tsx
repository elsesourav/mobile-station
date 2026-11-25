'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { RotatingSearchPlaceholderProps } from '@/types/storefront'

export const DESKTOP_SEARCH_KEYWORDS: readonly string[] = [
  'iPhone 16 Pro & Flagship 5G Phones',
  'MacBook Air M3 & RTX Gaming Laptops',
  'Sony WH-1000XM5 & ANC Audio Gear',
  'Keychron Mechanical Keyboards & Mice',
  '100W GaN Fast Chargers & MagSafe Cables',
  'Muzaffarpur Hub Same-Day Pickup Stock',
]

export const MOBILE_SEARCH_KEYWORDS: readonly string[] = [
  'iPhone 16 & 5G Phones',
  'RTX & MacBook Laptops',
  'Sony & OnePlus Audio',
  'Keychron Keyboards',
  'GaN Fast Chargers',
  '18% GST B2B Tech',
]

function RotatingSearchPlaceholder({
  keywords,
  isDesktop = false,
  visible,
  isPaused = false,
}: RotatingSearchPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!visible || isPaused) {
      setPrevIndex(null)
      return
    }
    const interval = setInterval(() => {
      setPrevIndex(currentIndex)
      setCurrentIndex((prev) => (prev + 1) % keywords.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [visible, isPaused, currentIndex, keywords.length])

  useEffect(() => {
    if (prevIndex === null) return
    const timer = setTimeout(() => setPrevIndex(null), 420)
    return () => clearTimeout(timer)
  }, [prevIndex])

  if (!visible) return null

  const textClass = isDesktop ? 'text-[13.5px]' : 'text-[12px]'

  return (
    <div className="pointer-events-none select-none relative flex items-center w-full h-[22px] overflow-hidden pl-0.5 pr-2">
      <span className={`text-chrome-400 font-normal shrink-0 mr-1 whitespace-nowrap ${textClass}`}>
        Search for
      </span>
      <div className="relative flex-1 min-w-0 h-full overflow-hidden">
        {prevIndex !== null && (
          <span
            key={`prev-${prevIndex}`}
            className={`absolute inset-0 flex items-center font-normal text-chrome-400 truncate leading-none animate-hint-out ${textClass}`}
          >
            {keywords[prevIndex % keywords.length]}
          </span>
        )}
        <span
          key={`curr-${currentIndex}`}
          className={`absolute inset-0 flex items-center font-normal text-chrome-400 truncate leading-none ${textClass} ${
            prevIndex !== null ? 'animate-hint-in' : ''
          }`}
        >
          {keywords[currentIndex % keywords.length]}
        </span>
      </div>
    </div>
  )
}

interface RotatingSearchBarProps {
  value?: string
  onChange?: (query: string) => void
  onSubmit?: (event: React.FormEvent) => void
  isDesktop?: boolean
  ariaLabel: string
  clearAriaLabel?: string
  className?: string
}

/**
 * Click-to-search pill link in the header matching Glorov's Header pattern:
 * clicking anywhere navigates directly to the dedicated `/search` experience.
 */
export function RotatingSearchBar({
  value = '',
  isDesktop = false,
  ariaLabel,
  className = '',
}: RotatingSearchBarProps) {
  const trimmed = value.trim()
  const targetHref = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search'

  return (
    <Link
      href={targetHref}
      prefetch={true}
      aria-label={ariaLabel}
      className={`block min-w-0 cursor-pointer group ${className}`}
    >
      <div
        className={`flex items-center rounded-full border bg-obsidian-800 border-obsidian-700 group-hover:border-gold-500/80 group-hover:bg-obsidian-800/90 transition-colors overflow-hidden ${
          isDesktop ? 'h-[42px] px-3' : 'h-[38px] px-2.5'
        }`}
      >
        <span
          aria-hidden="true"
          className="text-gold-500 p-1 shrink-0 group-hover:scale-105 transition-transform"
        >
          <Search className={isDesktop ? 'w-[18px] h-[18px]' : 'w-4 h-4'} />
        </span>

        <div className="relative flex-1 min-w-0 h-full flex items-center overflow-hidden">
          {trimmed ? (
            <span
              className={`text-ink-inverse truncate pl-0.5 ${
                isDesktop ? 'text-[13.5px]' : 'text-xs'
              }`}
            >
              {trimmed}
            </span>
          ) : (
            <RotatingSearchPlaceholder
              keywords={isDesktop ? DESKTOP_SEARCH_KEYWORDS : MOBILE_SEARCH_KEYWORDS}
              isDesktop={isDesktop}
              visible={true}
              isPaused={false}
            />
          )}
        </div>
      </div>
    </Link>
  )
}

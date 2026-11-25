'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
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
    <div className="pointer-events-none select-none absolute inset-0 flex items-center pl-0.5 pr-2 overflow-hidden">
      <span className={`text-chrome-400 font-normal shrink-0 mr-1 whitespace-nowrap ${textClass}`}>
        Search for
      </span>
      <div className="relative flex-1 min-w-0 h-[22px] overflow-hidden">
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
  value: string
  onChange: (query: string) => void
  onSubmit: (event: React.FormEvent) => void
  isDesktop?: boolean
  ariaLabel: string
  clearAriaLabel: string
  className?: string
}

/**
 * Pill search input featuring Glorov's animated bottom-to-top placeholder keywords.
 */
export function RotatingSearchBar({
  value,
  onChange,
  onSubmit,
  isDesktop = false,
  ariaLabel,
  clearAriaLabel,
  className = '',
}: RotatingSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const showRotatingHint = !value && !isFocused

  return (
    <form onSubmit={onSubmit} className={`min-w-0 ${className}`}>
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex items-center rounded-full border bg-obsidian-800 border-obsidian-700 transition-colors cursor-text overflow-hidden focus-within:border-gold-500 ${
          isDesktop ? 'h-[42px] px-3' : 'h-[38px] px-2.5'
        }`}
      >
        <button
          type="submit"
          aria-label={ariaLabel}
          className="text-gold-500 p-1 shrink-0 hover:scale-105 transition-transform focus-visible:outline-none"
        >
          <Search className={isDesktop ? 'w-[18px] h-[18px]' : 'w-4 h-4'} />
        </button>

        <div className="relative flex-1 min-w-0 h-full flex items-center">
          <RotatingSearchPlaceholder
            keywords={isDesktop ? DESKTOP_SEARCH_KEYWORDS : MOBILE_SEARCH_KEYWORDS}
            isDesktop={isDesktop}
            visible={showRotatingHint}
            isPaused={isFocused}
          />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label={ariaLabel}
            className={`w-full min-w-0 bg-transparent text-ink-inverse focus:outline-none ${
              isDesktop ? 'text-[13.5px]' : 'text-xs'
            }`}
          />
        </div>

        {value && (
          <button
            type="button"
            aria-label={clearAriaLabel}
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
              inputRef.current?.focus()
            }}
            className="text-chrome-400 hover:text-ink-inverse shrink-0 p-1 rounded-full transition-colors"
          >
            <X className={isDesktop ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          </button>
        )}
      </div>
    </form>
  )
}

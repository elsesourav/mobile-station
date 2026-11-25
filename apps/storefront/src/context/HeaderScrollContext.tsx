'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import type { HeaderScrollContextValue, HeaderScrollState } from '@/types/storefront'

const INITIAL_STATE: HeaderScrollState = {
  isTopNavVisible: true,
  isBottomNavVisible: false,
  showIcons: true,
  showAnnouncement: true,
  isAtTop: true,
  selectedCategory: '',
}

const HeaderScrollContext = createContext<HeaderScrollContextValue | null>(null)

const TOP_THRESHOLD = 34
const STICKY_ACTIVATION_THRESHOLD = 180
const DOWN_TOLERANCE = 14
const UP_TOLERANCE = 8
const BOTTOM_THRESHOLD = 240

/**
 * Coordinates Glorov-style 4-zone scroll visibility across announcement bar,
 * collapsible category icon strip, auto-hiding top header, and mobile bottom dock.
 */
export function HeaderScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [state, setState] = useState<HeaderScrollState>(INITIAL_STATE)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const stateRef = useRef<HeaderScrollState>(INITIAL_STATE)
  stateRef.current = state

  const lastScrollYRef = useRef<number>(0)
  const scrollUpAccumulatorRef = useRef<number>(0)
  const scrollDownAccumulatorRef = useRef<number>(0)

  const openMobileMenu = useCallback(() => setIsMobileMenuOpen(true), [])
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  const setSelectedCategory = useCallback((category: string) => {
    setState((prev) => ({ ...prev, selectedCategory: category }))
  }, [])

  const resetHeaderScroll = useCallback(() => {
    scrollUpAccumulatorRef.current = 0
    scrollDownAccumulatorRef.current = 0
    lastScrollYRef.current = 0
    setState((prev) => ({
      ...INITIAL_STATE,
      selectedCategory: prev.selectedCategory,
    }))
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    resetHeaderScroll()
  }, [pathname, resetHeaderScroll])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let rafId: number | null = null

    const handleScroll = () => {
      if (rafId !== null) return

      rafId = requestAnimationFrame(() => {
        rafId = null
        const doc = document.documentElement
        const currentY = Math.max(0, window.scrollY || doc.scrollTop || 0)
        const maxExtent = Math.max(0, doc.scrollHeight - window.innerHeight)
        const distanceToBottom = Math.max(0, maxExtent - currentY)
        const delta = currentY - lastScrollYRef.current
        const curr = stateRef.current

        const nextAtTop = currentY <= TOP_THRESHOLD
        let nextTopNavVisible = curr.isTopNavVisible
        let nextBottomNavVisible = curr.isBottomNavVisible

        if (currentY <= TOP_THRESHOLD) {
          nextTopNavVisible = true
          scrollUpAccumulatorRef.current = 0
          scrollDownAccumulatorRef.current = 0
        } else if (delta > 0) {
          scrollDownAccumulatorRef.current += delta
          scrollUpAccumulatorRef.current = 0
          if (
            currentY > STICKY_ACTIVATION_THRESHOLD &&
            scrollDownAccumulatorRef.current >= DOWN_TOLERANCE
          ) {
            nextTopNavVisible = false
          }
        } else if (delta < 0) {
          scrollUpAccumulatorRef.current += -delta
          scrollDownAccumulatorRef.current = 0
          if (scrollUpAccumulatorRef.current >= UP_TOLERANCE) {
            nextTopNavVisible = true
          }
        }

        if (currentY <= STICKY_ACTIVATION_THRESHOLD) {
          nextBottomNavVisible = false
        } else if (distanceToBottom <= BOTTOM_THRESHOLD) {
          nextBottomNavVisible = true
        } else if (delta > 0 && scrollDownAccumulatorRef.current >= DOWN_TOLERANCE) {
          nextBottomNavVisible = true
        } else if (delta < 0 && scrollUpAccumulatorRef.current >= UP_TOLERANCE) {
          nextBottomNavVisible = false
        }

        const nextShowIcons = nextAtTop
        const nextShowAnnouncement = nextAtTop

        lastScrollYRef.current = currentY

        if (
          nextTopNavVisible !== curr.isTopNavVisible ||
          nextBottomNavVisible !== curr.isBottomNavVisible ||
          nextShowIcons !== curr.showIcons ||
          nextShowAnnouncement !== curr.showAnnouncement ||
          nextAtTop !== curr.isAtTop
        ) {
          setState((prev) => ({
            ...prev,
            isTopNavVisible: nextTopNavVisible,
            isBottomNavVisible: nextBottomNavVisible,
            showIcons: nextShowIcons,
            showAnnouncement: nextShowAnnouncement,
            isAtTop: nextAtTop,
          }))
        }
      })
    }

    lastScrollYRef.current = Math.max(0, window.scrollY || 0)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <HeaderScrollContext.Provider
      value={{
        ...state,
        setSelectedCategory,
        resetHeaderScroll,
        isMobileMenuOpen,
        openMobileMenu,
        closeMobileMenu,
      }}
    >
      {children}
    </HeaderScrollContext.Provider>
  )
}

export function useHeaderScroll(): HeaderScrollContextValue {
  const ctx = useContext(HeaderScrollContext)
  if (!ctx) {
    throw new Error('useHeaderScroll must be used within HeaderScrollProvider')
  }
  return ctx
}

export function useOptionalHeaderScroll(): HeaderScrollContextValue | null {
  return useContext(HeaderScrollContext)
}

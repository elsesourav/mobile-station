'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DEFAULT_SHOW_ANNOUNCEMENT_BAR,
  useOptionalHeaderScroll,
} from '@/context/HeaderScrollContext'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Header } from '@/components/layout/Header'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppSupportWidget } from '@/components/support/WhatsAppSupportWidget'
import type { StorefrontShellProps } from '@/types/storefront'

/**
 * Shared responsive storefront chrome providing the floating auto-hide header,
 * collapsible announcement & category strip, 3-column footer,
 * and scroll-coordinated mobile bottom navigation dock.
 */
export function StorefrontChrome({
  children,
  activeCategoryHandle,
  searchValue,
  onSearchChange,
  onCategorySelect,
  showAnnouncementBar = DEFAULT_SHOW_ANNOUNCEMENT_BAR,
  suppressBottomNav = false,
}: StorefrontShellProps) {
  const router = useRouter()
  const headerScroll = useOptionalHeaderScroll()
  const [localSearch, setLocalSearch] = useState(searchValue ?? '')

  const effectiveSearch = searchValue !== undefined ? searchValue : localSearch
  const isTopNavVisible = headerScroll ? headerScroll.isTopNavVisible : true

  const handleSearchInput = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query)
    } else {
      setLocalSearch(query)
    }
  }

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!onSearchChange) {
      const trimmed = effectiveSearch.trim()
      router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}#catalog` : '/')
      return
    }
    const catalogEl = document.getElementById('catalog')
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-surface-canvas text-ink-primary antialiased">
      {/* Floating Auto-Hide Top Stack (Announcement Bar + Obsidian Brand Header + Category Strip) */}
      <div
        className={`fixed top-0 left-0 right-0 z-header transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform ${
          isTopNavVisible ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
        }`}
      >
        <AnnouncementBar enabled={showAnnouncementBar} />
        <Header
          activeCategoryHandle={activeCategoryHandle}
          searchValue={effectiveSearch}
          onSearchChange={handleSearchInput}
          onCategorySelect={onCategorySelect}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>

      {/* Main Content with Constant Spacer Matching Top Stack At Rest */}
      <main
        className={`flex-1 ${
          showAnnouncementBar ? 'pt-[149px] lg:pt-[157px]' : 'pt-[116px] lg:pt-[124px]'
        }`}
      >
        {children}
      </main>

      <Footer />

      {/* Mobile & Tablet Bottom Dock (< 1024px); suppressed on PDP when sticky cart bar appears */}
      <MobileBottomNav suppressed={suppressBottomNav} />

      {/* Floating WhatsApp Support & Message Composer */}
      <WhatsAppSupportWidget />
    </div>
  )
}

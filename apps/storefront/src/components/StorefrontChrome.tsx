'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOptionalHeaderScroll } from '@/context/HeaderScrollContext'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Header } from '@/components/layout/Header'
import { MobileMenuDrawer } from '@/components/layout/MobileMenuDrawer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { Footer } from '@/components/layout/Footer'
import type { StorefrontShellProps } from '@/types/storefront'

/**
 * Shared responsive storefront chrome matching Glorov's floating auto-hide header,
 * collapsible announcement & category icon bar, slide-in menu drawer, 3-column footer,
 * and scroll-reactive mobile bottom dock.
 */
export function StorefrontChrome({
  children,
  activeCategoryHandle,
  searchValue,
  onSearchChange,
  onCategorySelect,
}: StorefrontShellProps) {
  const router = useRouter()
  const headerScroll = useOptionalHeaderScroll()
  const [localSearch, setLocalSearch] = useState(searchValue ?? '')
  const [localDrawerOpen, setLocalDrawerOpen] = useState(false)

  const effectiveSearch = searchValue !== undefined ? searchValue : localSearch
  const isTopNavVisible = headerScroll ? headerScroll.isTopNavVisible : true
  const isDrawerOpen = headerScroll ? headerScroll.isMobileMenuOpen : localDrawerOpen

  const openMobileMenu = () => {
    if (headerScroll) {
      headerScroll.openMobileMenu()
    } else {
      setLocalDrawerOpen(true)
    }
  }

  const closeMobileMenu = () => {
    if (headerScroll) {
      headerScroll.closeMobileMenu()
    } else {
      setLocalDrawerOpen(false)
    }
  }

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
        <AnnouncementBar />
        <Header
          activeCategoryHandle={activeCategoryHandle}
          searchValue={effectiveSearch}
          onSearchChange={handleSearchInput}
          onCategorySelect={onCategorySelect}
          onSearchSubmit={handleSearchSubmit}
          onOpenMobileMenu={openMobileMenu}
        />
      </div>

      {/* Left Navigation Drawer on Mobile & Tablet */}
      <MobileMenuDrawer
        isOpen={isDrawerOpen}
        onClose={closeMobileMenu}
        activeCategoryHandle={activeCategoryHandle}
        onCategorySelect={onCategorySelect}
      />

      {/* Main Content with Constant Spacer Matching Top Stack At Rest */}
      <main className="flex-1 pt-[152px] lg:pt-[160px]">{children}</main>

      <Footer />

      {/* Scroll-Reactive Mobile Bottom Dock (< 768px) */}
      <MobileBottomNav
        activeCategoryHandle={activeCategoryHandle}
        onOpenMobileMenu={openMobileMenu}
      />
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Percent } from 'lucide-react'
import { useOptionalHeaderScroll } from '@/context/HeaderScrollContext'
import type { MobileBottomNavProps } from '@/types/storefront'

/**
 * Mobile & Tablet bottom dock (< 1024px) housing streamlined core destinations:
 * Home, Offers, and the dedicated full-page Menu hub (`/menu`).
 * Reviews & Cart buttons are excluded here (Cart & Account remain in the top bar),
 * and PDP sticky purchase controls can cleanly suppress this bar on scroll.
 */
export function MobileBottomNav({
  alwaysVisible = true,
  suppressed = false,
  className = '',
}: MobileBottomNavProps) {
  const pathname = usePathname() || ''
  const headerScroll = useOptionalHeaderScroll()

  const isVisible =
    !suppressed && (alwaysVisible || (headerScroll ? headerScroll.isBottomNavVisible : false))

  const itemClasses = (isActive: boolean) =>
    `flex flex-col items-center justify-center min-w-[72px] min-h-[44px] py-1 select-none transition-colors relative ${
      isActive ? 'text-gold-500 font-bold' : 'text-chrome-300 font-medium hover:text-gold-500'
    }`

  const pillClasses = (isActive: boolean) =>
    `px-4 py-0.5 rounded-full transition-colors flex items-center justify-center ${
      isActive ? 'bg-gold-500/20 text-gold-500' : 'bg-transparent'
    }`

  const isMenuActive = pathname === '/menu' || pathname.startsWith('/menu/')

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      aria-hidden={!isVisible}
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/95 backdrop-blur-md border-t border-obsidian-800 pb-[env(safe-area-inset-bottom)] transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-[120%] opacity-0 pointer-events-none'
      } ${className}`}
    >
      <div className="flex items-center justify-around h-14 px-3">
        <Link href="/" aria-label="Home" className={itemClasses(pathname === '/')}>
          <div className={pillClasses(pathname === '/')}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Home</span>
        </Link>

        <Link
          href="/offers"
          aria-label="Offers and GST"
          className={itemClasses(pathname === '/offers')}
        >
          <div className={pillClasses(pathname === '/offers')}>
            <Percent className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Offers</span>
        </Link>

        <Link
          href="/menu"
          aria-label="Menu, Account and Services"
          className={itemClasses(isMenuActive)}
        >
          <div className={pillClasses(isMenuActive)}>
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Menu</span>
        </Link>
      </div>
    </nav>
  )
}

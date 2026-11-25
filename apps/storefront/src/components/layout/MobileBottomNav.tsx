'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, Percent, ShoppingCart, Video } from 'lucide-react'
import { useCart } from '@/components/CartContext'
import { useOptionalHeaderScroll } from '@/context/HeaderScrollContext'
import type { MobileBottomNavProps } from '@/types/storefront'

/**
 * Mobile & Tablet bottom dock (< 1024px) keeping core store actions, cart, and menu
 * cleanly accessible without cluttering the top header with a left-side menu button.
 */
export function MobileBottomNav({
  onOpenMobileMenu,
  alwaysVisible = true,
  className = '',
}: MobileBottomNavProps) {
  const pathname = usePathname() || ''
  const { totalCount, openCart } = useCart()
  const headerScroll = useOptionalHeaderScroll()

  const isVisible = alwaysVisible || (headerScroll ? headerScroll.isBottomNavVisible : false)

  const itemClasses = (isActive: boolean) =>
    `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 select-none transition-colors relative ${
      isActive ? 'text-gold-500 font-bold' : 'text-chrome-300 font-medium hover:text-gold-500'
    }`

  const pillClasses = (isActive: boolean) =>
    `px-3.5 py-0.5 rounded-full transition-colors flex items-center justify-center ${
      isActive ? 'bg-gold-500/20 text-gold-500' : 'bg-transparent'
    }`

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/95 backdrop-blur-md border-t border-obsidian-800 pb-[env(safe-area-inset-bottom)] transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-[120%] opacity-0 pointer-events-none'
      } ${className}`}
    >
      <div className="flex items-center justify-around h-14 px-2">
        <Link href="/" aria-label="Home" className={itemClasses(pathname === '/')}>
          <div className={pillClasses(pathname === '/')}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Home</span>
        </Link>

        <Link href="/offers" aria-label="Offers and GST" className={itemClasses(pathname === '/offers')}>
          <div className={pillClasses(pathname === '/offers')}>
            <Percent className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Offers</span>
        </Link>

        <Link
          href="/feedback"
          aria-label="Customer Video Feedback"
          className={itemClasses(pathname === '/feedback')}
        >
          <div className={pillClasses(pathname === '/feedback')}>
            <Video className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Reviews</span>
        </Link>

        <button
          type="button"
          onClick={openCart}
          aria-label={`Open cart with ${totalCount} items`}
          className={itemClasses(false)}
        >
          <div className="relative flex items-center justify-center">
            <div className={pillClasses(false)}>
              <ShoppingCart className="w-5 h-5" />
            </div>
            {totalCount > 0 && (
              <span className="absolute -top-1 right-0 min-w-[17px] h-[17px] px-1 rounded-full bg-gold-500 text-obsidian-950 text-[9.5px] font-extrabold flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Cart</span>
        </button>

        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="More categories and hub menu"
          className={itemClasses(false)}
        >
          <div className={pillClasses(false)}>
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Menu</span>
        </button>
      </div>
    </nav>
  )
}

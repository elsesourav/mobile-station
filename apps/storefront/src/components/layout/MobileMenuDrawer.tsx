'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Camera,
  ChevronRight,
  MapPin,
  Percent,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { ALL_CATEGORIES } from '@/lib/catalog'
import type { MobileMenuDrawerProps } from '@/types/storefront'

/**
 * Slide-over Obsidian mobile/tablet navigation drawer mirroring Glorov's MobileMenuDrawer.
 */
export function MobileMenuDrawer({
  isOpen,
  onClose,
  activeCategoryHandle,
  onCategorySelect,
}: MobileMenuDrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Station Navigation"
      className="fixed inset-0 z-drawer flex"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-obsidian-950/70 backdrop-blur-xs transition-opacity"
      />

      <div className="relative z-10 w-[86%] max-w-[340px] h-full bg-obsidian-900 text-ink-inverse border-r border-obsidian-800 shadow-modal flex flex-col">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-obsidian-800 bg-obsidian-950">
          <Link href="/" onClick={onClose} className="flex items-center gap-2 min-w-0">
            <Image
              src={MOBILE_STATION_BRAND.assets.icon}
              alt="MS emblem"
              width={36}
              height={20}
              className="h-6 w-auto shrink-0 object-contain"
            />
            <Image
              src={MOBILE_STATION_BRAND.assets.wordmark}
              alt="Mobile Station"
              width={160}
              height={20}
              className="h-4 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex items-center justify-center w-9 h-9 rounded-full text-chrome-300 hover:bg-obsidian-800 hover:text-gold-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <p className="font-mono text-[11px] font-bold text-gold-500 uppercase tracking-wider px-2 mb-2">
              Shop Electronics Categories
            </p>
            <ul className="space-y-1">
              {ALL_CATEGORIES.map((category) => {
                const isActive = activeCategoryHandle === category.handle
                if (onCategorySelect) {
                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onCategorySelect(category.handle)
                          onClose()
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-sm font-medium transition ${
                          isActive
                            ? 'bg-obsidian-800 text-gold-500'
                            : 'text-chrome-200 hover:bg-obsidian-800 hover:text-gold-500'
                        }`}
                      >
                        <span>{category.name}</span>
                        <ChevronRight className="w-4 h-4 text-chrome-400" />
                      </button>
                    </li>
                  )
                }

                return (
                  <li key={category.id}>
                    <Link
                      href={`/categories/${category.handle}`}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-sm text-sm font-medium transition ${
                        isActive
                          ? 'bg-obsidian-800 text-gold-500'
                          : 'text-chrome-200 hover:bg-obsidian-800 hover:text-gold-500'
                      }`}
                    >
                      <span>{category.name}</span>
                      <ChevronRight className="w-4 h-4 text-chrome-400" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="border-t border-obsidian-800 pt-4">
            <p className="font-mono text-[11px] font-bold text-gold-500 uppercase tracking-wider px-2 mb-2">
              Store Proof &amp; Offers
            </p>
            <ul className="space-y-1 text-xs font-medium text-chrome-200">
              <li>
                <Link
                  href="/feedback"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-obsidian-800 hover:text-gold-500 transition"
                >
                  <Video className="w-4 h-4 text-gold-500 shrink-0" />
                  <span>Customer Video Feedback</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-obsidian-800 hover:text-gold-500 transition"
                >
                  <Camera className="w-4 h-4 text-gold-500 shrink-0" />
                  <span>Muzaffarpur Store Visit Gallery</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-obsidian-800 hover:text-gold-500 transition"
                >
                  <Percent className="w-4 h-4 text-gold-500 shrink-0" />
                  <span>Offers, Bank Promo &amp; 18% GST</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/stores/muzaffarpur"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-obsidian-800 hover:text-gold-500 transition"
                >
                  <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
                  <span>Motijheel (842001) &amp; Club Road (842002)</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="border-t border-obsidian-800 pt-4">
            <p className="font-mono text-[11px] font-bold text-gold-500 uppercase tracking-wider px-2 mb-2">
              Trust &amp; Buyer Protection
            </p>
            <ul className="space-y-1 text-xs text-chrome-300">
              <li>
                <Link
                  href="/policies/warranty"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm hover:bg-obsidian-800 hover:text-gold-500"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>100% Official Brand Warranty</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/open-box-delivery"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-sm hover:bg-obsidian-800 hover:text-gold-500"
                >
                  Insured Open-Box Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/gst-invoicing"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-sm hover:bg-obsidian-800 hover:text-gold-500"
                >
                  18% GST B2B Tax Credit
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-obsidian-800 bg-obsidian-950 text-center">
          <p className="text-[11px] text-chrome-300 font-medium">
            {MOBILE_STATION_BRAND.flagshipLocation.city} Flagship · Pan-India Express
          </p>
          <p className="text-[10px] text-chrome-400 mt-0.5">
            IMEI &amp; Serial Sealed Tech · 18% GST Invoice
          </p>
        </div>
      </div>
    </div>
  )
}

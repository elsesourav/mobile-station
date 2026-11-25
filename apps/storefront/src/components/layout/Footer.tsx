'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import type { StorefrontFooterProps } from '@/types/storefront'

/**
 * Glorov-mirrored 3-column Desktop + compact 2-column Mobile/Tablet Obsidian Footer.
 */
export function Footer({ className = '' }: StorefrontFooterProps) {
  return (
    <footer
      aria-label="Site Footer"
      className={`w-full bg-obsidian-950 text-ink-inverse border-t border-obsidian-800 ${className}`}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 pb-20 pt-6 md:pb-12 md:pt-12">
        <div className="max-w-content mx-auto">
          {/* Desktop Footer (>= 1024px) */}
          <div className="hidden lg:grid grid-cols-12 gap-8 xl:gap-16 pb-10">
            {/* Col 1: Brand & Mission (6 cols) */}
            <div className="col-span-6 space-y-4">
              <Link href="/" aria-label="Mobile Station Home" className="inline-flex items-center gap-2.5">
                <Image
                  src={MOBILE_STATION_BRAND.assets.icon}
                  alt="MS emblem"
                  width={44}
                  height={22}
                  className="h-7 w-auto shrink-0 object-contain"
                />
                <Image
                  src={MOBILE_STATION_BRAND.assets.wordmark}
                  alt="Mobile Station"
                  width={200}
                  height={24}
                  className="h-6 w-auto object-contain"
                />
              </Link>

              <p className="text-[13px] text-chrome-300 leading-relaxed max-w-lg">
                <strong className="text-ink-inverse font-semibold block mb-1">
                  Factory Sealed Tech. Official Brand Warranty.
                </strong>
                {MOBILE_STATION_BRAND.name} operates flagship electronics centers in{' '}
                {MOBILE_STATION_BRAND.flagshipLocation.city}, {MOBILE_STATION_BRAND.flagshipLocation.state} (
                {MOBILE_STATION_BRAND.flagshipLocation.pincode} &amp;{' '}
                {MOBILE_STATION_BRAND.secondaryLocation.pincode}), delivering verified hardware with
                18% GST tax invoices across India.
              </p>

              <div className="flex items-center gap-2 pt-1 text-gold-500">
                <ShieldCheck className="w-[18px] h-[18px] shrink-0" />
                <span className="text-xs font-semibold text-ink-inverse tracking-tight">
                  100% Authorized Warranty • IMEI/Serial Tracked • Insured Open-Box Delivery
                </span>
              </div>
            </div>

            {/* Col 2: Electronics Collections (3 cols) */}
            <div className="col-span-3 space-y-3">
              <h3 className="font-display text-sm font-bold tracking-wider text-ink-inverse uppercase">
                Electronics
              </h3>
              <ul className="space-y-1.5 text-[13px] text-chrome-300">
                <li>
                  <Link href="/categories/smartphones" className="hover:text-gold-500 transition-colors block py-0.5">
                    5G Smartphones
                  </Link>
                </li>
                <li>
                  <Link href="/categories/laptops" className="hover:text-gold-500 transition-colors block py-0.5">
                    Laptops &amp; Monitors
                  </Link>
                </li>
                <li>
                  <Link href="/categories/tablets" className="hover:text-gold-500 transition-colors block py-0.5">
                    Tablets &amp; iPads
                  </Link>
                </li>
                <li>
                  <Link href="/categories/audio" className="hover:text-gold-500 transition-colors block py-0.5">
                    ANC Headphones &amp; TWS
                  </Link>
                </li>
                <li>
                  <Link href="/categories/keyboards-mice" className="hover:text-gold-500 transition-colors block py-0.5">
                    Keyboards, Mice &amp; GaN Gear
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Hubs & Support (3 cols) */}
            <div className="col-span-3 space-y-3">
              <h3 className="font-display text-sm font-bold tracking-wider text-ink-inverse uppercase">
                Hubs &amp; Support
              </h3>
              <ul className="space-y-1.5 text-[13px] text-chrome-300">
                <li>
                  <Link href="/stores/muzaffarpur" className="hover:text-gold-500 transition-colors block py-0.5">
                    Muzaffarpur Hub Pickup (842001/02)
                  </Link>
                </li>
                <li>
                  <Link href="/offers" className="hover:text-gold-500 transition-colors block py-0.5">
                    Active Bank &amp; Promo Offers
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-gold-500 transition-colors block py-0.5">
                    Customer Video Feedback
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="hover:text-gold-500 transition-colors block py-0.5">
                    Store Visit Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/policies/open-box-delivery" className="hover:text-gold-500 transition-colors block py-0.5">
                    Open-Box Verification Guide
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile & Tablet Compact Footer (< 1024px) */}
          <div className="block lg:hidden space-y-3 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/" aria-label="Mobile Station Home" className="flex items-center gap-1.5 shrink-0">
                <Image
                  src={MOBILE_STATION_BRAND.assets.icon}
                  alt="MS emblem"
                  width={34}
                  height={18}
                  className="h-5 w-auto shrink-0 object-contain"
                />
                <Image
                  src={MOBILE_STATION_BRAND.assets.wordmark}
                  alt="Mobile Station"
                  width={150}
                  height={18}
                  className="h-4 w-auto object-contain"
                />
              </Link>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
              <span className="text-[11px] font-semibold text-gold-500">
                Factory Sealed Tech
              </span>
            </div>

            <p className="text-[11px] text-chrome-300 leading-snug">
              Authorized electronics with 18% GST invoices &amp; insured shipping across India from Muzaffarpur (842001 / 842002).
            </p>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <h4 className="font-display text-xs font-bold text-ink-inverse uppercase tracking-tight">
                  Collections
                </h4>
                <div className="flex flex-col space-y-1 text-[11.5px] text-chrome-300 pt-0.5">
                  <Link href="/categories/smartphones" className="hover:text-gold-500 transition-colors">
                    5G Smartphones
                  </Link>
                  <Link href="/categories/laptops" className="hover:text-gold-500 transition-colors">
                    Laptops &amp; Workstations
                  </Link>
                  <Link href="/categories/audio" className="hover:text-gold-500 transition-colors">
                    ANC Audio &amp; TWS
                  </Link>
                  <Link href="/categories/keyboards-mice" className="hover:text-gold-500 transition-colors">
                    Peripherals &amp; Gear
                  </Link>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-xs font-bold text-ink-inverse uppercase tracking-tight">
                  Hubs &amp; Proof
                </h4>
                <div className="flex flex-col space-y-1 text-[11.5px] text-chrome-300 pt-0.5">
                  <Link href="/stores/muzaffarpur" className="hover:text-gold-500 transition-colors">
                    Muzaffarpur Hubs
                  </Link>
                  <Link href="/feedback" className="hover:text-gold-500 transition-colors">
                    Video Feedback
                  </Link>
                  <Link href="/gallery" className="hover:text-gold-500 transition-colors">
                    Store Visit Gallery
                  </Link>
                  <Link href="/offers" className="hover:text-gold-500 transition-colors">
                    Bank Offers &amp; EMI
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="h-[1px] w-full bg-obsidian-800 my-3 md:my-6" />

          {/* Desktop Bottom Legal Bar (>= 1024px) */}
          <div className="hidden lg:flex items-center justify-between gap-4 text-xs text-chrome-400 pt-1 lg:pr-44 2xl:pr-0">
            <span>© 2026 {MOBILE_STATION_BRAND.name} Electronics Commerce. Muzaffarpur, Bihar. All rights reserved.</span>
            <div className="flex items-center gap-4 text-[11px] text-chrome-300">
              <Link href="/policies/warranty" className="underline hover:text-gold-500 transition-colors">
                Brand Warranty Policy
              </Link>
              <Link href="/policies/open-box-delivery" className="underline hover:text-gold-500 transition-colors">
                Open-Box Delivery
              </Link>
              <Link href="/policies/gst-invoicing" className="underline hover:text-gold-500 transition-colors">
                18% GST Invoicing
              </Link>
            </div>
          </div>

          {/* Mobile & Tablet Bottom Legal Bar (< 1024px) */}
          <div className="block lg:hidden text-center space-y-1.5 pt-1 text-[11px] text-chrome-300">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <Link href="/policies/warranty" className="underline hover:text-gold-500 transition-colors">
                Warranty Policy
              </Link>
              <span className="text-chrome-400/40 text-[10px]">•</span>
              <Link href="/policies/open-box-delivery" className="underline hover:text-gold-500 transition-colors">
                Open-Box Delivery
              </Link>
              <span className="text-chrome-400/40 text-[10px]">•</span>
              <Link href="/policies/gst-invoicing" className="underline hover:text-gold-500 transition-colors">
                18% GST Credit
              </Link>
            </div>
            <p className="text-[10.5px] text-chrome-400">
              © 2026 {MOBILE_STATION_BRAND.name} Electronics Commerce. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

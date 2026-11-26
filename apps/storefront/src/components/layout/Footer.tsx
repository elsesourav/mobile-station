'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Camera,
  Film,
  MapPin,
  PackageCheck,
  Receipt,
  ShieldCheck,
  Tag,
} from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import {
  AudioIcon,
  CasesWatchIcon,
  KeyboardsMiceIcon,
  LaptopsIcon,
  PowerGaNIcon,
  SmartphonesIcon,
  TabletsIcon,
} from '@/components/icons/CategoryIcons'
import type { StorefrontFooterProps } from '@/types/storefront'

/**
 * Obsidian 3-column Desktop + compact 2-column Mobile/Tablet Footer with custom category SVG icons
 * and contrast-safe unoptimized static brand imagery.
 */
export function Footer({ className = '' }: StorefrontFooterProps) {
  return (
    <footer
      aria-label="Site Footer"
      className={`w-full bg-obsidian-950 text-ink-inverse border-t border-obsidian-800 ${className}`}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 pb-32 pt-8 lg:pb-12 lg:pt-12">
        <div className="max-w-content mx-auto">
          {/* Desktop Footer (>= 1024px) */}
          <div className="hidden lg:grid grid-cols-12 gap-8 xl:gap-16 pb-10">
            {/* Col 1: Brand & Mission (6 cols) */}
            <div className="col-span-6 space-y-4">
              <Link href="/" aria-label="Mobile Station Home" className="inline-flex items-center gap-2.5">
                <Image
                  src={MOBILE_STATION_BRAND.assets.icon}
                  alt="MS"
                  width={48}
                  height={22}
                  unoptimized
                  loading="eager"
                  className="h-7 w-auto shrink-0 object-contain"
                />
                <Image
                  src={MOBILE_STATION_BRAND.assets.wordmark}
                  alt="Mobile Station"
                  width={236}
                  height={24}
                  unoptimized
                  loading="eager"
                  className="h-6 w-auto object-contain"
                />
              </Link>

              <p className="text-[13px] text-chrome-300 leading-relaxed max-w-lg">
                <strong className="text-ink-inverse font-semibold block mb-1">
                  Factory Sealed Tech. Genuine Indian Retail Units.
                </strong>
                {MOBILE_STATION_BRAND.name} operates flagship electronics centers in{' '}
                {MOBILE_STATION_BRAND.flagshipLocation.city},{' '}
                {MOBILE_STATION_BRAND.flagshipLocation.state} (
                {MOBILE_STATION_BRAND.flagshipLocation.pincode} &amp;{' '}
                {MOBILE_STATION_BRAND.secondaryLocation.pincode}), delivering verified hardware with
                18% GST tax invoices across India.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-chrome-200">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-900 border border-obsidian-800 px-3 py-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>IMEI &amp; Serial Verified</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-900 border border-obsidian-800 px-3 py-1">
                  <Receipt className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>18% GST Invoices</span>
                </span>
              </div>
            </div>

            {/* Col 2: Electronics Collections (3 cols) */}
            <div className="col-span-3 space-y-3">
              <h3 className="font-display text-sm font-bold tracking-wider text-ink-inverse uppercase">
                Electronics
              </h3>
              <ul className="space-y-2 text-[13px] text-chrome-300">
                <li>
                  <Link
                    href="/smartphones"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <SmartphonesIcon className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Mobiles &amp; Smartphones</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tablets"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <TabletsIcon className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Tablets &amp; E-Readers</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/laptops"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <LaptopsIcon className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Laptops &amp; Monitors</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/audio"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <AudioIcon className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Audio &amp; TWS</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/keyboards-mice"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <KeyboardsMiceIcon className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Keyboards &amp; Mice</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/power-charging"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <PowerGaNIcon className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Chargers &amp; GaN Power</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accessories-storage"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <CasesWatchIcon className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Cases, Storage &amp; Watch</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Hubs & Support (3 cols) */}
            <div className="col-span-3 space-y-3">
              <h3 className="font-display text-sm font-bold tracking-wider text-ink-inverse uppercase">
                Hubs &amp; Support
              </h3>
              <ul className="space-y-2 text-[13px] text-chrome-300">
                <li>
                  <Link
                    href="/stores/muzaffarpur"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Muzaffarpur Hub (842001/02)</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offers"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <Tag className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Active Bank &amp; Promo Offers</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <Film className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Customer Video Feedback</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Store Visit Gallery</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policies/open-box-delivery"
                    className="inline-flex items-center gap-2 hover:text-gold-500 transition-colors"
                  >
                    <PackageCheck className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Open-Box Verification Guide</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile & Tablet Compact Footer (< 1024px) */}
          <div className="block lg:hidden space-y-4 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/" aria-label="Mobile Station Home" className="inline-flex items-center gap-1.5 shrink-0">
                <Image
                  src={MOBILE_STATION_BRAND.assets.icon}
                  alt="MS"
                  width={39}
                  height={18}
                  unoptimized
                  loading="eager"
                  className="h-5 w-auto shrink-0 object-contain"
                />
                <Image
                  src={MOBILE_STATION_BRAND.assets.wordmark}
                  alt="Mobile Station"
                  width={158}
                  height={16}
                  unoptimized
                  loading="eager"
                  className="h-4 w-auto object-contain"
                />
              </Link>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
              <span className="text-[11px] font-semibold text-gold-500">
                Factory Sealed Tech
              </span>
            </div>

            <p className="text-[11.5px] text-chrome-300 leading-snug">
              Authorized electronics with 18% GST invoices &amp; insured shipping across India from Muzaffarpur (842001 / 842002).
            </p>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <h4 className="font-display text-xs font-bold text-ink-inverse uppercase tracking-tight">
                  Collections
                </h4>
                <div className="flex flex-col space-y-1.5 text-[11.5px] text-chrome-300 pt-0.5">
                  <Link
                    href="/smartphones"
                    className="inline-flex items-center gap-1.5 hover:text-gold-500 transition-colors"
                  >
                    <SmartphonesIcon className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>5G Smartphones</span>
                  </Link>
                  <Link
                    href="/laptops"
                    className="inline-flex items-center gap-1.5 hover:text-gold-500 transition-colors"
                  >
                    <LaptopsIcon className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>Laptops &amp; Monitors</span>
                  </Link>
                  <Link
                    href="/audio"
                    className="inline-flex items-center gap-1.5 hover:text-gold-500 transition-colors"
                  >
                    <AudioIcon className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>Audio &amp; TWS</span>
                  </Link>
                  <Link
                    href="/keyboards-mice"
                    className="inline-flex items-center gap-1.5 hover:text-gold-500 transition-colors"
                  >
                    <KeyboardsMiceIcon className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>Peripherals &amp; GaN</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-display text-xs font-bold text-ink-inverse uppercase tracking-tight">
                  Hubs &amp; Proof
                </h4>
                <div className="flex flex-col space-y-1.5 text-[11.5px] text-chrome-300 pt-0.5">
                  <Link
                    href="/stores/muzaffarpur"
                    className="inline-flex items-center gap-1.5 hover:text-gold-500 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>Muzaffarpur Hubs</span>
                  </Link>
                  <Link
                    href="/feedback"
                    className="inline-flex items-center gap-1.5 hover:text-gold-500 transition-colors"
                  >
                    <Film className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>Video Feedback</span>
                  </Link>
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-1.5 hover:text-gold-500 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>Store Visit Gallery</span>
                  </Link>
                  <Link
                    href="/offers"
                    className="inline-flex items-center gap-1.5 hover:text-gold-500 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>Offers &amp; EMI</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="h-[1px] w-full bg-obsidian-800 my-3 md:my-6" />

          {/* Desktop Bottom Legal Bar (>= 1024px) */}
          <div className="hidden lg:flex items-center justify-between gap-4 text-xs text-chrome-400 pt-1">
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

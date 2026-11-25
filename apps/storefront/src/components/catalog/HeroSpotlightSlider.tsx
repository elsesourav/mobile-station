'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FileText, PackageCheck, ShieldCheck, Sparkles, Store } from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import type {
  StorefrontHeroBanner,
  StorefrontOffer,
  StorefrontTrustBadge,
} from '@mobile-station/types'

const TRUST_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'shield-check': ShieldCheck,
  'package-check': PackageCheck,
  'file-text': FileText,
  store: Store,
}

const SLIDE_TABS = ['01. Mobiles', '02. Laptops', '03. Audio & Gear']

interface HeroSpotlightSliderProps {
  heroBanners: StorefrontHeroBanner[]
  activeHeroIdx: number
  onSelectHero: (index: number) => void
  offers: StorefrontOffer[]
  categoryCount: number
  trustBadges: StorefrontTrustBadge[]
}

export function HeroSpotlightSlider({
  heroBanners,
  activeHeroIdx,
  onSelectHero,
  offers,
  categoryCount,
  trustBadges,
}: HeroSpotlightSliderProps) {
  const activeHero = heroBanners[activeHeroIdx] ?? heroBanners[0]

  return (
    <>
      <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-8 sm:py-10 md:py-14 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-[11px] font-semibold text-gold-500 whitespace-nowrap">
                <Sparkles className="h-3 w-3 shrink-0" />
                {activeHero.tag}
              </span>
              {offers[0] && (
                <Link
                  href="/offers"
                  className="rounded-full bg-obsidian-800 border border-obsidian-700 px-3 py-1 font-mono text-[11px] text-chrome-300 hover:border-gold-500 transition whitespace-nowrap"
                >
                  Code: <strong className="text-gold-500">{offers[0].code}</strong>
                </Link>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-ink-inverse">
              {activeHero.title}
            </h1>
            <p className="text-sm sm:text-base text-chrome-300 max-w-xl">{activeHero.subtitle}</p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <Link
                href={activeHero.cta_route}
                className="inline-flex min-h-[42px] items-center justify-center rounded-sm bg-gold-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
              >
                {activeHero.cta_text}
              </Link>
              <a
                href="#categories"
                className="inline-flex min-h-[42px] items-center justify-center rounded-sm border border-chrome-400/40 bg-obsidian-800 px-4 py-2.5 text-xs sm:text-sm font-medium text-ink-inverse hover:border-gold-500 transition"
              >
                Shop All {categoryCount} Categories
              </a>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1">
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => onSelectHero(index)}
                  className={`rounded-sm px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium border transition whitespace-nowrap ${
                    activeHeroIdx === index
                      ? 'border-gold-500 bg-obsidian-800 text-gold-500'
                      : 'border-obsidian-700 bg-obsidian-950/60 text-chrome-400 hover:text-ink-inverse'
                  }`}
                >
                  {SLIDE_TABS[index] ?? `0${index + 1}. Slide`}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            {activeHero.image_url && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-obsidian-950 ms-gold-ring">
                <Image
                  src={activeHero.image_url}
                  alt={activeHero.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <Link
                href="/stores/muzaffarpur"
                className="rounded-md bg-obsidian-800 p-3 sm:p-3.5 border border-obsidian-700 hover:border-gold-500 transition"
              >
                <p className="font-mono text-[10px] text-gold-500 uppercase">Flagship Store Hub</p>
                <p className="font-semibold text-ink-inverse mt-0.5">
                  {MOBILE_STATION_BRAND.flagshipLocation.name} (
                  {MOBILE_STATION_BRAND.flagshipLocation.pincode})
                </p>
              </Link>
              <Link
                href="/policies/gst-invoicing"
                className="rounded-md bg-obsidian-800 p-3 sm:p-3.5 border border-obsidian-700 hover:border-gold-500 transition"
              >
                <p className="font-mono text-[10px] text-gold-500 uppercase">Inventory Guarantee</p>
                <p className="font-semibold text-ink-inverse mt-0.5">
                  IMEI &amp; Serial Verified + 18% GST Invoice
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-card border-b border-chrome-200">
        <div className="page-container py-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {trustBadges.map((badge) => {
            const Icon = TRUST_ICONS[badge.icon_key] ?? ShieldCheck
            return (
              <Link
                key={badge.id}
                href={badge.cta_route}
                className="flex items-start gap-3 rounded-md border border-chrome-200 bg-surface-canvas p-4 hover:border-gold-500 transition"
              >
                <div className="rounded-sm bg-obsidian-900 p-2 text-gold-500 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-bold text-ink-primary">{badge.title}</h2>
                  <p className="text-xs text-ink-muted mt-1">{badge.subtitle}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}

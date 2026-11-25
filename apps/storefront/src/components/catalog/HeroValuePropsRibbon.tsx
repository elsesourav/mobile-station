'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, MapPin, PackageCheck, ShieldCheck, Tag } from 'lucide-react'
import type { HeroValuePropsRibbonProps } from '@/types/storefront'

function TrustIcon({ iconKey }: { iconKey: string }) {
  switch (iconKey) {
    case 'package-check':
      return <PackageCheck className="w-5 h-5 text-gold-500 shrink-0" />
    case 'file-text':
      return <FileText className="w-5 h-5 text-gold-500 shrink-0" />
    case 'store':
      return <MapPin className="w-5 h-5 text-gold-500 shrink-0" />
    default:
      return <ShieldCheck className="w-5 h-5 text-gold-500 shrink-0" />
  }
}

/**
 * Value proposition and live offers strip placed cleanly under the full-width homepage slider.
 */
export function HeroValuePropsRibbon({
  trustBadges,
  offers,
  categoryCount,
}: HeroValuePropsRibbonProps) {
  return (
    <section
      aria-label="Store Assurances and Active Offers"
      className="w-full bg-surface-card border-b border-chrome-200"
    >
      <div className="page-container py-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {trustBadges.map((badge) => (
            <Link
              key={badge.id}
              href={badge.cta_route}
              className="group flex items-start gap-3 rounded-md border border-chrome-200 bg-surface-canvas p-3.5 hover:border-gold-500 hover:bg-surface-card transition shadow-card"
            >
              <div className="w-9 h-9 rounded-sm bg-obsidian-900 flex items-center justify-center shrink-0">
                <TrustIcon iconKey={badge.icon_key} />
              </div>
              <div className="min-w-0">
                <p className="font-display text-xs font-bold text-ink-primary group-hover:text-gold-700 transition-colors">
                  {badge.title}
                </p>
                <p className="text-[11px] text-ink-muted line-clamp-2 mt-0.5 leading-snug">
                  {badge.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-sm bg-obsidian-900 text-ink-inverse px-4 py-2.5 border border-obsidian-800">
          <div className="flex items-center flex-wrap gap-2 text-xs min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase text-obsidian-950 shrink-0">
              <Tag className="w-3 h-3" />
              <span>Active Promos</span>
            </span>
            {offers.slice(0, 2).map((offer) => (
              <span key={offer.id} className="inline-flex items-center gap-1.5 text-chrome-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span className="font-mono font-bold text-gold-500">{offer.code}</span>
                <span className="hidden md:inline text-chrome-300 truncate max-w-[260px]">
                  · {offer.title}
                </span>
              </span>
            ))}
          </div>

          <Link
            href="/offers"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-gold-500 hover:underline whitespace-nowrap shrink-0"
          >
            <span>All {offers.length} Offers · {categoryCount} Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

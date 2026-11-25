'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Camera, Film } from 'lucide-react'
import type { ShowcaseEntryDTO } from '@mobile-station/types'
import { ShowcaseEntryCard, ShowcaseMediaModal } from '@/components/ShowcaseCards'

interface ShowcaseSpotlightProps {
  title: string
  subtitle: string
  badgeLabel: string
  badgeKind?: 'feedback' | 'gallery'
  items: ShowcaseEntryDTO[]
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export function ShowcaseSpotlightSection({
  title,
  subtitle,
  badgeLabel,
  badgeKind = 'feedback',
  items,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: ShowcaseSpotlightProps) {
  const [activeMedia, setActiveMedia] = useState<ShowcaseEntryDTO | null>(null)

  if (items.length === 0) return null

  return (
    <section className="page-container py-8 sm:py-10 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-900 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-500">
            {badgeKind === 'feedback' ? (
              <Film className="h-3 w-3" />
            ) : (
              <Camera className="h-3 w-3" />
            )}
            {badgeLabel}
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-primary">{title}</h2>
          <p className="text-xs sm:text-sm text-ink-muted max-w-2xl">{subtitle}</p>
        </div>

        {(primaryHref || secondaryHref) && (
          <div className="flex flex-wrap gap-2">
            {primaryHref && primaryLabel && (
              <Link
                href={primaryHref}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-semibold text-gold-500 hover:bg-obsidian-800 transition"
              >
                <span>{primaryLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            {secondaryHref && secondaryLabel && (
              <Link
                href={secondaryHref}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm border border-chrome-300 bg-surface-card px-4 py-2 text-xs font-semibold text-ink-primary hover:border-gold-500 transition"
              >
                <span>{secondaryLabel}</span>
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ShowcaseEntryCard key={item.id} item={item} onOpenMedia={setActiveMedia} />
        ))}
      </div>

      <ShowcaseMediaModal
        items={items.filter((i) => i.media_kind !== 'none' && i.media_url)}
        activeItem={activeMedia}
        onClose={() => setActiveMedia(null)}
        onSelect={setActiveMedia}
      />
    </section>
  )
}

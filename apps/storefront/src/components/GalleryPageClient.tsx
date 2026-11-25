'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, MapPin, Store } from 'lucide-react'
import {
  SHOWCASE_CATEGORY_LABELS,
  type ShowcaseCategory,
  type ShowcaseEntryDTO,
  type ShowcaseSummaryStats,
} from '@mobile-station/types'
import type { GalleryHubFilterTab } from '@/types/storefront'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ShowcaseEntryCard } from '@/components/showcase/ShowcaseEntryCard'
import { ShowcaseMediaModal } from '@/components/showcase/ShowcaseMediaModal'

interface GalleryPageClientProps {
  initialItems: ShowcaseEntryDTO[]
  stats: ShowcaseSummaryStats
}

const GALLERY_CATEGORY_OPTIONS: ShowcaseCategory[] = [
  'in_store_pickup',
  'open_box_check',
  'audio_keyboard_demo',
  'launch_event',
  'customer_selfie',
]

export function GalleryPageClient({ initialItems, stats }: GalleryPageClientProps) {
  const [hubFilter, setHubFilter] = useState<GalleryHubFilterTab>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [activeMedia, setActiveMedia] = useState<ShowcaseEntryDTO | null>(null)

  const filteredItems = useMemo(() => {
    return initialItems.filter((entry) => {
      if (hubFilter !== 'all' && entry.hub_location !== hubFilter) return false
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false
      return true
    })
  }, [initialItems, hubFilter, categoryFilter])

  return (
    <StorefrontChrome>
      <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-8 sm:py-12 space-y-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-chrome-300 hover:text-gold-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-[11px] font-semibold text-gold-500">
              <Camera className="h-3.5 w-3.5" />
              MUZAFFARPUR HUB &amp; EXPERIENCE GALLERY
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink-inverse">
                Store Visit &amp; Open-Box Desk Gallery
              </h1>
              <p className="text-sm text-chrome-300">
                Explore real customer pickup moments, sealed IMEI inspection counters, and live
                audio/keyboard demos at Motijheel Road (842001) and Club Road (842002).
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/stores/muzaffarpur"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-gold-500 px-4 py-2.5 text-xs font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
              >
                <MapPin className="h-4 w-4" />
                <span>Hub Hours &amp; Directions</span>
              </Link>
              <Link
                href="/feedback"
                className="inline-flex min-h-[44px] items-center rounded-sm border border-obsidian-700 bg-obsidian-800 px-4 py-2.5 text-xs font-semibold text-ink-inverse hover:border-gold-500 transition"
              >
                Watch Customer Video Reviews →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-8 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'all', label: `All Hub Moments (${stats.store_visit_total})` },
                  { id: 'motijheel-842001', label: 'Motijheel Flagship (842001)' },
                  { id: 'club-road-842002', label: 'Club Road Tech Center (842002)' },
                ] as const
              ).map((tabOption) => (
                <button
                  key={tabOption.id}
                  type="button"
                  onClick={() => setHubFilter(tabOption.id)}
                  className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                    hubFilter === tabOption.id
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                      : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
                  }`}
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>{tabOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                categoryFilter === 'all'
                  ? 'border-gold-500 bg-gold-100 text-gold-700 font-semibold'
                  : 'border-chrome-200 bg-surface-card text-ink-muted hover:text-ink-primary'
              }`}
            >
              All Visit Highlights
            </button>
            {GALLERY_CATEGORY_OPTIONS.map((categoryKey) => (
              <button
                key={categoryKey}
                type="button"
                onClick={() =>
                  setCategoryFilter(categoryFilter === categoryKey ? 'all' : categoryKey)
                }
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  categoryFilter === categoryKey
                    ? 'border-gold-500 bg-gold-100 text-gold-700 font-semibold'
                    : 'border-chrome-200 bg-surface-card text-ink-muted hover:text-ink-primary'
                }`}
              >
                {SHOWCASE_CATEGORY_LABELS[categoryKey]}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-md border border-chrome-200 bg-surface-card p-10 text-center space-y-3">
            <p className="font-display text-base font-bold text-ink-primary">
              No store visit photos or clips match this filter yet.
            </p>
            <button
              type="button"
              onClick={() => {
                setHubFilter('all')
                setCategoryFilter('all')
              }}
              className="rounded-sm bg-gold-500 px-4 py-2 text-xs font-bold text-obsidian-950"
            >
              Show All Gallery Moments
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ShowcaseEntryCard key={item.id} item={item} onOpenMedia={setActiveMedia} />
            ))}
          </div>
        )}
      </section>

      <ShowcaseMediaModal
        items={filteredItems.filter((entry) => entry.media_kind !== 'none' && entry.media_url)}
        activeItem={activeMedia}
        onClose={() => setActiveMedia(null)}
        onSelect={setActiveMedia}
      />
    </StorefrontChrome>
  )
}

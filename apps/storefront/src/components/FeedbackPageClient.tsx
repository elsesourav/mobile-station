'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Film,
  MessageSquarePlus,
  Play,
  Star,
} from 'lucide-react'
import {
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_HUB_LABELS,
  SHOWCASE_HUB_LOCATIONS,
  type ShowcaseCategory,
  type ShowcaseEntryDTO,
  type ShowcaseSummaryStats,
} from '@mobile-station/types'
import type { FeedbackMediaFilterTab } from '@/types/storefront'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { FeedbackSubmitForm } from '@/components/feedback/FeedbackSubmitForm'
import {
  ShowcaseEntryCard,
  StarRatingRow,
  formatShowcaseDuration,
} from '@/components/showcase/ShowcaseEntryCard'
import { ShowcaseMediaModal } from '@/components/showcase/ShowcaseMediaModal'

interface FeedbackPageClientProps {
  initialItems: ShowcaseEntryDTO[]
  stats: ShowcaseSummaryStats
}

const FEEDBACK_CATEGORY_OPTIONS: ShowcaseCategory[] = [
  'video_unboxing',
  'video_review',
  'open_box_check',
  'in_store_pickup',
  'written_review',
]

export function FeedbackPageClient({ initialItems, stats }: FeedbackPageClientProps) {
  const [mediaFilter, setMediaFilter] = useState<FeedbackMediaFilterTab>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [hubFilter, setHubFilter] = useState<string>('all')
  const [activeMedia, setActiveMedia] = useState<ShowcaseEntryDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const filteredItems = useMemo(() => {
    return initialItems.filter((entry) => {
      if (mediaFilter === 'video' && entry.media_kind !== 'video') return false
      if (mediaFilter === 'written' && entry.media_kind === 'video') return false
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false
      if (hubFilter !== 'all' && entry.hub_location !== hubFilter) return false
      return true
    })
  }, [initialItems, mediaFilter, categoryFilter, hubFilter])

  const featuredVideo = useMemo(
    () =>
      filteredItems.find((entry) => entry.media_kind === 'video' && entry.is_featured) ??
      filteredItems.find((entry) => entry.media_kind === 'video') ??
      null,
    [filteredItems]
  )

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
              <Film className="h-3.5 w-3.5" />
              VERIFIED VIDEO &amp; BUYER REVIEWS
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink-inverse">
                Customer Video Feedback &amp; Unboxings
              </h1>
              <p className="text-sm text-chrome-300">
                Real open-box IMEI checks, flagship unboxings, and long-term audio &amp; desk
                reviews from buyers across Muzaffarpur (842001 / 842002) and Pan-India delivery hubs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setFormOpen((open) => !open)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-gold-500 px-4 py-2.5 text-xs font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span>{formOpen ? 'Hide Feedback Form' : 'Submit Your Feedback'}</span>
              </button>
              <Link
                href="/gallery"
                className="inline-flex min-h-[44px] items-center rounded-sm border border-obsidian-700 bg-obsidian-800 px-4 py-2.5 text-xs font-semibold text-ink-inverse hover:border-gold-500 transition"
              >
                Visit Store Gallery →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-sm border border-obsidian-700 bg-obsidian-800/70 p-3">
              <p className="font-mono text-[10px] uppercase text-chrome-400">Average Rating</p>
              <p className="font-display text-lg font-bold text-gold-500 mt-0.5 tabular-nums">
                {stats.avg_rating ? `${stats.avg_rating} / 5.0 ★` : '4.9 / 5.0 ★'}
              </p>
            </div>
            <div className="rounded-sm border border-obsidian-700 bg-obsidian-800/70 p-3">
              <p className="font-mono text-[10px] uppercase text-chrome-400">Video Reels</p>
              <p className="font-display text-lg font-bold text-ink-inverse mt-0.5 tabular-nums">
                {stats.video_feedback_total} Verified Clips
              </p>
            </div>
            <div className="rounded-sm border border-obsidian-700 bg-obsidian-800/70 p-3">
              <p className="font-mono text-[10px] uppercase text-chrome-400">Total Reviews</p>
              <p className="font-display text-lg font-bold text-ink-inverse mt-0.5 tabular-nums">
                {stats.feedback_total} Published
              </p>
            </div>
            <div className="rounded-sm border border-obsidian-700 bg-obsidian-800/70 p-3">
              <p className="font-mono text-[10px] uppercase text-chrome-400">Compliance</p>
              <p className="font-display text-sm sm:text-base font-bold text-commerce-savings mt-0.5">
                IMEI &amp; Open-Box Checked
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-8 space-y-8">
        {formOpen && <FeedbackSubmitForm />}

        {featuredVideo && featuredVideo.media_url && (
          <div className="grid lg:grid-cols-12 gap-5 rounded-lg border border-obsidian-800 bg-obsidian-900 text-ink-inverse overflow-hidden shadow-modal">
            <div className="lg:col-span-7 bg-obsidian-950 flex items-center justify-center">
              <video
                src={featuredVideo.media_url}
                poster={featuredVideo.thumbnail_url || undefined}
                controls
                playsInline
                preload="metadata"
                className="w-full aspect-video object-contain"
              />
            </div>
            <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-obsidian-950">
                    <Play className="h-3 w-3 fill-current" />
                    FEATURED VIDEO · {formatShowcaseDuration(featuredVideo.duration_seconds)}
                  </span>
                  {featuredVideo.rating && <StarRatingRow rating={featuredVideo.rating} />}
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-inverse">
                  {featuredVideo.title}
                </h2>
                <p className="text-xs sm:text-sm text-chrome-300 leading-relaxed">
                  {featuredVideo.quote_or_caption}
                </p>
              </div>

              <div className="border-t border-obsidian-800 pt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-ink-inverse font-semibold">
                  <span>{featuredVideo.author_name}</span>
                  {featuredVideo.is_verified_buyer && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-commerce-savings">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified Buyer
                    </span>
                  )}
                </div>
                <p className="text-chrome-400">
                  {featuredVideo.author_city} · {SHOWCASE_HUB_LABELS[featuredVideo.hub_location]}
                </p>
                {featuredVideo.product_handle && (
                  <Link
                    href={`/products/${featuredVideo.product_handle}`}
                    className="inline-flex items-center gap-1 text-gold-500 font-semibold hover:underline pt-1"
                  >
                    Inspect {featuredVideo.product_title || featuredVideo.product_handle} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: 'All Feedback' },
                  { id: 'video', label: 'Video Reels Only' },
                  { id: 'written', label: 'Photo & Text Reviews' },
                ] as const
              ).map((tabOption) => (
                <button
                  key={tabOption.id}
                  type="button"
                  onClick={() => setMediaFilter(tabOption.id)}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                    mediaFilter === tabOption.id
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                      : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
                  }`}
                >
                  {tabOption.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setHubFilter('all')}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  hubFilter === 'all'
                    ? 'border-obsidian-900 bg-obsidian-900 text-ink-inverse'
                    : 'border-chrome-200 bg-surface-card text-ink-secondary'
                }`}
              >
                All Hubs
              </button>
              {SHOWCASE_HUB_LOCATIONS.map((hubLocation) => (
                <button
                  key={hubLocation}
                  type="button"
                  onClick={() => setHubFilter(hubFilter === hubLocation ? 'all' : hubLocation)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    hubFilter === hubLocation
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                      : 'border-chrome-200 bg-surface-card text-ink-secondary hover:border-gold-500'
                  }`}
                >
                  {hubLocation === 'motijheel-842001'
                    ? 'Motijheel (842001)'
                    : hubLocation === 'club-road-842002'
                      ? 'Club Road (842002)'
                      : 'Pan-India'}
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
              All Feedback Types
            </button>
            {FEEDBACK_CATEGORY_OPTIONS.map((categoryKey) => (
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
            <Star className="h-8 w-8 mx-auto text-gold-700" />
            <p className="font-display text-base font-bold text-ink-primary">
              No reviews match this combination of filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setMediaFilter('all')
                setCategoryFilter('all')
                setHubFilter('all')
              }}
              className="rounded-sm bg-gold-500 px-4 py-2 text-xs font-bold text-obsidian-950"
            >
              Reset Feedback Filters
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

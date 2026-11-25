'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Play, Star } from 'lucide-react'
import type { ShowcaseEntryDTO, ShowcaseSummaryStats } from '@mobile-station/types'
import { StarRatingRow } from '@/components/showcase/ShowcaseEntryCard'
import { ShowcaseMediaModal } from '@/components/showcase/ShowcaseMediaModal'

interface CleanFeedbackSectionProps {
  items: ShowcaseEntryDTO[]
  stats?: ShowcaseSummaryStats
}

/**
 * Clean, uncluttered customer reviews & video feedback strip placed at the bottom of the homepage.
 */
export function CleanFeedbackSection({ items, stats }: CleanFeedbackSectionProps) {
  const [activeMedia, setActiveMedia] = useState<ShowcaseEntryDTO | null>(null)

  if (items.length === 0) return null

  const avgRating = stats?.avg_rating ?? 4.9

  return (
    <section
      aria-label="Customer Reviews and Feedback"
      className="border-t border-chrome-200 bg-surface-card"
    >
      <div className="page-container py-10 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-[11px] font-mono font-semibold text-gold-700">
              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500 shrink-0" />
              <span className="tabular-nums">{avgRating} / 5.0 · Verified Customer Feedback</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-primary">
              What Buyers Say
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-1 text-gold-700 hover:underline"
            >
              <span>All Reviews &amp; Videos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1 text-ink-secondary hover:text-gold-700 transition-colors"
            >
              <span>Store Visit Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {items.slice(0, 3).map((item) => {
            const hasMedia = item.media_kind !== 'none' && Boolean(item.media_url)
            const previewSrc = item.thumbnail_url || item.media_url

            return (
              <article
                key={item.id}
                className="rounded-md border border-chrome-200 bg-surface-canvas/50 p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-gold-500/70 transition"
              >
                <div className="space-y-3">
                  {hasMedia && previewSrc && (
                    <button
                      type="button"
                      onClick={() => setActiveMedia(item)}
                      aria-label={`Play or inspect media for ${item.title}`}
                      className="group relative block w-full aspect-video rounded-sm overflow-hidden bg-obsidian-950"
                    >
                      <Image
                        src={previewSrc}
                        alt={item.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 92vw, 380px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {item.media_kind === 'video' && (
                        <span className="absolute inset-0 flex items-center justify-center bg-obsidian-950/20">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-obsidian-950 shadow-gold group-hover:scale-110 transition">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </span>
                        </span>
                      )}
                    </button>
                  )}

                  {item.rating && <StarRatingRow rating={item.rating} />}

                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed line-clamp-3">
                    &ldquo;{item.quote_or_caption}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-chrome-200/80 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-primary flex items-center gap-1.5">
                      <span className="truncate">{item.author_name}</span>
                      {item.is_verified_buyer && (
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-commerce-savings shrink-0"
                          aria-label="Verified Buyer"
                        />
                      )}
                    </p>
                    <p className="text-[11px] text-ink-muted truncate">{item.author_city}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <ShowcaseMediaModal
        items={items.filter((entry) => entry.media_kind !== 'none' && entry.media_url)}
        activeItem={activeMedia}
        onClose={() => setActiveMedia(null)}
        onSelect={setActiveMedia}
      />
    </section>
  )
}

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Film,
  MessageSquarePlus,
  Play,
  ShieldCheck,
  Star,
} from 'lucide-react'
import {
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_HUB_LABELS,
  SHOWCASE_HUB_LOCATIONS,
  type ShowcaseCategory,
  type ShowcaseEntryDTO,
  type ShowcaseHubLocation,
  type ShowcaseSummaryStats,
} from '@mobile-station/types'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import {
  ShowcaseEntryCard,
  ShowcaseMediaModal,
  StarRatingRow,
  formatDuration,
} from '@/components/ShowcaseCards'

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
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'written'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [hubFilter, setHubFilter] = useState<string>('all')
  const [activeMedia, setActiveMedia] = useState<ShowcaseEntryDTO | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    ok: boolean
    message: string
  } | null>(null)
  const [reviewForm, setReviewForm] = useState({
    author_name: '',
    author_city: 'Muzaffarpur, Bihar',
    title: '',
    quote_or_caption: '',
    rating: 5,
    hub_location: 'motijheel-842001' as ShowcaseHubLocation,
    category: 'written_review' as 'written_review' | 'in_store_pickup' | 'open_box_check',
    product_title: '',
  })

  const filtered = useMemo(() => {
    return initialItems.filter((item) => {
      if (mediaFilter === 'video' && item.media_kind !== 'video') return false
      if (mediaFilter === 'written' && item.media_kind === 'video') return false
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (hubFilter !== 'all' && item.hub_location !== hubFilter) return false
      return true
    })
  }, [initialItems, mediaFilter, categoryFilter, hubFilter])

  const featuredVideo = useMemo(
    () =>
      filtered.find((item) => item.media_kind === 'video' && item.is_featured) ??
      filtered.find((item) => item.media_kind === 'video') ??
      null,
    [filtered]
  )

  const submitPublicFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus(null)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      if (pubKey) headers['x-publishable-api-key'] = pubKey

      const res = await fetch('/medusa/store/showcase', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          entry_type: 'customer_feedback',
          category: reviewForm.category,
          title: reviewForm.title.trim(),
          quote_or_caption: reviewForm.quote_or_caption.trim(),
          author_name: reviewForm.author_name.trim(),
          author_city: reviewForm.author_city.trim(),
          hub_location: reviewForm.hub_location,
          rating: reviewForm.rating,
          product_title: reviewForm.product_title.trim() || null,
        }),
      })
      const payload = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        throw new Error(payload.message || 'Could not submit your feedback right now')
      }

      setSubmitStatus({
        ok: true,
        message:
          payload.message ||
          'Thank you! Your review has been queued for Muzaffarpur Hub moderation.',
      })
      setReviewForm({
        author_name: '',
        author_city: 'Muzaffarpur, Bihar',
        title: '',
        quote_or_caption: '',
        rating: 5,
        hub_location: 'motijheel-842001',
        category: 'written_review',
        product_title: '',
      })
    } catch (err) {
      setSubmitStatus({
        ok: false,
        message: err instanceof Error ? err.message : 'Submission error. Try again shortly.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StorefrontChrome>
      {/* Hero Banner */}
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
              VERIFIED VIDEO & BUYER REVIEWS
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
                onClick={() => setFormOpen((v) => !v)}
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

          {/* Summary KPI Strip */}
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
        {/* Optional Buyer Review Submission Form */}
        {formOpen && (
          <form
            onSubmit={submitPublicFeedback}
            className="rounded-md border border-chrome-200 bg-surface-card p-5 sm:p-6 shadow-card space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-chrome-200 pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-ink-primary">
                  Share Your Mobile Station Purchase Experience
                </h2>
                <p className="text-xs text-ink-muted">
                  Submitted feedback enters our Hub moderation queue for authenticity check before
                  publishing.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-commerce-savings shrink-0" />
            </div>

            {submitStatus && (
              <div
                className={`rounded-sm p-3 text-xs font-medium ${
                  submitStatus.ok
                    ? 'bg-commerce-obdBg text-commerce-obdText'
                    : 'bg-commerce-errorBg text-commerce-errorText'
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <label className="space-y-1">
                <span className="font-semibold text-ink-primary">Your Name *</span>
                <input
                  required
                  minLength={2}
                  value={reviewForm.author_name}
                  onChange={(e) => setReviewForm((p) => ({ ...p, author_name: e.target.value }))}
                  placeholder="e.g. Ritu Raj"
                  className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-ink-primary">City &amp; State *</span>
                <input
                  required
                  minLength={2}
                  value={reviewForm.author_city}
                  onChange={(e) => setReviewForm((p) => ({ ...p, author_city: e.target.value }))}
                  placeholder="Muzaffarpur, Bihar"
                  className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-ink-primary">Order Hub *</span>
                <select
                  value={reviewForm.hub_location}
                  onChange={(e) =>
                    setReviewForm((p) => ({
                      ...p,
                      hub_location: e.target.value as ShowcaseHubLocation,
                    }))
                  }
                  className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
                >
                  {SHOWCASE_HUB_LOCATIONS.map((h) => (
                    <option key={h} value={h}>
                      {SHOWCASE_HUB_LABELS[h]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <label className="sm:col-span-2 space-y-1">
                <span className="font-semibold text-ink-primary">Review Headline *</span>
                <input
                  required
                  minLength={4}
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Fast 2-hour pickup and sealed box GST bill at Motijheel Hub"
                  className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-ink-primary">Rating *</span>
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm((p) => ({ ...p, rating: Number(e.target.value) || 5 }))
                  }
                  className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
                >
                  <option value={5}>5 Stars — Outstanding</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Satisfactory</option>
                  <option value={2}>2 Stars — Fair</option>
                  <option value={1}>1 Star — Needs Improvement</option>
                </select>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <label className="space-y-1">
                <span className="font-semibold text-ink-primary">Device Purchased (Optional)</span>
                <input
                  value={reviewForm.product_title}
                  onChange={(e) => setReviewForm((p) => ({ ...p, product_title: e.target.value }))}
                  placeholder="e.g. Apple iPhone 16 Pro 5G / Keychron K2 Pro"
                  className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-ink-primary">Experience Category</span>
                <select
                  value={reviewForm.category}
                  onChange={(e) =>
                    setReviewForm((p) => ({
                      ...p,
                      category: e.target.value as
                        | 'written_review'
                        | 'in_store_pickup'
                        | 'open_box_check',
                    }))
                  }
                  className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
                >
                  <option value="written_review">Verified Purchase Review</option>
                  <option value="in_store_pickup">In-Store Hub Pickup</option>
                  <option value="open_box_check">Doorstep Open-Box Verification</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-ink-primary">Detailed Feedback *</span>
              <textarea
                required
                minLength={10}
                rows={3}
                value={reviewForm.quote_or_caption}
                onChange={(e) => setReviewForm((p) => ({ ...p, quote_or_caption: e.target.value }))}
                placeholder="Tell fellow tech buyers about box sealing, delivery speed, GST invoice ITC, or store demo help..."
                className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[42px] items-center justify-center rounded-sm bg-obsidian-900 px-5 py-2 text-xs font-bold text-gold-500 hover:bg-obsidian-800 transition disabled:opacity-60"
            >
              {submitting ? 'Submitting Review...' : 'Submit Feedback for Moderation'}
            </button>
          </form>
        )}

        {/* Featured Video Spotlight */}
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
                    FEATURED VIDEO · {formatDuration(featuredVideo.duration_seconds)}
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

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: 'All Feedback' },
                  { id: 'video', label: 'Video Reels Only' },
                  { id: 'written', label: 'Photo & Text Reviews' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMediaFilter(tab.id)}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                    mediaFilter === tab.id
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                      : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
                  }`}
                >
                  {tab.label}
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
              {SHOWCASE_HUB_LOCATIONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHubFilter(hubFilter === h ? 'all' : h)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    hubFilter === h
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                      : 'border-chrome-200 bg-surface-card text-ink-secondary hover:border-gold-500'
                  }`}
                >
                  {h === 'motijheel-842001'
                    ? 'Motijheel (842001)'
                    : h === 'club-road-842002'
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
            {FEEDBACK_CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  categoryFilter === cat
                    ? 'border-gold-500 bg-gold-100 text-gold-700 font-semibold'
                    : 'border-chrome-200 bg-surface-card text-ink-muted hover:text-ink-primary'
                }`}
              >
                {SHOWCASE_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
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
            {filtered.map((item) => (
              <ShowcaseEntryCard key={item.id} item={item} onOpenMedia={setActiveMedia} />
            ))}
          </div>
        )}
      </section>

      <ShowcaseMediaModal
        items={filtered.filter((i) => i.media_kind !== 'none' && i.media_url)}
        activeItem={activeMedia}
        onClose={() => setActiveMedia(null)}
        onSelect={setActiveMedia}
      />
    </StorefrontChrome>
  )
}

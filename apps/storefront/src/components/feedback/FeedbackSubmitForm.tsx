'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import {
  SHOWCASE_HUB_LABELS,
  SHOWCASE_HUB_LOCATIONS,
  type PublicFeedbackSubmitResponse,
  type ShowcaseHubLocation,
} from '@mobile-station/types'
import type {
  FeedbackSubmissionAlert,
  FeedbackSubmissionFormState,
  PublicReviewCategory,
} from '@/types/storefront'

const INITIAL_FEEDBACK_FORM: FeedbackSubmissionFormState = {
  author_name: '',
  author_city: 'Muzaffarpur, Bihar',
  title: '',
  quote_or_caption: '',
  rating: 5,
  hub_location: 'motijheel-842001',
  category: 'written_review',
  product_title: '',
}

export function FeedbackSubmitForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitAlert, setSubmitAlert] = useState<FeedbackSubmissionAlert | null>(null)
  const [formState, setFormState] = useState<FeedbackSubmissionFormState>(INITIAL_FEEDBACK_FORM)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setSubmitAlert(null)

    try {
      const headers = new Headers({ 'Content-Type': 'application/json' })
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      if (publishableKey) {
        headers.set('x-publishable-api-key', publishableKey)
      }

      const response = await fetch('/medusa/store/showcase', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          entry_type: 'customer_feedback',
          category: formState.category,
          title: formState.title.trim(),
          quote_or_caption: formState.quote_or_caption.trim(),
          author_name: formState.author_name.trim(),
          author_city: formState.author_city.trim(),
          hub_location: formState.hub_location,
          rating: formState.rating,
          product_title: formState.product_title.trim() || null,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as Partial<PublicFeedbackSubmitResponse>
      if (!response.ok) {
        throw new Error(payload.message || 'Could not submit your feedback right now')
      }

      setSubmitAlert({
        ok: true,
        message:
          payload.message ||
          'Thank you! Your review has been queued for Muzaffarpur Hub moderation.',
      })
      setFormState(INITIAL_FEEDBACK_FORM)
    } catch (error) {
      setSubmitAlert({
        ok: false,
        message: error instanceof Error ? error.message : 'Submission error. Try again shortly.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
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

      {submitAlert && (
        <div
          className={`rounded-sm p-3 text-xs font-medium ${
            submitAlert.ok
              ? 'bg-commerce-obdBg text-commerce-obdText'
              : 'bg-commerce-errorBg text-commerce-errorText'
          }`}
        >
          {submitAlert.message}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 text-xs">
        <label className="space-y-1">
          <span className="font-semibold text-ink-primary">Your Name *</span>
          <input
            required
            minLength={2}
            value={formState.author_name}
            onChange={(e) => setFormState((prev) => ({ ...prev, author_name: e.target.value }))}
            placeholder="e.g. Ritu Raj"
            className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="font-semibold text-ink-primary">City &amp; State *</span>
          <input
            required
            minLength={2}
            value={formState.author_city}
            onChange={(e) => setFormState((prev) => ({ ...prev, author_city: e.target.value }))}
            placeholder="Muzaffarpur, Bihar"
            className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="font-semibold text-ink-primary">Order Hub *</span>
          <select
            value={formState.hub_location}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                hub_location: e.target.value as ShowcaseHubLocation,
              }))
            }
            className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
          >
            {SHOWCASE_HUB_LOCATIONS.map((hubLocation) => (
              <option key={hubLocation} value={hubLocation}>
                {SHOWCASE_HUB_LABELS[hubLocation]}
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
            value={formState.title}
            onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Fast 2-hour pickup and sealed box GST bill at Motijheel Hub"
            className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="font-semibold text-ink-primary">Rating *</span>
          <select
            value={formState.rating}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, rating: Number(e.target.value) || 5 }))
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
            value={formState.product_title}
            onChange={(e) => setFormState((prev) => ({ ...prev, product_title: e.target.value }))}
            placeholder="e.g. Apple iPhone 16 Pro 5G / Keychron K2 Pro"
            className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-ink-primary focus:border-gold-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="font-semibold text-ink-primary">Experience Category</span>
          <select
            value={formState.category}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                category: e.target.value as PublicReviewCategory,
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
          value={formState.quote_or_caption}
          onChange={(e) => setFormState((prev) => ({ ...prev, quote_or_caption: e.target.value }))}
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
  )
}

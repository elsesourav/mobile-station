'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Play,
  Star,
  Store,
  X,
} from 'lucide-react'
import {
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_HUB_LABELS,
  type ShowcaseEntryDTO,
} from '@mobile-station/types'
import { getProductByHandle } from '@/lib/catalog'

function resolveProductDisplayTitle(
  productTitle: string | null | undefined,
  productHandle: string | null | undefined
): string {
  if (productTitle && productTitle.trim()) return productTitle.trim()
  if (!productHandle) return ''
  const matched = getProductByHandle(productHandle)
  if (matched) return matched.title
  return productHandle
    .split('-')
    .map((w) => (w === '5g' ? '5G' : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || !Number.isFinite(seconds)) return 'Reel'
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function StarRatingRow({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5 text-gold-500" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating ? 'fill-gold-500 text-gold-500' : 'text-chrome-300'
          }`}
        />
      ))}
    </div>
  )
}

interface ShowcaseCardProps {
  item: ShowcaseEntryDTO
  onOpenMedia: (item: ShowcaseEntryDTO) => void
}

export function ShowcaseEntryCard({ item, onOpenMedia }: ShowcaseCardProps) {
  const hasVisualMedia = item.media_kind !== 'none' && Boolean(item.media_url)
  const previewSrc = item.thumbnail_url || item.media_url

  return (
    <article className="rounded-md border border-chrome-200 bg-surface-card overflow-hidden shadow-card hover:shadow-card-hover hover:border-gold-500/70 transition flex flex-col justify-between">
      <div>
        {/* Dedicated top metadata strip so badges never obscure photos or videos */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-chrome-200/80 bg-surface-muted px-4 py-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-900 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-gold-500 whitespace-nowrap">
            {SHOWCASE_CATEGORY_LABELS[item.category]}
          </span>
          {item.rating ? (
            <StarRatingRow rating={item.rating} />
          ) : (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-ink-muted whitespace-nowrap">
              <Store className="h-3 w-3 text-gold-700" />
              Hub Visit
            </span>
          )}
        </div>

        {/* Visual stage */}
        {hasVisualMedia && previewSrc && (
          <button
            type="button"
            onClick={() => onOpenMedia(item)}
            className="group relative block w-full aspect-video bg-obsidian-950 overflow-hidden text-left"
            aria-label={`Open ${item.media_kind === 'video' ? 'video' : 'photo'} for ${item.title}`}
          >
            <Image
              src={previewSrc}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/75 via-transparent to-transparent" />

            {item.media_kind === 'video' ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-obsidian-950 shadow-gold group-hover:scale-110 transition">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </span>
              </span>
            ) : null}

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[11px] font-mono text-ink-inverse">
              <span className="truncate">
                {item.media_kind === 'video' ? 'Watch Customer Reel' : 'View Full Photo'}
              </span>
              {item.media_kind === 'video' && (
                <span className="rounded bg-obsidian-950/85 px-2 py-0.5 text-[10px] font-semibold text-gold-500 shrink-0">
                  {formatDuration(item.duration_seconds)}
                </span>
              )}
            </div>
          </button>
        )}

        {/* Narrative body */}
        <div className="p-4 space-y-2.5">
          <h3 className="font-display text-base font-bold leading-snug text-ink-primary">
            {item.title}
          </h3>
          <p className="text-xs leading-relaxed text-ink-secondary">{item.quote_or_caption}</p>
        </div>
      </div>

      {/* Footer attribution & product link */}
      <div className="border-t border-chrome-200 px-4 py-3 space-y-2 bg-surface-canvas/50">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="min-w-0">
            <p className="font-semibold text-ink-primary flex items-center gap-1.5">
              <span className="truncate">{item.author_name}</span>
              {item.is_verified_buyer && (
                <CheckCircle2
                  className="h-3.5 w-3.5 text-commerce-savings shrink-0"
                  aria-label="Verified Buyer"
                />
              )}
            </p>
            <p className="text-[11px] text-ink-muted truncate">{item.author_city}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-xs bg-surface-card border border-chrome-200 px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
            <MapPin className="h-3 w-3 text-gold-700 shrink-0" />
            <span className="truncate max-w-[140px]">
              {item.hub_location === 'motijheel-842001'
                ? 'Motijheel (842001)'
                : item.hub_location === 'club-road-842002'
                  ? 'Club Road (842002)'
                  : 'Pan-India Express'}
            </span>
          </span>
        </div>

        {item.product_handle && (
          <div className="pt-1">
            <Link
              href={`/products/${item.product_handle}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-700 hover:underline"
            >
              <span>
                Shop {resolveProductDisplayTitle(item.product_title, item.product_handle)} →
              </span>
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}

interface ShowcaseMediaModalProps {
  items: ShowcaseEntryDTO[]
  activeItem: ShowcaseEntryDTO | null
  onClose: () => void
  onSelect: (item: ShowcaseEntryDTO) => void
}

export function ShowcaseMediaModal({
  items,
  activeItem,
  onClose,
  onSelect,
}: ShowcaseMediaModalProps) {
  useEffect(() => {
    if (!activeItem) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (!items.length) return
      const idx = items.findIndex((x) => x.id === activeItem.id)
      if (idx === -1) return
      if (e.key === 'ArrowRight') {
        onSelect(items[(idx + 1) % items.length])
      } else if (e.key === 'ArrowLeft') {
        onSelect(items[(idx - 1 + items.length) % items.length])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeItem, items, onClose, onSelect])

  if (!activeItem) return null
  const idx = items.findIndex((x) => x.id === activeItem.id)

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-obsidian-950/85 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={activeItem.title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg border border-obsidian-700 bg-obsidian-900 text-ink-inverse shadow-modal overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-obsidian-800 px-4 py-3">
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-gold-500">
              {SHOWCASE_CATEGORY_LABELS[activeItem.category]} ·{' '}
              {SHOWCASE_HUB_LABELS[activeItem.hub_location]}
            </span>
            <h2 className="font-display text-base sm:text-lg font-bold truncate">
              {activeItem.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media viewer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-obsidian-700 text-chrome-300 hover:border-gold-500 hover:text-gold-500 shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {activeItem.media_url && activeItem.media_kind === 'video' ? (
          <div className="bg-obsidian-950 flex justify-center">
            <video
              key={activeItem.id}
              src={activeItem.media_url}
              poster={activeItem.thumbnail_url || undefined}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="w-full max-h-[60vh] object-contain"
            />
          </div>
        ) : activeItem.media_url && activeItem.media_kind === 'image' ? (
          <div className="relative h-[45vh] sm:h-[58vh] w-full bg-obsidian-950">
            <Image
              src={activeItem.media_url}
              alt={activeItem.title}
              fill
              sizes="(max-width: 768px) 95vw, 800px"
              className="object-contain p-2"
            />
          </div>
        ) : null}

        <div className="p-4 sm:p-5 space-y-3 bg-obsidian-900">
          <p className="text-xs sm:text-sm text-chrome-200 leading-relaxed">
            {activeItem.quote_or_caption}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-obsidian-800 pt-3">
            <div className="text-xs text-chrome-300">
              <span className="font-semibold text-ink-inverse">{activeItem.author_name}</span> ·{' '}
              <span>{activeItem.author_city}</span>
              {activeItem.rating ? (
                <span className="ml-2 font-mono text-gold-500">{activeItem.rating}/5 ★</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {items.length > 1 && idx !== -1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous media"
                    onClick={() => onSelect(items[(idx - 1 + items.length) % items.length])}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-obsidian-700 text-chrome-200 hover:border-gold-500 hover:text-gold-500"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next media"
                    onClick={() => onSelect(items[(idx + 1) % items.length])}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-obsidian-700 text-chrome-200 hover:border-gold-500 hover:text-gold-500"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
              {activeItem.product_handle && (
                <Link
                  href={`/products/${activeItem.product_handle}`}
                  onClick={onClose}
                  className="inline-flex min-h-[36px] items-center rounded-sm bg-gold-500 px-3 py-1.5 text-xs font-bold text-obsidian-950 hover:bg-gold-600"
                >
                  View Product →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

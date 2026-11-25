'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, MapPin, Play, Star, Store } from 'lucide-react'
import { SHOWCASE_CATEGORY_LABELS, type ShowcaseEntryDTO } from '@mobile-station/types'
import { getProductByHandle } from '@/lib/catalog'

function resolveProductDisplayTitle(
  productTitle: string | null | undefined,
  productHandle: string | null | undefined
): string {
  if (productTitle && productTitle.trim()) return productTitle.trim()
  if (!productHandle) return ''
  const matchedProduct = getProductByHandle(productHandle)
  if (matchedProduct) return matchedProduct.title
  return productHandle
    .split('-')
    .map((word) => (word === '5g' ? '5G' : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

export function formatShowcaseDuration(seconds: number | null): string {
  if (!seconds || !Number.isFinite(seconds)) return 'Reel'
  const minutes = Math.floor(seconds / 60)
  const remainderSeconds = Math.round(seconds % 60)
  return `${minutes}:${remainderSeconds.toString().padStart(2, '0')}`
}

export function StarRatingRow({ rating }: { rating: number }) {
  return (
    <div
      className="inline-flex items-center gap-0.5 text-gold-500"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <Star
          key={starIndex}
          className={`h-3.5 w-3.5 ${
            starIndex <= rating ? 'fill-gold-500 text-gold-500' : 'text-chrome-300'
          }`}
        />
      ))}
    </div>
  )
}

interface ShowcaseEntryCardProps {
  item: ShowcaseEntryDTO
  onOpenMedia: (entry: ShowcaseEntryDTO) => void
}

export function ShowcaseEntryCard({ item, onOpenMedia }: ShowcaseEntryCardProps) {
  const hasVisualMedia = item.media_kind !== 'none' && Boolean(item.media_url)
  const previewSrc = item.thumbnail_url || item.media_url

  return (
    <article className="rounded-md border border-chrome-200 bg-surface-card overflow-hidden shadow-card hover:shadow-card-hover hover:border-gold-500/70 transition flex flex-col justify-between">
      <div>
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
                  {formatShowcaseDuration(item.duration_seconds)}
                </span>
              )}
            </div>
          </button>
        )}

        <div className="p-4 space-y-2.5">
          <h3 className="font-display text-base font-bold leading-snug text-ink-primary">
            {item.title}
          </h3>
          <p className="text-xs leading-relaxed text-ink-secondary">{item.quote_or_caption}</p>
        </div>
      </div>

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

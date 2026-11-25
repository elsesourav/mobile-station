'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_HUB_LABELS,
  type ShowcaseEntryDTO,
} from '@mobile-station/types'

interface ShowcaseMediaModalProps {
  items: ShowcaseEntryDTO[]
  activeItem: ShowcaseEntryDTO | null
  onClose: () => void
  onSelect: (entry: ShowcaseEntryDTO) => void
}

export function ShowcaseMediaModal({
  items,
  activeItem,
  onClose,
  onSelect,
}: ShowcaseMediaModalProps) {
  useEffect(() => {
    if (!activeItem) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (!items.length) return
      const currentIdx = items.findIndex((entry) => entry.id === activeItem.id)
      if (currentIdx === -1) return
      if (event.key === 'ArrowRight') {
        onSelect(items[(currentIdx + 1) % items.length])
      } else if (event.key === 'ArrowLeft') {
        onSelect(items[(currentIdx - 1 + items.length) % items.length])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeItem, items, onClose, onSelect])

  if (!activeItem) return null
  const activeIdx = items.findIndex((entry) => entry.id === activeItem.id)

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
              {items.length > 1 && activeIdx !== -1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous media"
                    onClick={() => onSelect(items[(activeIdx - 1 + items.length) % items.length])}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-obsidian-700 text-chrome-200 hover:border-gold-500 hover:text-gold-500"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next media"
                    onClick={() => onSelect(items[(activeIdx + 1) % items.length])}
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

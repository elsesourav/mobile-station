'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { MapPin, Receipt, ShieldCheck, Sparkles } from 'lucide-react'
import type { StorefrontAnnouncement } from '@mobile-station/types'
import { ALL_ANNOUNCEMENTS } from '@/lib/catalog'
import { useOptionalHeaderScroll } from '@/context/HeaderScrollContext'
import type { AnnouncementBarProps } from '@/types/storefront'

function AnnouncementIcon({ id }: { id: string }) {
  if (id.includes('gst')) return <Receipt className="w-3 h-3 shrink-0" />
  if (id.includes('obd')) return <ShieldCheck className="w-3 h-3 shrink-0" />
  if (id.includes('muzaffarpur')) return <MapPin className="w-3 h-3 shrink-0" />
  return <Sparkles className="w-3 h-3 shrink-0" />
}

function SingleAnnouncement({ item }: { item: StorefrontAnnouncement }) {
  return (
    <Link
      href={item.route}
      className="inline-flex items-center gap-2 mx-5 shrink-0 group/ann focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 rounded-xs"
    >
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500 text-obsidian-950 font-mono text-[9.5px] font-extrabold uppercase tracking-[0.6px] whitespace-nowrap">
        <AnnouncementIcon id={item.id} />
        <span>{item.badge}</span>
      </span>

      <span className="text-[11.5px] font-semibold tracking-[0.2px] text-chrome-200 group-hover/ann:text-gold-500 transition-colors whitespace-nowrap">
        {item.text}
      </span>

      <span className="text-chrome-400/50 text-xs pl-2 select-none font-bold" aria-hidden="true">
        •
      </span>
    </Link>
  )
}

/**
 * Continuous GPU-accelerated top announcement bar mirroring Glorov's collapsible marquee.
 */
export function AnnouncementBar({
  items = ALL_ANNOUNCEMENTS,
  speedSeconds = 32,
  pauseOnHover = true,
  className = '',
}: AnnouncementBarProps) {
  const headerScroll = useOptionalHeaderScroll()
  const showAnnouncement = headerScroll ? headerScroll.showAnnouncement : true

  const displayItems = useMemo(() => {
    if (!items || items.length === 0) return []
    let list = [...items]
    while (list.length < 6) {
      list = [...list, ...items]
    }
    return list
  }, [items])

  if (displayItems.length === 0) return null

  return (
    <aside
      aria-label="Store Announcements"
      className={`group w-full bg-obsidian-950 text-ink-inverse overflow-hidden relative z-40 transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${
        showAnnouncement
          ? 'max-h-[34px] opacity-100 translate-y-0 border-b border-obsidian-800'
          : 'max-h-0 opacity-0 -translate-y-full border-b-0 pointer-events-none'
      } ${className}`}
    >
      <div className="h-[34px] flex items-center w-full relative">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-obsidian-950 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-obsidian-950 to-transparent"
        />

        <div
          className={`flex items-center whitespace-nowrap w-max ms-marquee-track animate-marquee ${
            pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
          }`}
          style={{
            animationDuration: `${speedSeconds}s`,
            animationTimingFunction: 'linear',
          }}
        >
          <div className="flex items-center shrink-0">
            {displayItems.map((item, idx) => (
              <SingleAnnouncement key={`track1-${item.id}-${idx}`} item={item} />
            ))}
          </div>
          <div className="flex items-center shrink-0" aria-hidden="true">
            {displayItems.map((item, idx) => (
              <SingleAnnouncement key={`track2-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

import type { Metadata } from 'next'
import { fetchShowcaseFeed } from '@/lib/showcase'
import { GalleryPageClient } from '@/components/GalleryPageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Muzaffarpur Store Visit & Open-Box Desk Gallery',
  description:
    'Photos and video reels from customer pickups, IMEI inspection desks, and audio/keyboard trial zones at Mobile Station Motijheel (842001) & Club Road (842002).',
}

export default async function GalleryPage() {
  const { items, stats } = await fetchShowcaseFeed({ entry_type: 'store_visit', limit: 60 })
  return <GalleryPageClient initialItems={items} stats={stats} />
}

import type { Metadata } from 'next'
import { fetchShowcaseFeed } from '@/lib/showcase'
import { FeedbackPageClient } from '@/components/FeedbackPageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Customer Video Feedback & Verified Unboxings',
  description:
    'Watch customer video unboxings, open-box IMEI verifications, and verified reviews from Mobile Station Motijheel (842001), Club Road (842002), and Pan-India buyers.',
}

export default async function FeedbackPage() {
  const { items, stats } = await fetchShowcaseFeed({ entry_type: 'customer_feedback', limit: 60 })
  return <FeedbackPageClient initialItems={items} stats={stats} />
}

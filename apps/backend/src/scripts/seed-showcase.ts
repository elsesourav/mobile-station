import type { ExecArgs } from '@medusajs/framework/types'
import { SHOWCASE_MODULE } from '../modules/showcase'
import type { ShowcaseModuleService } from '../modules/showcase/service'
import { invalidateShowcaseCache } from '../modules/showcase/cache'
import fs from 'node:fs'
import path from 'node:path'

interface SeedShowcaseEntry {
  entry_type: 'customer_feedback' | 'store_visit'
  category:
    | 'video_unboxing'
    | 'video_review'
    | 'in_store_pickup'
    | 'open_box_check'
    | 'audio_keyboard_demo'
    | 'launch_event'
    | 'customer_selfie'
    | 'written_review'
  media_kind: 'video' | 'image' | 'none'
  status: 'draft' | 'published' | 'archived'
  title: string
  quote_or_caption: string
  author_name: string
  author_city: string
  hub_location: 'motijheel-842001' | 'club-road-842002' | 'online-pan-india'
  rating: number | null
  product_handle: string | null
  product_title: string | null
  media_url: string | null
  media_public_id: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
  media_width: number | null
  media_height: number | null
  mime_type: string | null
  is_featured: boolean
  is_verified_buyer: boolean
  display_order: number
  visited_at: string | null
}

export default async function seedShowcase({ container }: ExecArgs) {
  const logger = container.resolve('logger')
  const showcaseService = container.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)

  const seedPath = path.resolve(process.cwd(), '../../data/showcase/showcase-seed.json')
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Showcase seed file missing at ${seedPath}`)
  }

  const parsed = JSON.parse(fs.readFileSync(seedPath, 'utf8')) as {
    entries: SeedShowcaseEntry[]
  }

  const existing = await showcaseService.listShowcaseEntries({}, { take: 200 })
  const existingTitles = new Set(existing.map((e) => e.title.trim().toLowerCase()))

  let createdCount = 0
  for (const item of parsed.entries) {
    if (existingTitles.has(item.title.trim().toLowerCase())) {
      continue
    }
    await showcaseService.createShowcaseEntries({
      ...item,
      visited_at: item.visited_at ? new Date(item.visited_at) : null,
    })
    createdCount++
  }

  await invalidateShowcaseCache()
  logger.info(
    `[Mobile Station Showcase Seed] Seeded ${createdCount} new entries (${existing.length} already present).`
  )
}

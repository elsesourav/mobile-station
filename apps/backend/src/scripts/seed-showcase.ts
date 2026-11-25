import type { ExecArgs } from '@medusajs/framework/types'
import fs from 'node:fs'
import path from 'node:path'
import { SHOWCASE_MODULE } from '../modules/showcase'
import type { ShowcaseModuleService } from '../modules/showcase/service'
import { invalidateShowcaseCache } from '../modules/showcase/cache'
import type { SeedShowcaseDataset } from '../types/showcase-backend'

export default async function seedShowcase({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve('logger')
  const showcaseService = container.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)

  const seedPath = path.resolve(process.cwd(), '../../data/showcase/showcase-seed.json')
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Showcase seed file missing at ${seedPath}`)
  }

  const parsed: SeedShowcaseDataset = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
  const existing = await showcaseService.listShowcaseEntries({}, { take: 200 })
  const existingTitles = new Set(existing.map((entry) => entry.title.trim().toLowerCase()))

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

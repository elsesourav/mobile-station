import { Text } from '@medusajs/ui'
import type { ShowcaseSummaryStats } from '@mobile-station/types'

interface ShowcaseKpiStripProps {
  stats: ShowcaseSummaryStats | null
}

export function ShowcaseKpiStrip({ stats }: ShowcaseKpiStripProps) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-6 py-4 bg-ui-bg-subtle">
      <div className="rounded-lg border bg-ui-bg-base p-3">
        <Text size="xsmall" className="text-ui-fg-subtle">
          Published Live
        </Text>
        <Text size="large" weight="plus">
          {stats.published} / {stats.total}
        </Text>
      </div>
      <div className="rounded-lg border bg-ui-bg-base p-3">
        <Text size="xsmall" className="text-ui-fg-subtle">
          Video Feedback Reels
        </Text>
        <Text size="large" weight="plus">
          {stats.video_feedback_total}
        </Text>
      </div>
      <div className="rounded-lg border bg-ui-bg-base p-3">
        <Text size="xsmall" className="text-ui-fg-subtle">
          Store Visit Gallery
        </Text>
        <Text size="large" weight="plus">
          {stats.store_visit_total}
        </Text>
      </div>
      <div className="rounded-lg border bg-ui-bg-base p-3">
        <Text size="xsmall" className="text-ui-fg-subtle">
          Pending Moderation
        </Text>
        <Text size="large" weight="plus">
          {stats.drafts}
        </Text>
      </div>
      <div className="rounded-lg border bg-ui-bg-base p-3">
        <Text size="xsmall" className="text-ui-fg-subtle">
          Avg Customer Rating
        </Text>
        <Text size="large" weight="plus">
          {stats.avg_rating !== null ? `${stats.avg_rating} / 5 ★` : '—'}
        </Text>
      </div>
    </div>
  )
}

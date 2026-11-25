import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Badge, Button, Container, Heading, Text } from '@medusajs/ui'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ShowcaseEntryDTO, ShowcaseListResponse } from '@mobile-station/types'
import { SHOWCASE_CATEGORY_LABELS } from '@mobile-station/types'

interface ProductWidgetDetail {
  id: string
  handle?: string
  title?: string
}

interface ProductWidgetProps {
  data: ProductWidgetDetail
}

const ProductShowcaseWidget = ({ data }: ProductWidgetProps) => {
  const [entries, setEntries] = useState<ShowcaseEntryDTO[]>([])

  useEffect(() => {
    if (!data?.handle) return
    const token =
      typeof window !== 'undefined' ? window.localStorage.getItem('medusa_auth_token') : null
    const headers = new Headers()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    fetch(`/admin/showcase?product_handle=${encodeURIComponent(data.handle)}&limit=10`, {
      credentials: 'include',
      headers,
    })
      .then((response) =>
        response.ok
          ? (response.json() as Promise<ShowcaseListResponse>)
          : Promise.resolve({ items: [] as ShowcaseEntryDTO[] })
      )
      .then((payload) => setEntries(payload.items || []))
      .catch(() => setEntries([]))
  }, [data?.handle])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Customer Video Feedback & Hub Moments</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Linked buyer unboxings and reviews for {data?.title || data?.handle}
          </Text>
        </div>
        <Button size="small" variant="secondary" asChild>
          <Link to="/showcase">Manage Feedback & Gallery</Link>
        </Button>
      </div>
      <div className="px-6 py-4">
        {entries.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No customer feedback or video unboxing linked to SKU handle “{data?.handle}” yet.
          </Text>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <Text size="small" weight="plus" className="truncate">
                    {entry.title}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {entry.author_name} ({entry.author_city}) ·{' '}
                    {SHOWCASE_CATEGORY_LABELS[entry.category]}
                    {entry.rating ? ` · ${entry.rating}★` : ''}
                  </Text>
                </div>
                <Badge size="2xsmall" color={entry.media_kind === 'video' ? 'purple' : 'green'}>
                  {entry.media_kind === 'video' ? 'Video Reel' : entry.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: 'product.details.after',
})

export default ProductShowcaseWidget

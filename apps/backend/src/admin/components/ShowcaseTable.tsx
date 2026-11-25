import { Badge, Button, StatusBadge, Switch, Table, Text } from '@medusajs/ui'
import type { ShowcaseEntryDTO, ShowcaseStatus } from '@mobile-station/types'
import { SHOWCASE_CATEGORY_LABELS, SHOWCASE_TYPE_LABELS } from '@mobile-station/types'
import { formatAdminHubLabel, formatAdminStatusLabel } from '../lib/showcase-admin-api'

interface ShowcaseTableProps {
  items: ShowcaseEntryDTO[]
  loading: boolean
  onPreview: (entry: ShowcaseEntryDTO) => void
  onEdit: (entry: ShowcaseEntryDTO) => void
  onToggleStatus: (entry: ShowcaseEntryDTO, nextStatus: ShowcaseStatus) => void
  onToggleFeatured: (entry: ShowcaseEntryDTO) => void
  onDelete: (entry: ShowcaseEntryDTO) => void
}

export function ShowcaseTable({
  items,
  loading,
  onPreview,
  onEdit,
  onToggleStatus,
  onToggleFeatured,
  onDelete,
}: ShowcaseTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Media</Table.HeaderCell>
            <Table.HeaderCell>Title & Customer</Table.HeaderCell>
            <Table.HeaderCell>Type & Tag</Table.HeaderCell>
            <Table.HeaderCell>Hub</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Featured</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <tr className="border-b border-ui-border-base">
              <td colSpan={7} className="px-6 py-6 text-center">
                <Text size="small" className="text-ui-fg-subtle block">
                  Loading feedback & store visit showcase...
                </Text>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr className="border-b border-ui-border-base">
              <td colSpan={7} className="px-6 py-8 text-center">
                <Text size="small" className="text-ui-fg-subtle block">
                  No entries match the active filters. Click “+ Upload Video Feedback” above to
                  publish your first video reel or store visit photo.
                </Text>
              </td>
            </tr>
          ) : (
            items.map((entry) => (
              <Table.Row key={entry.id}>
                <Table.Cell>
                  <button
                    type="button"
                    onClick={() => onPreview(entry)}
                    className="relative h-11 w-16 shrink-0 overflow-hidden rounded border bg-ui-bg-subtle flex items-center justify-center hover:opacity-80"
                  >
                    {entry.thumbnail_url ? (
                      <img
                        src={entry.thumbnail_url}
                        alt={entry.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Text size="xsmall" className="text-ui-fg-muted">
                        Text
                      </Text>
                    )}
                    {entry.media_kind === 'video' && (
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[9px] font-mono text-white">
                        VIDEO
                      </span>
                    )}
                  </button>
                </Table.Cell>

                <Table.Cell>
                  <div className="max-w-[230px] space-y-0.5 py-1">
                    <Text size="small" weight="plus" className="truncate block">
                      {entry.title}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle truncate block">
                      {entry.author_name} · {entry.author_city}
                      {entry.rating ? ` · ${entry.rating}★` : ''}
                    </Text>
                    {entry.product_handle && (
                      <Text size="xsmall" className="text-ui-fg-interactive truncate block">
                        SKU: {entry.product_handle}
                      </Text>
                    )}
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <div className="flex flex-col gap-1.5 items-start py-1 whitespace-nowrap">
                    <Badge
                      size="2xsmall"
                      color={entry.entry_type === 'customer_feedback' ? 'purple' : 'blue'}
                      className="whitespace-nowrap"
                    >
                      {SHOWCASE_TYPE_LABELS[entry.entry_type]}
                    </Badge>
                    <Text size="xsmall" className="text-ui-fg-subtle whitespace-nowrap">
                      {SHOWCASE_CATEGORY_LABELS[entry.category]}
                    </Text>
                  </div>
                </Table.Cell>

                <Table.Cell className="whitespace-nowrap">
                  <Text size="xsmall" className="whitespace-nowrap">
                    {formatAdminHubLabel(entry.hub_location)}
                  </Text>
                </Table.Cell>

                <Table.Cell className="whitespace-nowrap">
                  <StatusBadge
                    color={
                      entry.status === 'published'
                        ? 'green'
                        : entry.status === 'draft'
                          ? 'orange'
                          : 'grey'
                    }
                    className="whitespace-nowrap"
                  >
                    {formatAdminStatusLabel(entry.status)}
                  </StatusBadge>
                </Table.Cell>

                <Table.Cell>
                  <Switch
                    checked={entry.is_featured}
                    onCheckedChange={() => onToggleFeatured(entry)}
                  />
                </Table.Cell>

                <Table.Cell className="text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <Button size="small" variant="transparent" onClick={() => onEdit(entry)}>
                      Edit
                    </Button>
                    {entry.status !== 'published' ? (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => onToggleStatus(entry, 'published')}
                      >
                        Publish
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => onToggleStatus(entry, 'draft')}
                      >
                        Draft
                      </Button>
                    )}
                    <Button size="small" variant="danger" onClick={() => onDelete(entry)}>
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  )
}

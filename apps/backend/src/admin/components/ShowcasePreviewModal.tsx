import { Button, FocusModal, Heading, Text } from '@medusajs/ui'
import { SHOWCASE_HUB_LABELS, type ShowcaseEntryDTO } from '@mobile-station/types'

interface ShowcasePreviewModalProps {
  entry: ShowcaseEntryDTO | null
  onClose: () => void
}

export function ShowcasePreviewModal({ entry, onClose }: ShowcasePreviewModalProps) {
  return (
    <FocusModal open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
      <FocusModal.Content>
        <FocusModal.Title className="sr-only">
          {entry ? entry.title : 'Media Preview'}
        </FocusModal.Title>
        <FocusModal.Description className="sr-only">
          Full resolution preview of customer feedback video or store visit gallery media.
        </FocusModal.Description>

        <FocusModal.Header>
          <Button variant="secondary" onClick={onClose}>
            Close Preview
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="p-6 overflow-y-auto">
          {entry && (
            <div className="mx-auto max-w-2xl space-y-4">
              <Heading level="h2">{entry.title}</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                {entry.author_name} ({entry.author_city}) · {SHOWCASE_HUB_LABELS[entry.hub_location]}
              </Text>
              {entry.media_url && entry.media_kind === 'video' && (
                <video
                  src={entry.media_url}
                  poster={entry.thumbnail_url || undefined}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[60vh] rounded-lg bg-black"
                />
              )}
              {entry.media_url && entry.media_kind === 'image' && (
                <img
                  src={entry.media_url}
                  alt={entry.title}
                  className="w-full max-h-[60vh] rounded-lg object-contain bg-ui-bg-subtle"
                />
              )}
              <Text size="base">{entry.quote_or_caption}</Text>
            </div>
          )}
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

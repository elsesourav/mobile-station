import {
  Button,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
} from '@medusajs/ui'
import type {
  ShowcaseCategory,
  ShowcaseEntryType,
  ShowcaseHubLocation,
  ShowcaseMediaKind,
  ShowcaseStatus,
} from '@mobile-station/types'
import {
  SHOWCASE_CATEGORIES,
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_HUB_LABELS,
  SHOWCASE_HUB_LOCATIONS,
  SHOWCASE_STATUSES,
  SHOWCASE_STATUS_LABELS,
} from '@mobile-station/types'
import type { ShowcaseFormState } from '../types/showcase-admin'

interface ShowcaseFormModalProps {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  isEditing: boolean
  formState: ShowcaseFormState
  onChangeForm: (updater: (previous: ShowcaseFormState) => ShowcaseFormState) => void
  onSelectMediaFile: (file: File | null) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  uploading: boolean
  uploadProgress: number
  uploadNotice: string | null
  saving: boolean
}

export function ShowcaseFormModal({
  open,
  onOpenChange,
  isEditing,
  formState,
  onChangeForm,
  onSelectMediaFile,
  onSubmit,
  uploading,
  uploadProgress,
  uploadNotice,
  saving,
}: ShowcaseFormModalProps) {
  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <FocusModal.Title className="sr-only">
          {isEditing
            ? 'Edit Showcase Entry'
            : 'Upload Customer Video Feedback or Store Visit Media'}
        </FocusModal.Title>
        <FocusModal.Description className="sr-only">
          Upload verified video testimonials or store visit media directly to Cloudinary CDN.
        </FocusModal.Description>

        <form onSubmit={onSubmit} className="flex h-full flex-col overflow-hidden">
          <FocusModal.Header>
            <Button variant="secondary" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving} disabled={uploading}>
              {isEditing ? 'Save Changes' : 'Save & Publish Showcase Entry'}
            </Button>
          </FocusModal.Header>

          <FocusModal.Body className="overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <div>
                <Heading level="h2">
                  {isEditing
                    ? 'Edit Showcase Entry'
                    : 'Upload Customer Video Feedback / Store Visit Media'}
                </Heading>
                <Text size="small" className="text-ui-fg-subtle mt-1">
                  Videos and store-visit photos upload directly to your isolated Mobile Station
                  Cloudinary CDN (mobile-station/feedback-videos or store-visits).
                </Text>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Section Type</Label>
                  <Select
                    value={formState.entry_type}
                    onValueChange={(value) => {
                      const nextType = value as ShowcaseEntryType
                      onChangeForm((prev) => ({
                        ...prev,
                        entry_type: nextType,
                        category: nextType === 'store_visit' ? 'in_store_pickup' : 'video_unboxing',
                      }))
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="customer_feedback">Customer Feedback</Select.Item>
                      <Select.Item value="store_visit">Store Visit Gallery</Select.Item>
                    </Select.Content>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Defined Showcase Tag / Sub-Type</Label>
                  <Select
                    value={formState.category}
                    onValueChange={(value) =>
                      onChangeForm((prev) => ({ ...prev, category: value as ShowcaseCategory }))
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {SHOWCASE_CATEGORIES.map((category) => (
                        <Select.Item key={category} value={category}>
                          {SHOWCASE_CATEGORY_LABELS[category]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Store Hub / Dispatch Origin</Label>
                  <Select
                    value={formState.hub_location}
                    onValueChange={(value) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        hub_location: value as ShowcaseHubLocation,
                      }))
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {SHOWCASE_HUB_LOCATIONS.map((hub) => (
                        <Select.Item key={hub} value={hub}>
                          {SHOWCASE_HUB_LABELS[hub]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Publish Visibility</Label>
                  <Select
                    value={formState.status}
                    onValueChange={(value) =>
                      onChangeForm((prev) => ({ ...prev, status: value as ShowcaseStatus }))
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {SHOWCASE_STATUSES.map((statusOption) => (
                        <Select.Item key={statusOption} value={statusOption}>
                          {SHOWCASE_STATUS_LABELS[statusOption]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-dashed p-4 space-y-3 bg-ui-bg-subtle">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Label>Upload Video Testimonial or Store Visit Photo</Label>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      Supports MP4 / WebM / MOV videos (up to 100 MB) and WebP / JPG / PNG photos
                      (up to 15 MB).
                    </Text>
                  </div>
                  <Select
                    value={formState.media_kind}
                    onValueChange={(value) =>
                      onChangeForm((prev) => ({ ...prev, media_kind: value as ShowcaseMediaKind }))
                    }
                    size="small"
                  >
                    <Select.Trigger className="w-40">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="video">Video Reel</Select.Item>
                      <Select.Item value="image">Photo</Select.Item>
                      <Select.Item value="none">Text Only (No Media)</Select.Item>
                    </Select.Content>
                  </Select>
                </div>

                {formState.media_kind !== 'none' && (
                  <>
                    <input
                      type="file"
                      accept={
                        formState.media_kind === 'video'
                          ? 'video/mp4,video/webm,video/quicktime,video/x-m4v'
                          : 'image/webp,image/jpeg,image/png,image/avif'
                      }
                      onChange={(e) => onSelectMediaFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-xs text-ui-fg-subtle file:mr-3 file:rounded-md file:border file:border-ui-border-base file:bg-ui-bg-base file:px-3 file:py-1.5 file:text-xs file:font-medium hover:file:bg-ui-bg-base-hover"
                    />

                    {uploading && (
                      <div className="space-y-1">
                        <div className="h-2 w-full rounded bg-ui-bg-component overflow-hidden">
                          <div
                            className="h-full bg-ui-fg-interactive transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          Uploading directly to Cloudinary CDN... {uploadProgress}%
                        </Text>
                      </div>
                    )}

                    {uploadNotice && (
                      <Text size="xsmall" weight="plus" className="text-ui-tag-green-text">
                        {uploadNotice}
                      </Text>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="media-url-input">Cloudinary Media URL</Label>
                        <Input
                          id="media-url-input"
                          placeholder="https://res.cloudinary.com/..."
                          value={formState.media_url}
                          onChange={(e) =>
                            onChangeForm((prev) => ({ ...prev, media_url: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="thumb-url-input">Auto Video Poster / Thumbnail URL</Label>
                        <Input
                          id="thumb-url-input"
                          placeholder="https://res.cloudinary.com/..."
                          value={formState.thumbnail_url}
                          onChange={(e) =>
                            onChangeForm((prev) => ({ ...prev, thumbnail_url: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    {formState.media_url && (
                      <div className="rounded border bg-black/90 p-2 max-h-64 overflow-hidden flex justify-center">
                        {formState.media_kind === 'video' ? (
                          <video
                            src={formState.media_url}
                            poster={formState.thumbnail_url || undefined}
                            controls
                            playsInline
                            className="max-h-56 rounded"
                          />
                        ) : (
                          <img
                            src={formState.media_url}
                            alt="Uploaded preview"
                            className="max-h-56 rounded object-contain"
                          />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="showcase-title">Headline / Title</Label>
                  <Input
                    id="showcase-title"
                    required
                    placeholder="e.g. Live Open-Box IMEI Check on iPhone 16 Pro at Motijheel Hub"
                    value={formState.title}
                    onChange={(e) => onChangeForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="showcase-quote">Customer Feedback Quote / Visit Story</Label>
                  <Textarea
                    id="showcase-quote"
                    required
                    rows={3}
                    placeholder="What did the customer experience or what happened during this Muzaffarpur hub visit?"
                    value={formState.quote_or_caption}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, quote_or_caption: e.target.value }))
                    }
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="author-name">Customer / Visitor Name</Label>
                    <Input
                      id="author-name"
                      required
                      placeholder="e.g. Ankit Kumar"
                      value={formState.author_name}
                      onChange={(e) =>
                        onChangeForm((prev) => ({ ...prev, author_name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="author-city">City / State</Label>
                    <Input
                      id="author-city"
                      required
                      placeholder="Muzaffarpur, Bihar"
                      value={formState.author_city}
                      onChange={(e) =>
                        onChangeForm((prev) => ({ ...prev, author_city: e.target.value }))
                      }
                    />
                  </div>
                  {formState.entry_type === 'customer_feedback' ? (
                    <div className="space-y-1.5">
                      <Label>Star Rating (1–5)</Label>
                      <Select
                        value={formState.rating}
                        onValueChange={(value) =>
                          onChangeForm((prev) => ({ ...prev, rating: value }))
                        }
                      >
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="5">5 Stars — Exceptional</Select.Item>
                          <Select.Item value="4">4 Stars — Great</Select.Item>
                          <Select.Item value="3">3 Stars — Good</Select.Item>
                          <Select.Item value="2">2 Stars — Fair</Select.Item>
                          <Select.Item value="1">1 Star — Needs Attention</Select.Item>
                        </Select.Content>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label htmlFor="visited-at">Visit Date</Label>
                      <Input
                        id="visited-at"
                        type="date"
                        value={formState.visited_at}
                        onChange={(e) =>
                          onChangeForm((prev) => ({ ...prev, visited_at: e.target.value }))
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="product-handle">Linked Product Handle (Optional)</Label>
                    <Input
                      id="product-handle"
                      placeholder="apple-iphone-16-pro-5g"
                      value={formState.product_handle}
                      onChange={(e) =>
                        onChangeForm((prev) => ({ ...prev, product_handle: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="product-title">Linked Product Name (Optional)</Label>
                    <Input
                      id="product-title"
                      placeholder="Apple iPhone 16 Pro 5G"
                      value={formState.product_title}
                      onChange={(e) =>
                        onChangeForm((prev) => ({ ...prev, product_title: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="display-order">Display Priority (Lower = First)</Label>
                    <Input
                      id="display-order"
                      type="number"
                      min={0}
                      value={formState.display_order}
                      onChange={(e) =>
                        onChangeForm((prev) => ({ ...prev, display_order: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="featured-switch"
                      checked={formState.is_featured}
                      onCheckedChange={(checked) =>
                        onChangeForm((prev) => ({ ...prev, is_featured: checked }))
                      }
                    />
                    <Label htmlFor="featured-switch">Pin in Featured Spotlight</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="verified-switch"
                      checked={formState.is_verified_buyer}
                      onCheckedChange={(checked) =>
                        onChangeForm((prev) => ({ ...prev, is_verified_buyer: checked }))
                      }
                    />
                    <Label htmlFor="verified-switch">Verified Mobile Station Buyer / Visit</Label>
                  </div>
                </div>
              </div>
            </div>
          </FocusModal.Body>
        </form>
      </FocusModal.Content>
    </FocusModal>
  )
}

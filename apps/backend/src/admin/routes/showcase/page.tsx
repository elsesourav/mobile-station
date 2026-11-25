import { defineRouteConfig } from '@medusajs/admin-sdk'
import { Button, Container, Heading, Input, Select, Tabs, Text, toast } from '@medusajs/ui'
import { useCallback, useEffect, useState } from 'react'
import type {
  ShowcaseDeleteResponse,
  ShowcaseEntryDTO,
  ShowcaseEntryType,
  ShowcaseListResponse,
  ShowcaseMutationResponse,
  ShowcaseSignedUploadPayload,
  ShowcaseStatus,
  ShowcaseSummaryStats,
} from '@mobile-station/types'
import { SHOWCASE_HUB_LABELS, SHOWCASE_HUB_LOCATIONS } from '@mobile-station/types'
import { ShowcaseFormModal } from '../../components/ShowcaseFormModal'
import { ShowcaseSidebarIcon } from '../../components/ShowcaseIcons'
import { ShowcaseKpiStrip } from '../../components/ShowcaseKpiStrip'
import { ShowcasePreviewModal } from '../../components/ShowcasePreviewModal'
import { ShowcaseTable } from '../../components/ShowcaseTable'
import {
  adminApiFetch,
  buildShowcasePayloadFromForm,
  createInitialShowcaseFormState,
  entryToShowcaseFormState,
  uploadFileDirectToCloudinary,
} from '../../lib/showcase-admin-api'
import type { ShowcaseAdminFilterTab, ShowcaseFormState } from '../../types/showcase-admin'

const ShowcaseAdminPage = () => {
  const [items, setItems] = useState<ShowcaseEntryDTO[]>([])
  const [stats, setStats] = useState<ShowcaseSummaryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ShowcaseAdminFilterTab>('all')
  const [hubFilter, setHubFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<ShowcaseFormState>(() =>
    createInitialShowcaseFormState()
  )
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadNotice, setUploadNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewEntry, setPreviewEntry] = useState<ShowcaseEntryDTO | null>(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (activeTab === 'customer_feedback' || activeTab === 'store_visit') {
        queryParams.set('entry_type', activeTab)
      }
      if (activeTab === 'draft') queryParams.set('status', 'draft')
      if (hubFilter !== 'all') queryParams.set('hub_location', hubFilter)
      if (searchQuery.trim()) queryParams.set('q', searchQuery.trim())
      queryParams.set('limit', '100')

      const data = await adminApiFetch<ShowcaseListResponse>(
        `/admin/showcase?${queryParams.toString()}`
      )
      setItems(data.items)
      setStats(data.stats)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load showcase entries')
    } finally {
      setLoading(false)
    }
  }, [activeTab, hubFilter, searchQuery])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const openCreateModal = (presetType?: ShowcaseEntryType) => {
    setEditingId(null)
    setFormState(createInitialShowcaseFormState(presetType))
    setUploadProgress(0)
    setUploadNotice(null)
    setModalOpen(true)
  }

  const openEditModal = (entry: ShowcaseEntryDTO) => {
    setEditingId(entry.id)
    setFormState(entryToShowcaseFormState(entry))
    setUploadProgress(0)
    setUploadNotice(null)
    setModalOpen(true)
  }

  const handleSelectMediaFile = async (file: File | null) => {
    if (!file) return
    const detectedKind: 'video' | 'image' = file.type.startsWith('video/') ? 'video' : 'image'
    setUploading(true)
    setUploadProgress(5)
    setUploadNotice(null)

    try {
      const signed = await adminApiFetch<ShowcaseSignedUploadPayload>(
        '/admin/showcase/upload-signature',
        {
          method: 'POST',
          body: JSON.stringify({
            entry_type: formState.entry_type,
            media_kind: detectedKind,
            filename: file.name,
            mime_type: file.type,
            file_size_bytes: file.size,
          }),
        }
      )

      const uploaded = await uploadFileDirectToCloudinary(file, signed, (pct) => {
        setUploadProgress(pct)
      })

      const thumbnailUrl =
        detectedKind === 'video'
          ? `https://res.cloudinary.com/${signed.cloud_name}/video/upload/so_1,f_jpg,q_auto:good,w_900,c_limit/${uploaded.public_id}.jpg`
          : uploaded.secure_url

      setFormState((previous) => ({
        ...previous,
        media_kind: detectedKind,
        media_url: uploaded.secure_url,
        media_public_id: uploaded.public_id,
        thumbnail_url: thumbnailUrl,
        duration_seconds:
          typeof uploaded.duration === 'number'
            ? Math.round(uploaded.duration * 10) / 10
            : null,
        media_width: uploaded.width ?? null,
        media_height: uploaded.height ?? null,
        mime_type: file.type || `${detectedKind}/${uploaded.format || 'mp4'}`,
      }))

      setUploadNotice(
        `${detectedKind === 'video' ? 'Video' : 'Photo'} uploaded cleanly to Cloudinary CDN (${signed.folder})`
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Media upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = buildShowcasePayloadFromForm(formState)
      if (editingId) {
        await adminApiFetch<ShowcaseMutationResponse>(`/admin/showcase/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        toast.success('Showcase entry updated')
      } else {
        await adminApiFetch<ShowcaseMutationResponse>('/admin/showcase', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        toast.success('Showcase entry created & published cleanly')
      }

      setModalOpen(false)
      await loadEntries()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (entry: ShowcaseEntryDTO, nextStatus: ShowcaseStatus) => {
    try {
      await adminApiFetch<ShowcaseMutationResponse>(`/admin/showcase/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      toast.success(`Updated status to ${nextStatus}`)
      await loadEntries()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Status update failed')
    }
  }

  const handleToggleFeatured = async (entry: ShowcaseEntryDTO) => {
    try {
      await adminApiFetch<ShowcaseMutationResponse>(`/admin/showcase/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_featured: !entry.is_featured }),
      })
      await loadEntries()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle featured state')
    }
  }

  const handleDeleteEntry = async (entry: ShowcaseEntryDTO) => {
    try {
      await adminApiFetch<ShowcaseDeleteResponse>(`/admin/showcase/${entry.id}`, {
        method: 'DELETE',
      })
      toast.success('Deleted entry and removed media from Cloudinary')
      await loadEntries()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="divide-y p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Heading level="h1">Customer Video Feedback & Store Visit Gallery</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Upload verified video unboxing reviews, customer testimonials, and Motijheel (842001) /
              Club Road (842002) visit photos & reels directly to Cloudinary CDN.
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => openCreateModal('store_visit')}>
              + Upload Store Visit Media
            </Button>
            <Button onClick={() => openCreateModal('customer_feedback')}>
              + Upload Video Feedback
            </Button>
          </div>
        </div>

        <ShowcaseKpiStrip stats={stats} />
      </Container>

      <Container className="p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ShowcaseAdminFilterTab)}
          >
            <Tabs.List>
              <Tabs.Trigger value="all">All Entries</Tabs.Trigger>
              <Tabs.Trigger value="customer_feedback">Customer Feedback</Tabs.Trigger>
              <Tabs.Trigger value="store_visit">Store Visit Gallery</Tabs.Trigger>
              <Tabs.Trigger value="draft">Pending Drafts</Tabs.Trigger>
            </Tabs.List>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-56">
              <Input
                size="small"
                placeholder="Search customer, title, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-56">
              <Select value={hubFilter} onValueChange={setHubFilter} size="small">
                <Select.Trigger>
                  <Select.Value placeholder="Filter by Hub" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All Hubs & Regions</Select.Item>
                  {SHOWCASE_HUB_LOCATIONS.map((hub) => (
                    <Select.Item key={hub} value={hub}>
                      {SHOWCASE_HUB_LABELS[hub]}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>
        </div>

        <ShowcaseTable
          items={items}
          loading={loading}
          onPreview={setPreviewEntry}
          onEdit={openEditModal}
          onToggleStatus={handleToggleStatus}
          onToggleFeatured={handleToggleFeatured}
          onDelete={handleDeleteEntry}
        />
      </Container>

      <ShowcaseFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isEditing={Boolean(editingId)}
        formState={formState}
        onChangeForm={setFormState}
        onSelectMediaFile={handleSelectMediaFile}
        onSubmit={handleSubmit}
        uploading={uploading}
        uploadProgress={uploadProgress}
        uploadNotice={uploadNotice}
        saving={saving}
      />

      <ShowcasePreviewModal entry={previewEntry} onClose={() => setPreviewEntry(null)} />
    </div>
  )
}

export const config = defineRouteConfig({
  label: 'Feedback & Gallery',
  icon: ShowcaseSidebarIcon,
  rank: 40,
})

export default ShowcaseAdminPage

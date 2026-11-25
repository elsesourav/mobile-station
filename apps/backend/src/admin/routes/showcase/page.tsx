import { defineRouteConfig } from '@medusajs/admin-sdk'
import {
  Badge,
  Button,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  StatusBadge,
  Switch,
  Table,
  Tabs,
  Text,
  Textarea,
  toast,
} from '@medusajs/ui'
import { useCallback, useEffect, useState } from 'react'
import type {
  ShowcaseCategory,
  ShowcaseEntryDTO,
  ShowcaseEntryType,
  ShowcaseHubLocation,
  ShowcaseMediaKind,
  ShowcaseStatus,
  ShowcaseSummaryStats,
} from '@mobile-station/types'
import {
  SHOWCASE_CATEGORIES,
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_HUB_LABELS,
  SHOWCASE_HUB_LOCATIONS,
  SHOWCASE_STATUSES,
  SHOWCASE_STATUS_LABELS,
  SHOWCASE_TYPE_LABELS,
} from '@mobile-station/types'

function ShowcaseSidebarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
  )
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('medusa_auth_token') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(path, {
    credentials: 'include',
    ...init,
    headers,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return data as T
}

interface FormState {
  entry_type: ShowcaseEntryType
  category: ShowcaseCategory
  media_kind: ShowcaseMediaKind
  status: ShowcaseStatus
  title: string
  quote_or_caption: string
  author_name: string
  author_city: string
  hub_location: ShowcaseHubLocation
  rating: string
  product_handle: string
  product_title: string
  media_url: string
  media_public_id: string
  thumbnail_url: string
  duration_seconds: number | null
  media_width: number | null
  media_height: number | null
  mime_type: string | null
  is_featured: boolean
  is_verified_buyer: boolean
  display_order: string
  visited_at: string
}

const DEFAULT_FORM: FormState = {
  entry_type: 'customer_feedback',
  category: 'video_unboxing',
  media_kind: 'video',
  status: 'published',
  title: '',
  quote_or_caption: '',
  author_name: '',
  author_city: 'Muzaffarpur, Bihar',
  hub_location: 'motijheel-842001',
  rating: '5',
  product_handle: '',
  product_title: '',
  media_url: '',
  media_public_id: '',
  thumbnail_url: '',
  duration_seconds: null,
  media_width: null,
  media_height: null,
  mime_type: null,
  is_featured: false,
  is_verified_buyer: true,
  display_order: '10',
  visited_at: new Date().toISOString().slice(0, 10),
}

interface SignedUploadResponse {
  cloud_name: string
  api_key: string
  timestamp: number
  signature: string
  folder: string
  resource_type: 'video' | 'image'
  upload_url: string
  tags: string
  eager?: string
  max_file_size_bytes: number
}

function uploadDirectToCloudinary(
  file: File,
  signed: SignedUploadResponse,
  onProgress: (pct: number) => void
): Promise<{
  secure_url: string
  public_id: string
  duration?: number
  width?: number
  height?: number
  format?: string
}> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', signed.api_key)
    formData.append('timestamp', String(signed.timestamp))
    formData.append('signature', signed.signature)
    formData.append('folder', signed.folder)
    formData.append('tags', signed.tags)
    if (signed.eager) {
      formData.append('eager', signed.eager)
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', signed.upload_url)
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    }
    xhr.onload = () => {
      try {
        const parsed = JSON.parse(xhr.responseText || '{}')
        if (xhr.status >= 200 && xhr.status < 300 && parsed.secure_url) {
          resolve(parsed)
        } else {
          reject(new Error(parsed.error?.message || `Cloudinary upload failed (${xhr.status})`))
        }
      } catch {
        reject(new Error('Invalid Cloudinary upload response'))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during Cloudinary media upload'))
    xhr.send(formData)
  })
}

const ShowcaseAdminPage = () => {
  const [items, setItems] = useState<ShowcaseEntryDTO[]>([])
  const [stats, setStats] = useState<ShowcaseSummaryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'customer_feedback' | 'store_visit' | 'draft'>('all')
  const [hubFilter, setHubFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [uploadNotice, setUploadNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewItem, setPreviewItem] = useState<ShowcaseEntryDTO | null>(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (tab === 'customer_feedback' || tab === 'store_visit') qs.set('entry_type', tab)
      if (tab === 'draft') qs.set('status', 'draft')
      if (hubFilter !== 'all') qs.set('hub_location', hubFilter)
      if (searchQuery.trim()) qs.set('q', searchQuery.trim())
      qs.set('limit', '100')

      const data = await adminFetch<{
        items: ShowcaseEntryDTO[]
        stats: ShowcaseSummaryStats
      }>(`/admin/showcase?${qs.toString()}`)

      setItems(data.items)
      setStats(data.stats)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load showcase entries')
    } finally {
      setLoading(false)
    }
  }, [tab, hubFilter, searchQuery])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const openCreateModal = (presetType?: ShowcaseEntryType) => {
    setEditingId(null)
    setForm({
      ...DEFAULT_FORM,
      entry_type: presetType ?? 'customer_feedback',
      category: presetType === 'store_visit' ? 'in_store_pickup' : 'video_unboxing',
      media_kind: presetType === 'store_visit' ? 'image' : 'video',
    })
    setUploadPct(0)
    setUploadNotice(null)
    setModalOpen(true)
  }

  const openEditModal = (entry: ShowcaseEntryDTO) => {
    setEditingId(entry.id)
    setForm({
      entry_type: entry.entry_type,
      category: entry.category,
      media_kind: entry.media_kind,
      status: entry.status,
      title: entry.title,
      quote_or_caption: entry.quote_or_caption,
      author_name: entry.author_name,
      author_city: entry.author_city,
      hub_location: entry.hub_location,
      rating: entry.rating ? String(entry.rating) : '5',
      product_handle: entry.product_handle || '',
      product_title: entry.product_title || '',
      media_url: entry.media_url || '',
      media_public_id: entry.media_public_id || '',
      thumbnail_url: entry.thumbnail_url || '',
      duration_seconds: entry.duration_seconds,
      media_width: entry.media_width,
      media_height: entry.media_height,
      mime_type: entry.mime_type,
      is_featured: entry.is_featured,
      is_verified_buyer: entry.is_verified_buyer,
      display_order: String(entry.display_order ?? 100),
      visited_at: entry.visited_at ? entry.visited_at.slice(0, 10) : '',
    })
    setUploadPct(0)
    setUploadNotice(null)
    setModalOpen(true)
  }

  const handleFileChange = async (file: File | null) => {
    if (!file) return
    const detectedKind: 'video' | 'image' = file.type.startsWith('video/') ? 'video' : 'image'
    setUploading(true)
    setUploadPct(5)
    setUploadNotice(null)

    try {
      const signed = await adminFetch<SignedUploadResponse>('/admin/showcase/upload-signature', {
        method: 'POST',
        body: JSON.stringify({
          entry_type: form.entry_type,
          media_kind: detectedKind,
          filename: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
        }),
      })

      const uploaded = await uploadDirectToCloudinary(file, signed, (pct) => {
        setUploadPct(pct)
      })

      const thumbUrl =
        detectedKind === 'video'
          ? `https://res.cloudinary.com/${signed.cloud_name}/video/upload/so_1,f_jpg,q_auto:good,w_900,c_limit/${uploaded.public_id}.jpg`
          : uploaded.secure_url

      setForm((prev) => ({
        ...prev,
        media_kind: detectedKind,
        media_url: uploaded.secure_url,
        media_public_id: uploaded.public_id,
        thumbnail_url: thumbUrl,
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Media upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        entry_type: form.entry_type,
        category: form.category,
        media_kind: form.media_kind,
        status: form.status,
        title: form.title.trim(),
        quote_or_caption: form.quote_or_caption.trim(),
        author_name: form.author_name.trim(),
        author_city: form.author_city.trim() || 'Muzaffarpur, Bihar',
        hub_location: form.hub_location,
        rating:
          form.entry_type === 'customer_feedback'
            ? Math.min(5, Math.max(1, Number(form.rating) || 5))
            : null,
        product_handle: form.product_handle.trim() || null,
        product_title: form.product_title.trim() || null,
        media_url: form.media_kind === 'none' ? null : form.media_url.trim() || null,
        media_public_id:
          form.media_kind === 'none' ? null : form.media_public_id.trim() || null,
        thumbnail_url: form.media_kind === 'none' ? null : form.thumbnail_url.trim() || null,
        duration_seconds: form.duration_seconds,
        media_width: form.media_width,
        media_height: form.media_height,
        mime_type: form.mime_type,
        is_featured: form.is_featured,
        is_verified_buyer: form.is_verified_buyer,
        display_order: Math.max(0, Number(form.display_order) || 100),
        visited_at: form.visited_at ? new Date(form.visited_at).toISOString() : null,
      }

      if (editingId) {
        await adminFetch(`/admin/showcase/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        toast.success('Showcase entry updated')
      } else {
        await adminFetch('/admin/showcase', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        toast.success('Showcase entry created & published cleanly')
      }

      setModalOpen(false)
      await loadEntries()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  const quickToggleStatus = async (entry: ShowcaseEntryDTO, nextStatus: ShowcaseStatus) => {
    try {
      await adminFetch(`/admin/showcase/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      toast.success(`Updated status to ${SHOWCASE_STATUS_LABELS[nextStatus]}`)
      await loadEntries()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status update failed')
    }
  }

  const quickToggleFeatured = async (entry: ShowcaseEntryDTO) => {
    try {
      await adminFetch(`/admin/showcase/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_featured: !entry.is_featured }),
      })
      await loadEntries()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle featured state')
    }
  }

  const handleDelete = async (entry: ShowcaseEntryDTO) => {
    try {
      await adminFetch(`/admin/showcase/${entry.id}`, { method: 'DELETE' })
      toast.success('Deleted entry and removed media from Cloudinary')
      await loadEntries()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Page Header */}
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

        {/* KPI Bar */}
        {stats && (
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
        )}
      </Container>

      {/* Filters & Management Table */}
      <Container className="p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
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
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <Text size="small" className="text-ui-fg-subtle py-6 text-center block">
                      Loading feedback & store visit showcase...
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : items.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <Text size="small" className="text-ui-fg-subtle py-8 text-center block">
                      No entries match the active filters. Click “+ Upload Video Feedback” above to
                      publish your first video reel or store visit photo.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                items.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="relative h-11 w-16 shrink-0 overflow-hidden rounded border bg-ui-bg-subtle flex items-center justify-center hover:opacity-80"
                      >
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Text size="xsmall" className="text-ui-fg-muted">
                            Text
                          </Text>
                        )}
                        {item.media_kind === 'video' && (
                          <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[9px] font-mono text-white">
                            VIDEO
                          </span>
                        )}
                      </button>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="max-w-[230px] space-y-0.5 py-1">
                        <Text size="small" weight="plus" className="truncate block">
                          {item.title}
                        </Text>
                        <Text size="xsmall" className="text-ui-fg-subtle truncate block">
                          {item.author_name} · {item.author_city}
                          {item.rating ? ` · ${item.rating}★` : ''}
                        </Text>
                        {item.product_handle && (
                          <Text size="xsmall" className="text-ui-fg-interactive truncate block">
                            SKU: {item.product_handle}
                          </Text>
                        )}
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex flex-col gap-1.5 items-start py-1 whitespace-nowrap">
                        <Badge
                          size="2xsmall"
                          color={item.entry_type === 'customer_feedback' ? 'purple' : 'blue'}
                          className="whitespace-nowrap"
                        >
                          {SHOWCASE_TYPE_LABELS[item.entry_type]}
                        </Badge>
                        <Text size="xsmall" className="text-ui-fg-subtle whitespace-nowrap">
                          {SHOWCASE_CATEGORY_LABELS[item.category]}
                        </Text>
                      </div>
                    </Table.Cell>

                    <Table.Cell className="whitespace-nowrap">
                      <Text size="xsmall" className="whitespace-nowrap">
                        {item.hub_location === 'motijheel-842001'
                          ? 'Motijheel (842001)'
                          : item.hub_location === 'club-road-842002'
                            ? 'Club Road (842002)'
                            : 'Pan-India'}
                      </Text>
                    </Table.Cell>

                    <Table.Cell className="whitespace-nowrap">
                      <StatusBadge
                        color={
                          item.status === 'published'
                            ? 'green'
                            : item.status === 'draft'
                              ? 'orange'
                              : 'grey'
                        }
                        className="whitespace-nowrap"
                      >
                        {item.status === 'published'
                          ? 'Published'
                          : item.status === 'draft'
                            ? 'Draft'
                            : 'Archived'}
                      </StatusBadge>
                    </Table.Cell>

                    <Table.Cell>
                      <Switch
                        checked={item.is_featured}
                        onCheckedChange={() => quickToggleFeatured(item)}
                      />
                    </Table.Cell>

                    <Table.Cell className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Button size="small" variant="transparent" onClick={() => openEditModal(item)}>
                          Edit
                        </Button>
                        {item.status !== 'published' ? (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => quickToggleStatus(item, 'published')}
                          >
                            Publish
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="transparent"
                            onClick={() => quickToggleStatus(item, 'draft')}
                          >
                            Draft
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => handleDelete(item)}
                        >
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
      </Container>

      {/* Create / Edit Modal with Cloudinary Signed Video & Image Upload */}
      <FocusModal open={modalOpen} onOpenChange={setModalOpen}>
        <FocusModal.Content>
          <FocusModal.Title className="sr-only">
            {editingId
              ? 'Edit Showcase Entry'
              : 'Upload Customer Video Feedback or Store Visit Media'}
          </FocusModal.Title>
          <FocusModal.Description className="sr-only">
            Upload verified video testimonials or store visit media directly to Cloudinary CDN.
          </FocusModal.Description>
          <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving} disabled={uploading}>
                {editingId ? 'Save Changes' : 'Save & Publish Showcase Entry'}
              </Button>
            </FocusModal.Header>

            <FocusModal.Body className="overflow-y-auto px-6 py-6">
              <div className="mx-auto max-w-3xl space-y-6">
                <div>
                  <Heading level="h2">
                    {editingId
                      ? 'Edit Showcase Entry'
                      : 'Upload Customer Video Feedback / Store Visit Media'}
                  </Heading>
                  <Text size="small" className="text-ui-fg-subtle mt-1">
                    Videos and store-visit photos upload directly to your isolated Mobile Station
                    Cloudinary CDN (`mobile-station/feedback-videos` or `store-visits`).
                  </Text>
                </div>

                {/* Type + Defined Category + Hub + Status */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Section Type</Label>
                    <Select
                      value={form.entry_type}
                      onValueChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          entry_type: val as ShowcaseEntryType,
                          category: val === 'store_visit' ? 'in_store_pickup' : 'video_unboxing',
                        }))
                      }
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
                      value={form.category}
                      onValueChange={(val) =>
                        setForm((prev) => ({ ...prev, category: val as ShowcaseCategory }))
                      }
                    >
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {SHOWCASE_CATEGORIES.map((cat) => (
                          <Select.Item key={cat} value={cat}>
                            {SHOWCASE_CATEGORY_LABELS[cat]}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Store Hub / Dispatch Origin</Label>
                    <Select
                      value={form.hub_location}
                      onValueChange={(val) =>
                        setForm((prev) => ({ ...prev, hub_location: val as ShowcaseHubLocation }))
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
                      value={form.status}
                      onValueChange={(val) =>
                        setForm((prev) => ({ ...prev, status: val as ShowcaseStatus }))
                      }
                    >
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {SHOWCASE_STATUSES.map((s) => (
                          <Select.Item key={s} value={s}>
                            {SHOWCASE_STATUS_LABELS[s]}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                </div>

                {/* Direct Cloudinary Video / Photo Upload Zone */}
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
                      value={form.media_kind}
                      onValueChange={(val) =>
                        setForm((prev) => ({ ...prev, media_kind: val as ShowcaseMediaKind }))
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

                  {form.media_kind !== 'none' && (
                    <>
                      <input
                        type="file"
                        accept={
                          form.media_kind === 'video'
                            ? 'video/mp4,video/webm,video/quicktime,video/x-m4v'
                            : 'image/webp,image/jpeg,image/png,image/avif'
                        }
                        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        className="block w-full text-xs text-ui-fg-subtle file:mr-3 file:rounded-md file:border file:border-ui-border-base file:bg-ui-bg-base file:px-3 file:py-1.5 file:text-xs file:font-medium hover:file:bg-ui-bg-base-hover"
                      />

                      {uploading && (
                        <div className="space-y-1">
                          <div className="h-2 w-full rounded bg-ui-bg-component overflow-hidden">
                            <div
                              className="h-full bg-ui-fg-interactive transition-all"
                              style={{ width: `${uploadPct}%` }}
                            />
                          </div>
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            Uploading directly to Cloudinary CDN... {uploadPct}%
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
                            value={form.media_url}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, media_url: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="thumb-url-input">Auto Video Poster / Thumbnail URL</Label>
                          <Input
                            id="thumb-url-input"
                            placeholder="https://res.cloudinary.com/..."
                            value={form.thumbnail_url}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, thumbnail_url: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      {form.media_url && (
                        <div className="rounded border bg-black/90 p-2 max-h-64 overflow-hidden flex justify-center">
                          {form.media_kind === 'video' ? (
                            <video
                              src={form.media_url}
                              poster={form.thumbnail_url || undefined}
                              controls
                              playsInline
                              className="max-h-56 rounded"
                            />
                          ) : (
                            <img
                              src={form.media_url}
                              alt="Uploaded preview"
                              className="max-h-56 rounded object-contain"
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Title, Quote/Caption, Customer Info & Product Link */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="showcase-title">Headline / Title</Label>
                    <Input
                      id="showcase-title"
                      required
                      placeholder="e.g. Live Open-Box IMEI Check on iPhone 16 Pro at Motijheel Hub"
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="showcase-quote">Customer Feedback Quote / Visit Story</Label>
                    <Textarea
                      id="showcase-quote"
                      required
                      rows={3}
                      placeholder="What did the customer experience or what happened during this Muzaffarpur hub visit?"
                      value={form.quote_or_caption}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, quote_or_caption: e.target.value }))
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
                        value={form.author_name}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, author_name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="author-city">City / State</Label>
                      <Input
                        id="author-city"
                        required
                        placeholder="Muzaffarpur, Bihar"
                        value={form.author_city}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, author_city: e.target.value }))
                        }
                      />
                    </div>
                    {form.entry_type === 'customer_feedback' ? (
                      <div className="space-y-1.5">
                        <Label>Star Rating (1–5)</Label>
                        <Select
                          value={form.rating}
                          onValueChange={(val) => setForm((prev) => ({ ...prev, rating: val }))}
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
                          value={form.visited_at}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, visited_at: e.target.value }))
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
                        value={form.product_handle}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, product_handle: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="product-title">Linked Product Name (Optional)</Label>
                      <Input
                        id="product-title"
                        placeholder="Apple iPhone 16 Pro 5G"
                        value={form.product_title}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, product_title: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="display-order">Display Priority (Lower = First)</Label>
                      <Input
                        id="display-order"
                        type="number"
                        min={0}
                        value={form.display_order}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, display_order: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="featured-switch"
                        checked={form.is_featured}
                        onCheckedChange={(v) => setForm((prev) => ({ ...prev, is_featured: v }))}
                      />
                      <Label htmlFor="featured-switch">Pin in Featured Spotlight</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="verified-switch"
                        checked={form.is_verified_buyer}
                        onCheckedChange={(v) =>
                          setForm((prev) => ({ ...prev, is_verified_buyer: v }))
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

      {/* Media Preview Modal */}
      <FocusModal open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <FocusModal.Content>
          <FocusModal.Title className="sr-only">
            {previewItem ? previewItem.title : 'Media Preview'}
          </FocusModal.Title>
          <FocusModal.Description className="sr-only">
            Full resolution preview of customer feedback video or store visit gallery media.
          </FocusModal.Description>
          <FocusModal.Header>
            <Button variant="secondary" onClick={() => setPreviewItem(null)}>
              Close Preview
            </Button>
          </FocusModal.Header>
          <FocusModal.Body className="p-6 overflow-y-auto">
            {previewItem && (
              <div className="mx-auto max-w-2xl space-y-4">
                <Heading level="h2">{previewItem.title}</Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  {previewItem.author_name} ({previewItem.author_city}) ·{' '}
                  {SHOWCASE_HUB_LABELS[previewItem.hub_location]}
                </Text>
                {previewItem.media_url && previewItem.media_kind === 'video' && (
                  <video
                    src={previewItem.media_url}
                    poster={previewItem.thumbnail_url || undefined}
                    controls
                    autoPlay
                    playsInline
                    className="w-full max-h-[60vh] rounded-lg bg-black"
                  />
                )}
                {previewItem.media_url && previewItem.media_kind === 'image' && (
                  <img
                    src={previewItem.media_url}
                    alt={previewItem.title}
                    className="w-full max-h-[60vh] rounded-lg object-contain bg-ui-bg-subtle"
                  />
                )}
                <Text size="base">{previewItem.quote_or_caption}</Text>
              </div>
            )}
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>
    </div>
  )
}

export const config = defineRouteConfig({
  label: 'Feedback & Gallery',
  icon: ShowcaseSidebarIcon,
  rank: 40,
})

export default ShowcaseAdminPage

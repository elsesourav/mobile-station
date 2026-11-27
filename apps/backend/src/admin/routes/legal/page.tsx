import { defineRouteConfig } from '@medusajs/admin-sdk'
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
} from '@medusajs/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LEGAL_CATEGORIES,
  LEGAL_CATEGORY_LABELS,
  normalizeLegalSlug,
  type CreateLegalDocumentInput,
  type LegalCategory,
  type LegalDocumentDeleteResponse,
  type LegalDocumentDTO,
  type LegalDocumentListResponse,
  type LegalDocumentMutationResponse,
  type LegalDocumentStatus,
  type LegalSeedSyncResponse,
} from '@mobile-station/types'
import { adminApiFetch } from '../../lib/showcase-admin-api'
import { LegalMarkdownEditor } from '../../components/LegalMarkdownEditor'

interface LegalFormDraft {
  id: string | null
  slug: string
  title: string
  badge: string
  category: LegalCategory
  summary: string
  content_markdown: string
  status: LegalDocumentStatus
  show_in_footer: boolean
  display_order: string
  version_label: string
  effective_date: string
  updated_by: string
}

const LegalSidebarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h6" />
  </svg>
)

function createBlankLegalDraft(nextOrder: number): LegalFormDraft {
  return {
    id: null,
    slug: '',
    title: '',
    badge: 'LEGAL & POLICY',
    category: 'privacy',
    summary: '',
    content_markdown: '## Overview\n\nDescribe the policy clearly for Mobile Station customers.\n\n- Key term 1\n- Key term 2\n',
    status: 'published',
    show_in_footer: true,
    display_order: String(nextOrder),
    version_label: 'v1.0',
    effective_date: new Date().toISOString().slice(0, 10),
    updated_by: 'Mobile Station Admin',
  }
}

function docToFormDraft(doc: LegalDocumentDTO): LegalFormDraft {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    badge: doc.badge,
    category: doc.category,
    summary: doc.summary,
    content_markdown: doc.content_markdown,
    status: doc.status,
    show_in_footer: doc.show_in_footer,
    display_order: String(doc.display_order ?? 100),
    version_label: doc.version_label || 'v1.0',
    effective_date: doc.effective_date || '',
    updated_by: doc.updated_by || 'Mobile Station Admin',
  }
}

const STOREFRONT_PUBLIC_URL = 'http://localhost:3000'

const LegalAdminPage = () => {
  const [documents, setDocuments] = useState<LegalDocumentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocId, setSelectedDocId] = useState<string | 'new' | null>(null)
  const [slugLocked, setSlugLocked] = useState(false)
  const [draft, setDraft] = useState<LegalFormDraft>(() => createBlankLegalDraft(10))

  const loadDocuments = useCallback(async (preferredId?: string | null) => {
    setLoading(true)
    try {
      const data = await adminApiFetch<LegalDocumentListResponse>('/admin/legal')
      setDocuments(data.items)

      const targetDoc =
        (preferredId && data.items.find((d) => d.id === preferredId)) ||
        data.items[0] ||
        null

      if (targetDoc) {
        setSelectedDocId(targetDoc.id)
        setDraft(docToFormDraft(targetDoc))
        setSlugLocked(true)
      } else {
        setSelectedDocId('new')
        setDraft(createBlankLegalDraft(10))
        setSlugLocked(false)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load legal documents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return documents
    return documents.filter((d) =>
      [d.title, d.slug, d.badge, d.category].join(' ').toLowerCase().includes(q)
    )
  }, [documents, searchQuery])

  const handleSelectDocument = (doc: LegalDocumentDTO) => {
    setSelectedDocId(doc.id)
    setDraft(docToFormDraft(doc))
    setSlugLocked(true)
  }

  const handleCreateNew = () => {
    setSelectedDocId('new')
    setDraft(createBlankLegalDraft(documents.length + 1))
    setSlugLocked(false)
  }

  const handleTitleChange = (nextTitle: string) => {
    setDraft((prev) => ({
      ...prev,
      title: nextTitle,
      slug: !prev.id && !slugLocked ? normalizeLegalSlug(nextTitle) : prev.slug,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: CreateLegalDocumentInput = {
        slug: normalizeLegalSlug(draft.slug || draft.title),
        title: draft.title.trim(),
        badge: draft.badge.trim() || 'LEGAL & POLICY',
        category: draft.category,
        summary: draft.summary.trim(),
        content_markdown: draft.content_markdown.trim(),
        status: draft.status,
        show_in_footer: draft.show_in_footer,
        display_order: Math.max(0, Number(draft.display_order) || 100),
        version_label: draft.version_label.trim() || 'v1.0',
        effective_date: draft.effective_date.trim() || null,
        updated_by: draft.updated_by.trim() || 'Mobile Station Admin',
      }

      if (draft.id) {
        const res = await adminApiFetch<LegalDocumentMutationResponse>(`/admin/legal/${draft.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        toast.success(`Saved "${res.item.title}" (${res.item.status})`)
        await loadDocuments(res.item.id)
      } else {
        const res = await adminApiFetch<LegalDocumentMutationResponse>('/admin/legal', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        toast.success(`Created "/policies/${res.item.slug}"`)
        await loadDocuments(res.item.id)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save legal document')
    } finally {
      setSaving(false)
    }
  }

  const handleSeedDefaults = async () => {
    setSeeding(true)
    try {
      const res = await adminApiFetch<LegalSeedSyncResponse>('/admin/legal/seed', {
        method: 'POST',
      })
      toast.success(
        res.created > 0
          ? `Restored ${res.created} default policy pages (${res.total} total)`
          : `All ${res.total} default policies already exist`
      )
      await loadDocuments(draft.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to seed default policies')
    } finally {
      setSeeding(false)
    }
  }

  const handleDelete = async () => {
    if (!draft.id) return
    if (typeof window !== 'undefined' && !window.confirm(`Delete "${draft.title}" (/policies/${draft.slug})?`)) {
      return
    }
    setDeleting(true)
    try {
      await adminApiFetch<LegalDocumentDeleteResponse>(`/admin/legal/${draft.id}`, {
        method: 'DELETE',
      })
      toast.success(`Deleted "${draft.title}"`)
      await loadDocuments(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete document')
    } finally {
      setDeleting(false)
    }
  }

  const publishedCount = documents.filter((d) => d.status === 'published').length

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="divide-y p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Heading level="h1">Privacy, Legal &amp; Policy Markdown CMS</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Author and publish Privacy Policy, Terms &amp; Conditions, Brand Warranty, Open-Box Delivery,
              18% GST Rules, and Returns in live Markdown synced with PostgreSQL &amp; Redis.
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="small" color="green">
              {publishedCount} Published
            </Badge>
            <Badge size="small" color="grey">
              {documents.length} Total
            </Badge>
            <Button
              variant="secondary"
              disabled={seeding}
              onClick={handleSeedDefaults}
            >
              {seeding ? 'Syncing Defaults...' : 'Seed Default Policies'}
            </Button>
            <Button onClick={handleCreateNew}>+ New Legal Page</Button>
          </div>
        </div>
      </Container>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <Container className="lg:col-span-4 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Heading level="h2" className="text-sm">
              Legal Documents
            </Heading>
            <span className="text-xs text-ui-fg-muted font-mono">{filteredDocuments.length}</span>
          </div>

          <Input
            size="small"
            placeholder="Filter by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <Text size="small" className="text-ui-fg-muted py-6 text-center">
              Loading policy documents...
            </Text>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-6 text-center space-y-2 border border-dashed border-ui-border-base rounded p-4">
              <Text size="small" className="text-ui-fg-subtle">
                No legal pages found in database yet.
              </Text>
              <Button size="small" variant="secondary" onClick={handleSeedDefaults}>
                Seed Privacy &amp; Legal Defaults
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredDocuments.map((doc) => {
                const isSelected = selectedDocId === doc.id
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelectDocument(doc)}
                    className={`w-full text-left rounded-md border p-3 transition ${
                      isSelected
                        ? 'border-ui-border-interactive bg-ui-bg-subtle shadow-sm'
                        : 'border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-subtle/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-ui-fg-base line-clamp-1">
                        {doc.title}
                      </span>
                      <Badge
                        size="small"
                        color={doc.status === 'published' ? 'green' : 'grey'}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px] font-mono text-ui-fg-muted">
                      <span className="truncate">/policies/{doc.slug}</span>
                      <span>{doc.version_label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </Container>

        <Container className="lg:col-span-8 p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ui-border-base">
            <div>
              <Heading level="h2" className="text-base">
                {draft.id ? `Editing: ${draft.title || draft.slug}` : 'Create New Legal Document'}
              </Heading>
              <Text size="small" className="text-ui-fg-muted font-mono">
                Public route: /policies/{draft.slug || 'your-slug'}
              </Text>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {draft.id && draft.status === 'published' && (
                <a
                  href={`${STOREFRONT_PUBLIC_URL}/policies/${draft.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-ui-border-base px-3 py-1.5 text-xs font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
                >
                  View Live Page ↗
                </a>
              )}
              {draft.id && (
                <Button
                  size="small"
                  variant="danger"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
              <Button size="small" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving...' : draft.id ? 'Save Changes' : 'Create Policy'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label size="xsmall" weight="plus">
                Document Title
              </Label>
              <Input
                size="small"
                placeholder="e.g. Privacy Policy"
                value={draft.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label size="xsmall" weight="plus">
                URL Slug (/policies/...)
              </Label>
              <Input
                size="small"
                placeholder="e.g. privacy-policy"
                value={draft.slug}
                onChange={(e) => {
                  setSlugLocked(true)
                  setDraft((prev) => ({ ...prev, slug: e.target.value }))
                }}
              />
            </div>

            <div className="space-y-1">
              <Label size="xsmall" weight="plus">
                Category
              </Label>
              <Select
                size="small"
                value={draft.category}
                onValueChange={(v) => setDraft((prev) => ({ ...prev, category: v as LegalCategory }))}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {LEGAL_CATEGORIES.map((cat) => (
                    <Select.Item key={cat} value={cat}>
                      {LEGAL_CATEGORY_LABELS[cat]}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="space-y-1">
              <Label size="xsmall" weight="plus">
                Header Badge Label
              </Label>
              <Input
                size="small"
                placeholder="DATA & PRIVACY"
                value={draft.badge}
                onChange={(e) => setDraft((prev) => ({ ...prev, badge: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label size="xsmall" weight="plus">
                Version &amp; Effective Date
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  size="small"
                  placeholder="v1.0"
                  value={draft.version_label}
                  onChange={(e) => setDraft((prev) => ({ ...prev, version_label: e.target.value }))}
                />
                <Input
                  size="small"
                  type="date"
                  value={draft.effective_date}
                  onChange={(e) => setDraft((prev) => ({ ...prev, effective_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label size="xsmall" weight="plus">
                Footer Order &amp; Visibility
              </Label>
              <div className="flex items-center justify-between gap-3 rounded-md border border-ui-border-base px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={draft.status === 'published'}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({ ...prev, status: checked ? 'published' : 'draft' }))
                    }
                  />
                  <span className="text-xs font-medium text-ui-fg-base">
                    {draft.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>

                <label className="inline-flex items-center gap-1.5 text-xs text-ui-fg-subtle cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.show_in_footer}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, show_in_footer: e.target.checked }))
                    }
                  />
                  <span>In Footer</span>
                </label>

                <Input
                  size="small"
                  type="number"
                  min={0}
                  className="w-16"
                  value={draft.display_order}
                  onChange={(e) => setDraft((prev) => ({ ...prev, display_order: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label size="xsmall" weight="plus">
              Short Summary (SEO Description &amp; Policy Banner Subtitle)
            </Label>
            <Textarea
              rows={2}
              placeholder="Concise 1-2 line overview shown in search previews and hero banner..."
              value={draft.summary}
              onChange={(e) => setDraft((prev) => ({ ...prev, summary: e.target.value }))}
            />
          </div>

          <LegalMarkdownEditor
            title={draft.title}
            badge={draft.badge}
            summary={draft.summary}
            value={draft.content_markdown}
            onChange={(nextMarkdown) =>
              setDraft((prev) => ({ ...prev, content_markdown: nextMarkdown }))
            }
            onSaveShortcut={handleSave}
          />
        </Container>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: 'Legal & Privacy',
  icon: LegalSidebarIcon,
  rank: 45,
})

export default LegalAdminPage

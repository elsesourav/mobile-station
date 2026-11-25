import type {
  ApiErrorResponse,
  CreateShowcaseEntryInput,
  ShowcaseEntryDTO,
  ShowcaseEntryType,
  ShowcaseHubLocation,
  ShowcaseSignedUploadPayload,
  ShowcaseStatus,
} from '@mobile-station/types'
import type { CloudinaryDirectUploadResult, ShowcaseFormState } from '../types/showcase-admin'

export function createInitialShowcaseFormState(presetType?: ShowcaseEntryType): ShowcaseFormState {
  const entryType = presetType ?? 'customer_feedback'
  return {
    entry_type: entryType,
    category: entryType === 'store_visit' ? 'in_store_pickup' : 'video_unboxing',
    media_kind: entryType === 'store_visit' ? 'image' : 'video',
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
}

export function entryToShowcaseFormState(entry: ShowcaseEntryDTO): ShowcaseFormState {
  return {
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
  }
}

export function buildShowcasePayloadFromForm(
  formState: ShowcaseFormState
): CreateShowcaseEntryInput {
  const hasMedia = formState.media_kind !== 'none'
  return {
    entry_type: formState.entry_type,
    category: formState.category,
    media_kind: formState.media_kind,
    status: formState.status,
    title: formState.title.trim(),
    quote_or_caption: formState.quote_or_caption.trim(),
    author_name: formState.author_name.trim(),
    author_city: formState.author_city.trim() || 'Muzaffarpur, Bihar',
    hub_location: formState.hub_location,
    rating:
      formState.entry_type === 'customer_feedback'
        ? Math.min(5, Math.max(1, Number(formState.rating) || 5))
        : null,
    product_handle: formState.product_handle.trim() || null,
    product_title: formState.product_title.trim() || null,
    media_url: hasMedia ? formState.media_url.trim() || null : null,
    media_public_id: hasMedia ? formState.media_public_id.trim() || null : null,
    thumbnail_url: hasMedia ? formState.thumbnail_url.trim() || null : null,
    duration_seconds: formState.duration_seconds,
    media_width: formState.media_width,
    media_height: formState.media_height,
    mime_type: formState.mime_type,
    is_featured: formState.is_featured,
    is_verified_buyer: formState.is_verified_buyer,
    display_order: Math.max(0, Number(formState.display_order) || 100),
    visited_at: formState.visited_at ? new Date(formState.visited_at).toISOString() : null,
  }
}

export async function adminApiFetch<TResponse>(
  path: string,
  options?: { method?: string; body?: string }
): Promise<TResponse> {
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('medusa_auth_token') : null
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(path, {
    credentials: 'include',
    method: options?.method ?? 'GET',
    body: options?.body,
    headers,
  })

  const rawBody: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMessage =
      rawBody && typeof rawBody === 'object' && 'message' in rawBody
        ? String((rawBody as ApiErrorResponse).message)
        : `Request failed (${response.status})`
    throw new Error(errorMessage)
  }

  return rawBody as TResponse
}

export function uploadFileDirectToCloudinary(
  file: File,
  signedPayload: ShowcaseSignedUploadPayload,
  onProgress: (percentage: number) => void
): Promise<CloudinaryDirectUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', signedPayload.api_key)
    formData.append('timestamp', String(signedPayload.timestamp))
    formData.append('signature', signedPayload.signature)
    formData.append('folder', signedPayload.folder)
    formData.append('tags', signedPayload.tags)
    if (signedPayload.eager) {
      formData.append('eager', signedPayload.eager)
    }

    const request = new XMLHttpRequest()
    request.open('POST', signedPayload.upload_url)
    request.upload.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        onProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100))
      }
    }
    request.onload = () => {
      try {
        const parsed = JSON.parse(request.responseText || '{}') as CloudinaryDirectUploadResult & {
          error?: { message?: string }
        }
        if (request.status >= 200 && request.status < 300 && parsed.secure_url) {
          resolve(parsed)
        } else {
          reject(
            new Error(parsed.error?.message || `Cloudinary upload failed (${request.status})`)
          )
        }
      } catch {
        reject(new Error('Invalid Cloudinary upload response'))
      }
    }
    request.onerror = () => reject(new Error('Network error during Cloudinary media upload'))
    request.send(formData)
  })
}

export function formatAdminHubLabel(hub: ShowcaseHubLocation): string {
  if (hub === 'motijheel-842001') return 'Motijheel (842001)'
  if (hub === 'club-road-842002') return 'Club Road (842002)'
  return 'Pan-India'
}

export function formatAdminStatusLabel(status: ShowcaseStatus): string {
  if (status === 'published') return 'Published'
  if (status === 'draft') return 'Draft'
  return 'Archived'
}

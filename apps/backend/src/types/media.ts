import type { ShowcaseEntryType } from '@mobile-station/types'

export interface CloudinaryModuleOptions {
  cloud_name?: string
  api_key?: string
  api_secret?: string
  folder?: string
}

export interface CloudinaryResolvedConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
  rootFolder: string
}

export interface CloudinaryUploadFileInput {
  filename?: string
  mimeType?: string
  content: Buffer | string | Uint8Array
}

export interface CloudinaryFileKeyReference {
  fileKey?: string
  key?: string
}

export type CloudinaryDeleteTarget =
  | string
  | CloudinaryFileKeyReference
  | Array<string | CloudinaryFileKeyReference>

export interface ShowcaseMediaValidationInput {
  media_kind: 'video' | 'image'
  mime_type?: string
  filename?: string
  file_size_bytes?: number
}

export interface ShowcaseMediaValidationOutcome {
  mediaKind: 'video' | 'image'
  maxAllowedBytes: number
}

export interface ShowcaseMediaBufferUploadInput {
  entry_type: ShowcaseEntryType
  media_kind: 'video' | 'image'
  filename?: string
  mime_type?: string
  content: Buffer | Uint8Array | string
}

export interface OptimizedShowcaseUrls {
  media_url: string
  thumbnail_url: string
}

export interface ResendNotificationOptions {
  channels?: string[]
  api_key?: string
  from_email?: string
  from_name?: string
  reply_to?: string
  mock_mode?: boolean
}

export interface ResendEmailContentPayload {
  subject?: string
  html?: string
  text?: string
}

export interface MeilisearchIndexSettingsPayload {
  searchableAttributes: string[]
  filterableAttributes: string[]
  sortableAttributes: string[]
}

export interface MeilisearchIndexSyncResult {
  indexName: string
  status: 'configured' | 'indexed'
  count?: number
}

import { MedusaError } from '@medusajs/framework/utils'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import type {
  ShowcaseEntryType,
  ShowcaseSignedUploadPayload,
  ShowcaseUploadMediaResult,
} from '@mobile-station/types'
import type {
  CloudinaryModuleOptions,
  CloudinaryResolvedConfig,
  OptimizedShowcaseUrls,
  ShowcaseMediaBufferUploadInput,
  ShowcaseMediaValidationInput,
  ShowcaseMediaValidationOutcome,
} from '../../types/media'
import type { ShowcaseAssetDestructionResult } from '../../types/showcase-backend'

const ALLOWED_IMAGE_MIME = /^image\/(webp|jpeg|jpg|png|avif|gif)$/i
const ALLOWED_VIDEO_MIME = /^video\/(mp4|webm|quicktime|x-m4v)$/i
const ALLOWED_MEDIA_EXT = /\.(mp4|webm|mov|m4v|webp|png|jpe?g|avif|gif)$/i

export const MAX_SHOWCASE_VIDEO_BYTES = 100 * 1024 * 1024 // 100 MB
export const MAX_SHOWCASE_IMAGE_BYTES = 15 * 1024 * 1024 // 15 MB

/**
 * Dedicated Cloudinary media pipeline for public Customer Video Feedback and
 * Muzaffarpur / Pan-India Store Visit Gallery assets.
 */
export class ShowcaseCloudinaryMediaService {
  private readonly cloudName: string
  private readonly apiKey: string
  private readonly apiSecret: string
  private readonly rootFolder: string

  constructor(config?: CloudinaryModuleOptions) {
    this.cloudName = config?.cloud_name || process.env.CLOUDINARY_CLOUD_NAME || ''
    this.apiKey = config?.api_key || process.env.CLOUDINARY_API_KEY || ''
    this.apiSecret = config?.api_secret || process.env.CLOUDINARY_API_SECRET || ''
    this.rootFolder = config?.folder || process.env.CLOUDINARY_FOLDER || 'mobile-station'

    if (this.cloudName && this.apiKey && this.apiSecret) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        secure: true,
      })
    }
  }

  private assertConfigured(): CloudinaryResolvedConfig {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Cloudinary credentials are not configured. Provide CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      )
    }
    return {
      cloudName: this.cloudName,
      apiKey: this.apiKey,
      apiSecret: this.apiSecret,
      rootFolder: this.rootFolder,
    }
  }

  validateShowcaseFile(params: ShowcaseMediaValidationInput): ShowcaseMediaValidationOutcome {
    const mime = (params.mime_type || '').trim()
    const filename = (params.filename || '').trim()

    if (
      mime &&
      (mime === 'application/pdf' ||
        mime.includes('csv') ||
        mime.includes('zip') ||
        mime.includes('sql') ||
        (!ALLOWED_IMAGE_MIME.test(mime) && !ALLOWED_VIDEO_MIME.test(mime)))
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'ShowcaseCloudinaryMediaService accepts public images and videos only. Route PDFs, invoices, and private files to PrivateDocumentStorageService (S3/R2).'
      )
    }

    if (params.media_kind === 'video' && mime && !ALLOWED_VIDEO_MIME.test(mime)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Unsupported video format. Allowed video formats: MP4, WebM, MOV, M4V.'
      )
    }

    if (params.media_kind === 'image' && mime && !ALLOWED_IMAGE_MIME.test(mime)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Unsupported image format. Allowed image formats: WebP, JPG, PNG, AVIF, GIF.'
      )
    }

    if (filename && !ALLOWED_MEDIA_EXT.test(filename) && !mime) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'ShowcaseCloudinaryMediaService accepts public image or video extensions only.'
      )
    }

    const maxAllowedBytes =
      params.media_kind === 'video' ? MAX_SHOWCASE_VIDEO_BYTES : MAX_SHOWCASE_IMAGE_BYTES

    if (params.file_size_bytes !== undefined && params.file_size_bytes > maxAllowedBytes) {
      const maxMegabytes = Math.round(maxAllowedBytes / (1024 * 1024))
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `File size exceeds the ${maxMegabytes} MB limit for ${params.media_kind} uploads.`
      )
    }

    return { mediaKind: params.media_kind, maxAllowedBytes }
  }

  getSubfolder(entryType: ShowcaseEntryType, mediaKind: 'video' | 'image'): string {
    const bucketSegment =
      entryType === 'customer_feedback'
        ? mediaKind === 'video'
          ? 'feedback-videos'
          : 'feedback-photos'
        : 'store-visits'
    return `${this.rootFolder}/${bucketSegment}`
  }

  buildOptimizedMediaUrls(params: {
    public_id: string
    media_kind: 'video' | 'image'
    fallback_secure_url?: string
  }): OptimizedShowcaseUrls {
    const { public_id, media_kind, fallback_secure_url } = params
    if (!this.cloudName || !public_id) {
      return {
        media_url: fallback_secure_url || '',
        thumbnail_url: fallback_secure_url || '',
      }
    }

    if (media_kind === 'video') {
      return {
        media_url: `https://res.cloudinary.com/${this.cloudName}/video/upload/q_auto:good,f_auto/${public_id}`,
        thumbnail_url: `https://res.cloudinary.com/${this.cloudName}/video/upload/so_1,f_jpg,q_auto:good,w_900,c_limit/${public_id}.jpg`,
      }
    }

    return {
      media_url: `https://res.cloudinary.com/${this.cloudName}/image/upload/f_auto,q_auto:good,w_1400,c_limit/${public_id}`,
      thumbnail_url: `https://res.cloudinary.com/${this.cloudName}/image/upload/f_auto,q_auto:good,w_800,c_limit/${public_id}`,
    }
  }

  createSignedUploadSignature(
    params: ShowcaseMediaValidationInput & { entry_type: ShowcaseEntryType }
  ): ShowcaseSignedUploadPayload {
    const { maxAllowedBytes } = this.validateShowcaseFile(params)
    const config = this.assertConfigured()

    const timestamp = Math.floor(Date.now() / 1000)
    const folder = this.getSubfolder(params.entry_type, params.media_kind)
    const resourceType = params.media_kind
    const tags = ['mobile-station', 'showcase', params.entry_type, resourceType].join(',')

    const paramsToSign: Record<string, string | number> = {
      folder,
      tags,
      timestamp,
    }
    if (resourceType === 'video') {
      paramsToSign.eager = 'q_auto:good,vc_auto|so_1,f_jpg,w_900,c_limit'
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, config.apiSecret)

    return {
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      timestamp,
      signature,
      folder,
      resource_type: resourceType,
      upload_url: `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
      tags,
      eager: typeof paramsToSign.eager === 'string' ? paramsToSign.eager : undefined,
      max_file_size_bytes: maxAllowedBytes,
    }
  }

  async uploadMediaBuffer(
    params: ShowcaseMediaBufferUploadInput
  ): Promise<ShowcaseUploadMediaResult> {
    const buffer = Buffer.isBuffer(params.content)
      ? params.content
      : typeof params.content === 'string'
        ? Buffer.from(params.content, 'base64')
        : Buffer.from(params.content)

    this.validateShowcaseFile({
      media_kind: params.media_kind,
      mime_type: params.mime_type,
      filename: params.filename,
      file_size_bytes: buffer.byteLength,
    })
    this.assertConfigured()

    const folder = this.getSubfolder(params.entry_type, params.media_kind)
    const tags = ['mobile-station', 'showcase', params.entry_type, params.media_kind]

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: params.media_kind,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          tags,
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new MedusaError(
                MedusaError.Types.UNEXPECTED_STATE,
                `Cloudinary showcase upload failed: ${error?.message || 'Unknown error'}`
              )
            )
          }

          const optimizedUrls = this.buildOptimizedMediaUrls({
            public_id: result.public_id,
            media_kind: params.media_kind,
            fallback_secure_url: result.secure_url,
          })

          resolve({
            media_url: optimizedUrls.media_url,
            media_public_id: result.public_id,
            thumbnail_url: optimizedUrls.thumbnail_url,
            duration_seconds:
              typeof result.duration === 'number' ? Math.round(result.duration * 10) / 10 : null,
            media_width: typeof result.width === 'number' ? result.width : null,
            media_height: typeof result.height === 'number' ? result.height : null,
            mime_type:
              params.mime_type ||
              (result.format ? `${params.media_kind}/${result.format}` : null),
          })
        }
      )

      const readable = new Readable()
      readable.push(buffer)
      readable.push(null)
      readable.pipe(uploadStream)
    })
  }

  async destroyAsset(
    publicId: string | null | undefined,
    mediaKind: 'video' | 'image' | 'none'
  ): Promise<ShowcaseAssetDestructionResult> {
    if (!publicId || mediaKind === 'none' || !this.cloudName || !this.apiKey || !this.apiSecret) {
      return { deleted: false, publicId: publicId ?? null }
    }
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: mediaKind })
      return { deleted: true, publicId }
    } catch {
      return { deleted: false, publicId }
    }
  }
}

import { AbstractFileProviderService, MedusaError } from '@medusajs/framework/utils'
import type { Logger } from '@medusajs/framework/types'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import type {
  CloudinaryDeleteTarget,
  CloudinaryFileKeyReference,
  CloudinaryModuleOptions,
  CloudinaryUploadFileInput,
} from '../../types/media'

type InjectedDependencies = {
  logger?: Logger
}

const ALLOWED_IMAGE_EXT = /\.(avif|webp|png|jpe?g|gif|svg)$/i

/**
 * Public Image CDN Provider (Cloudinary).
 * Strictly enforces separation: ONLY public storefront/product images may be uploaded here.
 * Private documents (GST invoices, warranty PDFs, CSVs, backups) belong in storage-s3.
 */
export class CloudinaryImageService extends AbstractFileProviderService {
  public static identifier = 'cloudinary'

  protected readonly logger_?: Logger
  protected readonly options_: CloudinaryModuleOptions

  constructor(dependencies: InjectedDependencies = {}, options: CloudinaryModuleOptions = {}) {
    super()
    this.logger_ = dependencies.logger
    this.options_ = options

    cloudinary.config({
      cloud_name: this.options_.cloud_name || process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: this.options_.api_key || process.env.CLOUDINARY_API_KEY || '',
      api_secret: this.options_.api_secret || process.env.CLOUDINARY_API_SECRET || '',
      secure: true,
    })
  }

  async upload(file: CloudinaryUploadFileInput): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No file provided')
    }

    const mime = file.mimeType || ''
    const filename = file.filename || ''
    if (
      (mime && !mime.startsWith('image/')) ||
      (filename && !ALLOWED_IMAGE_EXT.test(filename) && mime === '')
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'CloudinaryImageService accepts public images only. Route PDFs, invoices, and CSVs to PrivateDocumentStorageService (S3/R2).'
      )
    }

    const folder = this.options_.folder || process.env.CLOUDINARY_FOLDER || 'mobile-station'
    const buffer = Buffer.isBuffer(file.content)
      ? file.content
      : typeof file.content === 'string'
        ? Buffer.from(file.content, 'base64')
        : Buffer.from(file.content)

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            this.logger_?.error?.(
              `[CloudinaryImageService] Upload failed: ${error?.message || 'Unknown error'}`
            )
            return reject(
              new MedusaError(
                MedusaError.Types.UNEXPECTED_STATE,
                `Cloudinary upload failed: ${error?.message || 'Unknown error'}`
              )
            )
          }
          resolve({
            url: result.secure_url,
            key: result.public_id,
          })
        }
      )

      const readable = new Readable()
      readable.push(buffer)
      readable.push(null)
      readable.pipe(uploadStream)
    })
  }

  async delete(files: CloudinaryDeleteTarget): Promise<void> {
    const fileList = Array.isArray(files) ? files : [files]
    for (const file of fileList) {
      const key = typeof file === 'string' ? file : file?.fileKey || file?.key
      if (!key) continue
      try {
        await cloudinary.uploader.destroy(key)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        this.logger_?.warn?.(`[CloudinaryImageService] Failed to destroy ${key}: ${msg}`)
      }
    }
  }

  async getPresignedDownloadUrl(fileData: string | CloudinaryFileKeyReference): Promise<string> {
    const key = typeof fileData === 'string' ? fileData : fileData?.fileKey || fileData?.key
    if (!key) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No fileKey provided')
    }
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key
    }
    return cloudinary.url(key, { secure: true, fetch_format: 'auto', quality: 'auto' })
  }
}

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export type PrivateDocumentKind =
  | 'gst-invoices'
  | 'warranty-cards'
  | 'return-proofs'
  | 'csv-imports'
  | 'db-backups'

export interface PrivateStorageConfig {
  endpoint: string
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  presignedTtlSeconds: number
}

/**
 * Separated Private Object Storage Client (Cloudflare R2 / AWS S3 / MinIO).
 * Strictly isolated from Cloudinary (public images) and PostgreSQL (transactional state).
 */
export class PrivateDocumentStorageService {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly defaultTtl: number

  constructor(config?: Partial<PrivateStorageConfig>) {
    const endpoint = config?.endpoint ?? process.env.STORAGE_S3_ENDPOINT ?? 'http://localhost:9100'
    const region = config?.region ?? process.env.STORAGE_S3_REGION ?? 'auto'
    this.bucket = config?.bucket ?? process.env.STORAGE_S3_BUCKET ?? 'mobile-station-private'
    const accessKeyId = config?.accessKeyId ?? process.env.STORAGE_S3_ACCESS_KEY_ID ?? ''
    const secretAccessKey =
      config?.secretAccessKey ?? process.env.STORAGE_S3_SECRET_ACCESS_KEY ?? ''
    this.defaultTtl = Number(
      config?.presignedTtlSeconds ?? process.env.STORAGE_PRESIGNED_TTL_SECONDS ?? 900
    )

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  buildObjectKey(kind: PrivateDocumentKind, filename: string): string {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `mobile-station/${kind}/${Date.now()}-${safeName}`
  }

  async uploadPrivateObject(params: {
    kind: PrivateDocumentKind
    filename: string
    body: Buffer | Uint8Array | string
    contentType: string
  }): Promise<{ key: string; bucket: string }> {
    const key = this.buildObjectKey(params.kind, params.filename)
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: params.body,
        ContentType: params.contentType,
      })
    )
    return { key, bucket: this.bucket }
  }

  async getPresignedDownloadUrl(key: string, ttlSeconds?: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })
    return getSignedUrl(this.client, command, {
      expiresIn: Math.min(ttlSeconds ?? this.defaultTtl, 900),
    })
  }

  async deletePrivateObject(key: string): Promise<{ deletedKey: string }> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )
    return { deletedKey: key }
  }

  async checkBucketHealth(): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
      return true
    } catch {
      return false
    }
  }
}

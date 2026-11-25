import { CloudinaryImageService } from '../modules/file-cloudinary/service'
import { PrivateDocumentStorageService } from '../modules/storage-s3/service'
import {
  ShowcaseCloudinaryMediaService,
  MAX_SHOWCASE_VIDEO_BYTES,
} from '../modules/showcase/cloudinary-media'
import { validateProductionConfig } from '../../medusa-config'

describe('Mobile Station separated storage & security guards', () => {
  it('blocks PDF invoice uploads to CloudinaryImageService', async () => {
    const cloudinary = new CloudinaryImageService({}, {
      cloud_name: 'ekbuxdbd',
      api_key: 'test_key',
      api_secret: 'test_secret',
    })

    await expect(
      cloudinary.upload({
        filename: 'gst-invoice-123.pdf',
        mimeType: 'application/pdf',
        content: Buffer.from('%PDF-1.4'),
      })
    ).rejects.toThrow(/CloudinaryImageService accepts public images only/)
  })

  it('namespaces private S3 object keys cleanly by document type', () => {
    const s3 = new PrivateDocumentStorageService({
      endpoint: 'http://localhost:9100',
      bucket: 'mobile-station-private',
      accessKeyId: 'test',
      secretAccessKey: 'test',
    })

    const key = s3.buildObjectKey('gst-invoices', 'MS-INV 2026#1.pdf')
    expect(key).toMatch(/^mobile-station\/gst-invoices\/\d+-MS-INV_2026_1\.pdf$/)
  })

  it('rejects Supabase port 6543 transaction pooler in production mode', () => {
    expect(() =>
      validateProductionConfig({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://user:pass@pooler.supabase.com:6543/postgres',
        REDIS_URL: 'rediss://localhost:6379',
      })
    ).toThrow(/Port 6543/)
  })

  it('enforces public-only media & folder scoping for ShowcaseCloudinaryMediaService', () => {
    const media = new ShowcaseCloudinaryMediaService({
      cloud_name: 'ekbuxdbd',
      api_key: 'test_key',
      api_secret: 'test_secret',
      folder: 'mobile-station',
    })

    expect(() =>
      media.createSignedUploadSignature({
        entry_type: 'customer_feedback',
        media_kind: 'video',
        filename: 'gst-invoice.pdf',
        mime_type: 'application/pdf',
      })
    ).toThrow(/accepts public images and videos only/)

    expect(() =>
      media.validateShowcaseFile({
        media_kind: 'video',
        mime_type: 'video/mp4',
        file_size_bytes: MAX_SHOWCASE_VIDEO_BYTES + 1,
      })
    ).toThrow(/exceeds the 100 MB limit/)

    const signed = media.createSignedUploadSignature({
      entry_type: 'customer_feedback',
      media_kind: 'video',
      filename: 'iphone16-unboxing.mp4',
      mime_type: 'video/mp4',
      file_size_bytes: 8_500_000,
    })

    expect(signed.folder).toBe('mobile-station/feedback-videos')
    expect(signed.resource_type).toBe('video')
    expect(signed.signature).toMatch(/^[a-f0-9]{40}$/)

    const urls = media.buildOptimizedMediaUrls({
      public_id: 'mobile-station/feedback-videos/demo-clip',
      media_kind: 'video',
    })
    expect(urls.media_url).toContain('/video/upload/q_auto:good,f_auto/')
    expect(urls.thumbnail_url).toContain('/video/upload/so_1,f_jpg,q_auto:good,w_900,c_limit/')
  })
})

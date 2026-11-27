import { CloudinaryImageService } from '../modules/file-cloudinary/service'
import { PrivateDocumentStorageService } from '../modules/storage-s3/service'
import {
  ShowcaseCloudinaryMediaService,
  MAX_SHOWCASE_VIDEO_BYTES,
} from '../modules/showcase/cloudinary-media'
import { validateProductionConfig } from '../../medusa-config'
import {
  createLegalDocumentSchema,
  electronicsMetadataSchema,
  sanitizeMarkdownUrl,
  updateLegalDocumentSchema,
} from '@mobile-station/types'

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

  it('validates seller-controlled GST flags and per-color images in electronics metadata schema', () => {
    const valid = electronicsMetadataSchema.parse({
      category_type: 'smartphones',
      brand: 'Apple',
      model_number: 'MYEC3HN/A',
      hsn_code: '8517',
      gst_rate_percent: 18,
      gst_invoice_available: true,
      b2b_gst_available: false,
      color_images: {
        Ultramarine: ['https://res.cloudinary.com/ekbuxdbd/image/upload/v1/mobile-station/ultramarine.webp'],
      },
      warranty_months: 12,
      warranty_type: 'brand_authorized',
      warranty_summary: '1 Year Apple Warranty',
      in_the_box: ['iPhone 16', 'USB-C Cable'],
    })

    expect(valid.gst_invoice_available).toBe(true)
    expect(valid.b2b_gst_available).toBe(false)
    expect(valid.color_images?.Ultramarine).toHaveLength(1)
  })

  it('validates legal Markdown document payloads and neutralizes unsafe link schemes', () => {
    const created = createLegalDocumentSchema.parse({
      slug: 'Privacy Policy!!',
      title: 'Privacy Policy',
      category: 'privacy',
      summary: 'Customer privacy guarantees across Mobile Station hubs and storefront.',
      content_markdown: '## Privacy\n\nYour data stays protected under DPDP Act 2023.',
    })
    expect(created.slug).toBe('privacy-policy')

    const patched = updateLegalDocumentSchema.parse({
      status: 'draft',
      version_label: 'v1.1',
    })
    expect(patched.status).toBe('draft')
    expect(sanitizeMarkdownUrl('javascript:alert(1)')).toBe('#')
  })
})

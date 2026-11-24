import { CloudinaryImageService } from '../modules/file-cloudinary/service'
import { PrivateDocumentStorageService } from '../modules/storage-s3/service'
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
})

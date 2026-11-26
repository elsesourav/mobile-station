import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { updateProductsWorkflow } from '@medusajs/medusa/core-flows'
import { z } from 'zod'
import { CloudinaryImageService } from '../../../../../modules/file-cloudinary/service'

const colorImagesSchema = z.record(z.array(z.string().url()))

const updateElectronicsSettingsSchema = z.object({
  gst_invoice_available: z.boolean().optional(),
  b2b_gst_available: z.boolean().optional(),
  gst_rate_percent: z.union([z.literal(5), z.literal(12), z.literal(18), z.literal(28)]).optional(),
  hsn_code: z.string().trim().regex(/^[0-9]{4,8}$/, 'HSN code must be 4 to 8 digits').optional(),
  product_coupon_code: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === '' || /^[A-Z0-9_-]{3,24}$/.test(v), 'Coupon code must be 3-24 uppercase letters/numbers')
    .optional(),
  product_coupon_percent: z.number().int().min(1).max(50).nullable().optional(),
  product_coupon_min_paise: z.number().int().min(0).nullable().optional(),
  color_images: colorImagesSchema.optional(),
  upload_color_image: z
    .object({
      color_name: z.string().trim().min(1).max(80),
      filename: z.string().trim().min(1).max(180).optional(),
      mime_type: z.string().trim().min(3).max(80).optional(),
      content_base64: z.string().min(4),
    })
    .optional(),
})

function extractDetectedColors(
  variants: Array<{ options?: Array<{ option?: { title?: string }; value?: string }> }> | undefined
): string[] {
  const colors = new Set<string>()
  for (const variant of variants ?? []) {
    for (const opt of variant.options ?? []) {
      const optTitle = (opt.option?.title || '').toLowerCase()
      if ((optTitle === 'color' || optTitle === 'finish') && opt.value) {
        colors.add(opt.value)
      }
    }
  }
  return Array.from(colors)
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<MedusaResponse> => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: 'product',
    fields: [
      'id',
      'handle',
      'title',
      'metadata',
      'variants.id',
      'variants.title',
      'variants.options.*',
      'variants.options.option.*',
    ],
    filters: { id },
  })

  const product = data[0]
  if (!product) {
    return res.status(404).json({ type: 'not_found', message: 'Product not found' })
  }

  const meta = (product.metadata || {}) as Record<string, unknown>

  return res.status(200).json({
    product_id: product.id,
    handle: product.handle,
    title: product.title,
    gst_invoice_available: Boolean(meta.gst_invoice_available),
    b2b_gst_available: Boolean(meta.b2b_gst_available),
    gst_rate_percent: typeof meta.gst_rate_percent === 'number' ? meta.gst_rate_percent : 18,
    hsn_code: typeof meta.hsn_code === 'string' ? meta.hsn_code : '',
    product_coupon_code:
      typeof meta.product_coupon_code === 'string' ? meta.product_coupon_code : '',
    product_coupon_percent:
      typeof meta.product_coupon_percent === 'number' ? meta.product_coupon_percent : null,
    product_coupon_min_paise:
      typeof meta.product_coupon_min_paise === 'number' ? meta.product_coupon_min_paise : null,
    color_images:
      meta.color_images && typeof meta.color_images === 'object'
        ? (meta.color_images as Record<string, string[]>)
        : {},
    detected_colors: extractDetectedColors(
      product.variants as Array<{ options?: Array<{ option?: { title?: string }; value?: string }> }>
    ),
  })
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<MedusaResponse> => {
  const { id } = req.params
  const parsed = updateElectronicsSettingsSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid product electronics payload',
    })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: 'product',
    fields: ['id', 'metadata'],
    filters: { id },
  })

  const product = data[0]
  if (!product) {
    return res.status(404).json({ type: 'not_found', message: 'Product not found' })
  }

  const currentMeta = { ...((product.metadata || {}) as Record<string, unknown>) }
  const input = parsed.data

  if (input.gst_invoice_available !== undefined) {
    currentMeta.gst_invoice_available = input.gst_invoice_available
    if (!input.gst_invoice_available) {
      currentMeta.b2b_gst_available = false
    }
  }
  if (input.b2b_gst_available !== undefined) {
    currentMeta.b2b_gst_available = input.b2b_gst_available
  }
  if (input.gst_rate_percent !== undefined) {
    currentMeta.gst_rate_percent = input.gst_rate_percent
  }
  if (input.hsn_code !== undefined) {
    currentMeta.hsn_code = input.hsn_code
  }

  if (input.product_coupon_code !== undefined) {
    if (!input.product_coupon_code) {
      delete currentMeta.product_coupon_code
      delete currentMeta.product_coupon_percent
      delete currentMeta.product_coupon_min_paise
    } else {
      currentMeta.product_coupon_code = input.product_coupon_code
      if (input.product_coupon_percent != null) {
        currentMeta.product_coupon_percent = input.product_coupon_percent
      }
      if (input.product_coupon_min_paise !== undefined) {
        if (input.product_coupon_min_paise === null) {
          delete currentMeta.product_coupon_min_paise
        } else {
          currentMeta.product_coupon_min_paise = input.product_coupon_min_paise
        }
      }
    }
  }

  const nextColorImages: Record<string, string[]> =
    input.color_images !== undefined
      ? { ...input.color_images }
      : { ...((currentMeta.color_images as Record<string, string[]> | undefined) ?? {}) }

  let uploadedImageUrl: string | undefined
  if (input.upload_color_image) {
    const rawBase64 = input.upload_color_image.content_base64.includes(';base64,')
      ? input.upload_color_image.content_base64.split(';base64,')[1]
      : input.upload_color_image.content_base64
    const cloudinary = new CloudinaryImageService({}, { folder: 'mobile-station/products' })
    const uploaded = await cloudinary.upload({
      filename: input.upload_color_image.filename || `${input.upload_color_image.color_name}.webp`,
      mimeType: input.upload_color_image.mime_type || 'image/webp',
      content: Buffer.from(rawBase64, 'base64'),
    })
    uploadedImageUrl = uploaded.url
    const existingList = nextColorImages[input.upload_color_image.color_name] ?? []
    nextColorImages[input.upload_color_image.color_name] = Array.from(
      new Set([...existingList, uploaded.url])
    )
  }

  currentMeta.color_images = nextColorImages

  await updateProductsWorkflow(req.scope).run({
    input: {
      selector: { id },
      update: { metadata: currentMeta },
    },
  })

  return res.status(200).json({
    product_id: id,
    gst_invoice_available: Boolean(currentMeta.gst_invoice_available),
    b2b_gst_available: Boolean(currentMeta.b2b_gst_available),
    gst_rate_percent:
      typeof currentMeta.gst_rate_percent === 'number' ? currentMeta.gst_rate_percent : 18,
    hsn_code: typeof currentMeta.hsn_code === 'string' ? currentMeta.hsn_code : '',
    product_coupon_code:
      typeof currentMeta.product_coupon_code === 'string' ? currentMeta.product_coupon_code : '',
    product_coupon_percent:
      typeof currentMeta.product_coupon_percent === 'number'
        ? currentMeta.product_coupon_percent
        : null,
    product_coupon_min_paise:
      typeof currentMeta.product_coupon_min_paise === 'number'
        ? currentMeta.product_coupon_min_paise
        : null,
    color_images: nextColorImages,
    uploaded_url: uploadedImageUrl,
  })
}

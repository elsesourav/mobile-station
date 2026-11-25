import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  uploadSignatureRequestSchema,
  type ApiErrorResponse,
  type ShowcaseSignedUploadPayload,
} from '@mobile-station/types'
import { ShowcaseCloudinaryMediaService } from '../../../../modules/showcase/cloudinary-media'

/**
 * POST /admin/showcase/upload-signature
 * Generates short-lived HMAC signed parameters so Medusa Admin uploads heavy
 * video feedback and store-visit media directly to Cloudinary CDN over HTTPS.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse<ShowcaseSignedUploadPayload | ApiErrorResponse>
): Promise<MedusaResponse<ShowcaseSignedUploadPayload | ApiErrorResponse>> => {
  const parsed = uploadSignatureRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid upload signature request',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    })
  }

  const mediaService = new ShowcaseCloudinaryMediaService()
  const payload = mediaService.createSignedUploadSignature(parsed.data)

  return res.status(200).json(payload)
}

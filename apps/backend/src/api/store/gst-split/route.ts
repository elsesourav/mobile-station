import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { indianGstinSchema } from '@mobile-station/types'

export const AUTHENTICATE = false

/**
 * GET /store/gst-split?amount_paise=7490000&state=Bihar&gstin=...
 * Computes inclusive 18% GST tax breakdown (9% CGST + 9% SGST for Bihar; 18% IGST inter-state).
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const amountPaise = Math.max(0, Number(req.query.amount_paise || 0))
  const state = String(req.query.state || '').trim().toLowerCase()
  const gstinRaw = String(req.query.gstin || '').trim()

  let gstinValid: boolean | null = null
  let gstinError: string | null = null
  if (gstinRaw) {
    const check = indianGstinSchema.safeParse(gstinRaw)
    gstinValid = check.success
    gstinError = check.success ? null : check.error.issues[0]?.message || 'Invalid GSTIN'
  }

  const gstRate = 18
  const taxableValuePaise = Math.round((amountPaise * 100) / (100 + gstRate))
  const totalTaxPaise = amountPaise - taxableValuePaise
  const isIntraStateBihar = state === 'bihar' || state === 'br' || gstinRaw.startsWith('10')

  const cgstPaise = isIntraStateBihar ? Math.floor(totalTaxPaise / 2) : 0
  const sgstPaise = isIntraStateBihar ? totalTaxPaise - cgstPaise : 0
  const igstPaise = isIntraStateBihar ? 0 : totalTaxPaise

  res.status(200).json({
    amount_paise: amountPaise,
    taxable_value_paise: taxableValuePaise,
    gst_rate_percent: gstRate,
    supply_type: isIntraStateBihar ? 'INTRA_STATE_BIHAR' : 'INTER_STATE',
    cgst_paise: cgstPaise,
    sgst_paise: sgstPaise,
    igst_paise: igstPaise,
    total_tax_paise: totalTaxPaise,
    gstin_valid: gstinValid,
    gstin_error: gstinError,
  })
}

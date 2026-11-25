import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { indianPincodeSchema, type PincodeServiceabilityApiResponse } from '@mobile-station/types'

export const AUTHENTICATE = false

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<PincodeServiceabilityApiResponse>
): Promise<MedusaResponse<PincodeServiceabilityApiResponse>> => {
  const rawPin = String(req.query.pincode || '').trim()
  const parsed = indianPincodeSchema.safeParse(rawPin)

  if (!parsed.success) {
    return res.status(400).json({
      serviceable: false,
      error: parsed.error.issues[0]?.message || 'Invalid Indian PIN code',
    })
  }

  const pin = parsed.data
  const isMuzaffarpurLocal = pin === '842001' || pin === '842002' || pin.startsWith('842')
  const isBihar =
    pin.startsWith('80') ||
    pin.startsWith('81') ||
    pin.startsWith('82') ||
    pin.startsWith('83') ||
    pin.startsWith('84') ||
    pin.startsWith('85')

  return res.status(200).json({
    serviceable: true,
    pincode: pin,
    pickup_hub: 'Mobile Station Motijheel Hub (842001)',
    estimated_days: isMuzaffarpurLocal
      ? 'Same-Day / 1 Day'
      : isBihar
        ? '1–2 Business Days'
        : '2–4 Business Days Express Air',
    store_pickup_available: pin === '842001' || pin === '842002',
    open_box_delivery_supported: true,
    cod_available_up_to_inr: 10000,
  })
}

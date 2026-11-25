import { z } from 'zod'

const specScalarSchema = z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])

/**
 * Indian 6-digit PIN code validation (cannot begin with 0).
 */
export const indianPincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, {
    message: 'Enter a valid 6-digit Indian PIN code (e.g. 842001, 560001)',
  })

/**
 * Indian 10-digit cellular mobile number validation.
 */
export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9][0-9]{9}$/, {
    message: 'Enter a valid 10-digit Indian mobile number',
  })

/**
 * Official 15-character Indian GSTIN validation for B2B Input Tax Credit invoices.
 */
export const indianGstinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Enter a valid 15-character GSTIN (e.g. 10AABCU9603R1ZM)',
  })

/**
 * Indian Delivery Address Schema.
 */
export const indianAddressSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().min(1, 'Last name is required'),
  address_1: z.string().trim().min(5, 'House/Flat No. and Street address are required'),
  address_2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  province: z.string().trim().min(2, 'State is required'),
  postal_code: indianPincodeSchema,
  phone: indianPhoneSchema,
  country_code: z.literal('in').default('in'),
})

export const b2bGstDetailsSchema = z.object({
  wants_gst_invoice: z.boolean().default(false),
  gstin: indianGstinSchema.optional(),
  business_name: z.string().trim().min(2).max(120).optional(),
}).refine(
  (val) => !val.wants_gst_invoice || (Boolean(val.gstin) && Boolean(val.business_name)),
  { message: 'Both GSTIN and Registered Business Name are required for a B2B GST invoice' }
)

export const electronicsStockDetailsSchema = z.object({
  tracking_mode: z.enum(['imei_serialized', 'serial_tracked', 'sku_quantity']).default('sku_quantity'),
  warehouse_hub: z.string().trim().min(2).default('Muzaffarpur Flagship Hub (842001)'),
  warehouse_bin: z.string().trim().min(2),
  low_stock_threshold: z.number().int().min(1).max(100).default(5),
  safety_stock: z.number().int().min(0).max(50).default(2),
  restock_lead_days: z.number().int().min(1).max(30).default(3),
  return_window_days: z.number().int().min(0).max(30).default(7),
})

export const electronicsMetadataSchema = z.object({
  category_type: z.enum([
    'smartphones',
    'tablets',
    'laptops',
    'audio',
    'keyboards-mice',
    'power-charging',
    'accessories-storage',
  ]),
  brand: z.string().trim().min(1),
  model_number: z.string().trim().min(1),
  hsn_code: z.string().trim().regex(/^[0-9]{4,8}$/, 'HSN code must be 4 to 8 digits'),
  gst_rate_percent: z.union([z.literal(5), z.literal(12), z.literal(18), z.literal(28)]).default(18),
  warranty_months: z.number().int().min(0).max(120),
  warranty_type: z.enum(['brand_authorized', 'seller_warranty', 'replacement_only', 'none']),
  warranty_summary: z.string().trim().min(1),
  condition: z.enum(['brand_new_sealed', 'open_box_verified', 'certified_refurbished']).default('brand_new_sealed'),
  in_the_box: z.array(z.string().trim().min(1)).min(1),
  requires_imei_or_serial: z.boolean().default(false),
  requires_open_box_delivery: z.boolean().default(false),
  emi_eligible: z.boolean().default(true),
  cod_eligible: z.boolean().default(true),
  key_highlights: z.array(z.string().trim().min(1)).optional(),
  stock_details: electronicsStockDetailsSchema.optional(),
  specs: z.record(specScalarSchema).optional(),
}).passthrough()

export type IndianAddressInput = z.infer<typeof indianAddressSchema>
export type B2BGstDetailsInput = z.infer<typeof b2bGstDetailsSchema>
export type ElectronicsMetadataInput = z.infer<typeof electronicsMetadataSchema>

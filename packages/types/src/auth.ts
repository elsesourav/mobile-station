import { z } from 'zod'
import { indianGstinSchema, indianPhoneSchema, indianPincodeSchema } from './validations'

/**
 * Preferred Muzaffarpur dispatch/pickup hub keys for Mobile Station buyers.
 */
export type AuthPreferredHub = 'motijheel-842001' | 'club-road-842002'

/**
 * Authenticated customer profile returned to the storefront from Medusa v2 + BFF.
 */
export interface AuthCustomerUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  memberSince: string
  preferredHub: AuthPreferredHub
  pincode: string
  cityAddress?: string
  gstin?: string
  businessName?: string
}

/**
 * Customer saved shipping/billing address mapped from Medusa customer addresses.
 */
export interface AuthAddressItem {
  id: string
  name: string
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  countryCode: string
  isDefault: boolean
}

/**
 * Schema validating sign-in credentials.
 */
export const customerLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

/**
 * Schema validating 2-step customer signup payload before Medusa registration.
 */
export const customerRegisterSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  phone: indianPhoneSchema,
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
})

/**
 * Schema validating forgot-password dispatch request.
 */
export const customerPasswordResetRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
})

/**
 * Schema validating password update / reset submission.
 */
export const customerPasswordUpdateSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long.'),
  token: z.string().trim().min(1).optional(),
})

/**
 * Schema validating authenticated customer profile & B2B GSTIN settings sync.
 */
export const customerProfileUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  phone: z.union([indianPhoneSchema, z.literal('')]).optional(),
  pincode: z.union([indianPincodeSchema, z.literal('')]).optional(),
  cityAddress: z.string().trim().max(240).optional(),
  gstin: z.union([indianGstinSchema, z.literal('')]).optional(),
  businessName: z.string().trim().max(120).optional(),
  preferredHub: z.enum(['motijheel-842001', 'club-road-842002']).optional(),
})

export type CustomerLoginInput = z.infer<typeof customerLoginSchema>
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>
export type CustomerPasswordResetRequestInput = z.infer<typeof customerPasswordResetRequestSchema>
export type CustomerPasswordUpdateInput = z.infer<typeof customerPasswordUpdateSchema>
export type CustomerProfileUpdateInput = z.infer<typeof customerProfileUpdateSchema>

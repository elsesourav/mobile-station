import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import {
  customerLoginSchema,
  customerPasswordResetRequestSchema,
  customerPasswordUpdateSchema,
  customerProfileUpdateSchema,
  customerRegisterSchema,
  type AuthAddressItem,
  type AuthCustomerUser,
  type AuthPreferredHub,
} from '@mobile-station/types'
import {
  AUTH_COOKIE_NAME,
  getMedusaAuthHeaders,
  getMedusaBackendUrl,
} from '@/lib/auth-constants'

export const dynamic = 'force-dynamic'

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }
}

interface MedusaAddressPayload {
  id?: string
  address_name?: string
  first_name?: string
  last_name?: string
  phone?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  is_default_shipping?: boolean
  metadata?: { name?: string; [key: string]: unknown }
}

interface MedusaCustomerPayload {
  id?: string
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  created_at?: string
  metadata?: {
    preferredHub?: unknown
    pincode?: unknown
    cityAddress?: unknown
    gstin?: unknown
    businessName?: unknown
    [key: string]: unknown
  }
  addresses?: MedusaAddressPayload[]
}

function normalizeHub(value: unknown): AuthPreferredHub {
  return value === 'club-road-842002' ? 'club-road-842002' : 'motijheel-842001'
}

function mapMedusaCustomer(raw?: MedusaCustomerPayload | null): AuthCustomerUser {
  const createdAt = raw?.created_at
    ? new Date(raw.created_at).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })

  const meta = raw?.metadata ?? {}
  return {
    id: raw?.id || `cust_${Date.now()}`,
    email: raw?.email || '',
    firstName: raw?.first_name || raw?.email?.split('@')[0] || 'Customer',
    lastName: raw?.last_name || '',
    phone: raw?.phone || undefined,
    memberSince: createdAt,
    preferredHub: normalizeHub(meta.preferredHub),
    pincode: typeof meta.pincode === 'string' && meta.pincode ? meta.pincode : '842001',
    cityAddress: typeof meta.cityAddress === 'string' ? meta.cityAddress : undefined,
    gstin: typeof meta.gstin === 'string' ? meta.gstin : undefined,
    businessName: typeof meta.businessName === 'string' ? meta.businessName : undefined,
  }
}

function mapMedusaAddress(addr: MedusaAddressPayload): AuthAddressItem {
  return {
    id: addr.id || `addr_${Date.now()}`,
    name: addr.address_name || addr.metadata?.name || 'Delivery Address',
    fullName: [addr.first_name, addr.last_name].filter(Boolean).join(' ') || 'Customer',
    phoneNumber: addr.phone || '',
    addressLine1: addr.address_1 || '',
    addressLine2: addr.address_2 || undefined,
    city: addr.city || '',
    state: addr.province || '',
    pincode: addr.postal_code || '',
    countryCode: (addr.country_code || 'in').toLowerCase(),
    isDefault: Boolean(addr.is_default_shipping),
  }
}

async function fetchMeFromMedusa(
  baseUrl: string,
  token: string
): Promise<{ status: number; customer: AuthCustomerUser | null; addresses: AuthAddressItem[] }> {
  const res = await fetch(`${baseUrl}/store/customers/me?fields=*addresses`, {
    method: 'GET',
    headers: getMedusaAuthHeaders(token),
    cache: 'no-store',
  })

  if (!res.ok) {
    return { status: res.status, customer: null, addresses: [] }
  }

  const data = (await res.json().catch(() => ({}))) as { customer?: MedusaCustomerPayload }
  if (!data.customer) {
    return { status: 404, customer: null, addresses: [] }
  }

  const customer = mapMedusaCustomer(data.customer)
  const addresses = Array.isArray(data.customer.addresses)
    ? data.customer.addresses.map(mapMedusaAddress)
    : []

  return { status: 200, customer, addresses }
}

async function readSessionCookie(request: NextRequest): Promise<string | undefined> {
  const fromReq = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (fromReq) return fromReq
  const store = await cookies()
  return store.get(AUTH_COOKIE_NAME)?.value
}

/**
 * POST /api/auth/[...action]
 * Handles login, register, logout, profile sync, password recovery, and password update.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params
  const actionName = action.join('/').toLowerCase()
  const baseUrl = getMedusaBackendUrl()

  try {
    if (actionName === 'login') {
      const rawBody = await request.json().catch(() => ({}))
      const parsed = customerLoginSchema.safeParse(rawBody)
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: parsed.error.issues[0]?.message || 'Please enter a valid email and password.',
          },
          { status: 400 }
        )
      }

      let medusaRes: Response
      try {
        medusaRes = await fetch(`${baseUrl}/auth/customer/emailpass`, {
          method: 'POST',
          headers: getMedusaAuthHeaders(),
          body: JSON.stringify(parsed.data),
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Backend connection failed'
        return NextResponse.json(
          { success: false, error: `Unable to reach authentication service: ${msg}` },
          { status: 503 }
        )
      }

      if (!medusaRes.ok) {
        const errData = (await medusaRes.json().catch(() => ({}))) as { message?: string }
        const rawMsg = errData.message || ''
        const isCredentialFailure =
          medusaRes.status === 401 || rawMsg.toLowerCase().includes('invalid email or password')
        const normalizedStatus = isCredentialFailure ? 401 : medusaRes.status
        const message = isCredentialFailure
          ? 'Invalid email or password.'
          : rawMsg || 'Authentication failed. Please check your credentials.'
        return NextResponse.json({ success: false, error: message }, { status: normalizedStatus })
      }

      const authData = (await medusaRes.json().catch(() => ({}))) as { token?: string }
      const sessionToken = authData.token
      if (!sessionToken) {
        return NextResponse.json(
          { success: false, error: 'Authentication backend did not issue a session token.' },
          { status: 500 }
        )
      }

      let customer: AuthCustomerUser
      let addresses: AuthAddressItem[] = []
      try {
        const me = await fetchMeFromMedusa(baseUrl, sessionToken)
        customer =
          me.customer ??
          mapMedusaCustomer({
            id: `cust_${parsed.data.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            email: parsed.data.email,
          })
        addresses = me.addresses
      } catch {
        customer = mapMedusaCustomer({
          id: `cust_${parsed.data.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: parsed.data.email,
        })
      }

      const response = NextResponse.json({ success: true, customer, addresses })
      response.cookies.set(AUTH_COOKIE_NAME, sessionToken, getCookieOptions())
      return response
    }

    if (actionName === 'register') {
      const rawBody = await request.json().catch(() => ({}))
      const parsed = customerRegisterSchema.safeParse(rawBody)
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error:
              parsed.error.issues[0]?.message ||
              'Please enter valid registration details with an 8+ character password.',
          },
          { status: 400 }
        )
      }

      const { firstName, lastName, email, phone, password } = parsed.data

      let regRes: Response
      try {
        regRes = await fetch(`${baseUrl}/auth/customer/emailpass/register`, {
          method: 'POST',
          headers: getMedusaAuthHeaders(),
          body: JSON.stringify({ email, password }),
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Backend connection failed'
        return NextResponse.json(
          { success: false, error: `Unable to reach registration service: ${msg}` },
          { status: 503 }
        )
      }

      if (!regRes.ok) {
        const regErr = (await regRes.json().catch(() => ({}))) as { message?: string }
        const message =
          regRes.status === 400 || regRes.status === 401 || regRes.status === 409
            ? 'An account with this email address already exists. Please sign in instead.'
            : regErr.message || 'Registration failed. Please verify your details.'
        return NextResponse.json({ success: false, error: message }, { status: regRes.status })
      }

      const regData = (await regRes.json().catch(() => ({}))) as { token?: string }
      const identityToken = regData.token
      if (!identityToken) {
        return NextResponse.json(
          { success: false, error: 'Registration did not return an identity token.' },
          { status: 500 }
        )
      }

      let custRes: Response
      try {
        custRes = await fetch(`${baseUrl}/store/customers`, {
          method: 'POST',
          headers: getMedusaAuthHeaders(identityToken),
          body: JSON.stringify({
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            metadata: {
              preferredHub: 'motijheel-842001',
              pincode: '842001',
            },
          }),
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Customer record creation error'
        return NextResponse.json(
          { success: false, error: `Identity registered but customer creation failed: ${msg}` },
          { status: 500 }
        )
      }

      if (!custRes.ok) {
        const custErr = (await custRes.json().catch(() => ({}))) as { message?: string }
        return NextResponse.json(
          { success: false, error: custErr.message || 'Failed to create customer profile.' },
          { status: custRes.status }
        )
      }

      // Per design architecture: registration does NOT auto-login or expose credentials.
      return NextResponse.json({
        success: true,
        message: 'Account registered successfully. Please sign in.',
      })
    }

    if (actionName === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Signed out cleanly.' })
      response.cookies.set(AUTH_COOKIE_NAME, '', { ...getCookieOptions(), maxAge: 0 })
      return response
    }

    if (actionName === 'profile') {
      const token = await readSessionCookie(request)
      if (!token) {
        return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
      }

      const rawBody = await request.json().catch(() => ({}))
      const parsed = customerProfileUpdateSchema.safeParse(rawBody)
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0]?.message || 'Invalid profile input.' },
          { status: 400 }
        )
      }

      const existingRes = await fetch(`${baseUrl}/store/customers/me`, {
        method: 'GET',
        headers: getMedusaAuthHeaders(token),
        cache: 'no-store',
      }).catch(() => null)

      const existingJson = existingRes?.ok
        ? ((await existingRes.json().catch(() => ({}))) as { customer?: MedusaCustomerPayload })
        : {}
      const existingMeta = existingJson.customer?.metadata ?? {}
      const updates = parsed.data

      const nextMetadata = {
        ...existingMeta,
        ...(updates.pincode !== undefined ? { pincode: updates.pincode || '842001' } : {}),
        ...(updates.cityAddress !== undefined ? { cityAddress: updates.cityAddress } : {}),
        ...(updates.gstin !== undefined ? { gstin: updates.gstin } : {}),
        ...(updates.businessName !== undefined ? { businessName: updates.businessName } : {}),
        ...(updates.preferredHub !== undefined ? { preferredHub: updates.preferredHub } : {}),
      }

      const updatePayload: Record<string, unknown> = { metadata: nextMetadata }
      if (updates.firstName !== undefined) updatePayload.first_name = updates.firstName
      if (updates.lastName !== undefined) updatePayload.last_name = updates.lastName
      if (updates.phone !== undefined) updatePayload.phone = updates.phone

      const updateRes = await fetch(`${baseUrl}/store/customers/me?fields=*addresses`, {
        method: 'POST',
        headers: getMedusaAuthHeaders(token),
        body: JSON.stringify(updatePayload),
      })

      if (!updateRes.ok) {
        const errJson = (await updateRes.json().catch(() => ({}))) as { message?: string }
        return NextResponse.json(
          { success: false, error: errJson.message || 'Unable to save account settings.' },
          { status: updateRes.status }
        )
      }

      const updatedJson = (await updateRes.json()) as { customer?: MedusaCustomerPayload }
      return NextResponse.json({
        success: true,
        customer: mapMedusaCustomer(updatedJson.customer),
      })
    }

    if (actionName === 'request-password-reset') {
      const rawBody = await request.json().catch(() => ({}))
      const parsed = customerPasswordResetRequestSchema.safeParse(rawBody)
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        )
      }

      try {
        const res = await fetch(`${baseUrl}/auth/customer/emailpass/reset-password`, {
          method: 'POST',
          headers: getMedusaAuthHeaders(),
          body: JSON.stringify({
            identifier: parsed.data.email,
            metadata: { source: 'storefront' },
          }),
        })

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { message?: string }
          return NextResponse.json(
            { success: false, error: errData.message || 'Unable to dispatch recovery link.' },
            { status: res.status }
          )
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Connection failed'
        return NextResponse.json(
          { success: false, error: `Password recovery backend unreachable: ${msg}` },
          { status: 503 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset link has been dispatched to your email address.',
      })
    }

    if (actionName === 'reset-password') {
      const rawBody = await request.json().catch(() => ({}))
      const parsed = customerPasswordUpdateSchema.safeParse(rawBody)
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: parsed.error.issues[0]?.message || 'Password must be at least 8 characters long.',
          },
          { status: 400 }
        )
      }

      const { newPassword, token } = parsed.data
      const cookieToken = await readSessionCookie(request)

      if (token) {
        const res = await fetch(`${baseUrl}/auth/customer/emailpass/update`, {
          method: 'POST',
          headers: getMedusaAuthHeaders(token),
          body: JSON.stringify({ password: newPassword }),
        })
        if (res.ok) {
          return NextResponse.json({ success: true, message: 'Password reset successful.' })
        }
        const err = (await res.json().catch(() => ({}))) as { message?: string }
        return NextResponse.json(
          { success: false, error: err.message || 'Password reset token is invalid or expired.' },
          { status: res.status }
        )
      }

      if (cookieToken) {
        const res = await fetch(`${baseUrl}/store/customers/me/password`, {
          method: 'POST',
          headers: getMedusaAuthHeaders(cookieToken),
          body: JSON.stringify({ password: newPassword }),
        })
        if (res.ok) {
          return NextResponse.json({ success: true, message: 'Password updated successfully.' })
        }
        const err = (await res.json().catch(() => ({}))) as { message?: string }
        return NextResponse.json(
          { success: false, error: err.message || 'Failed to update password.' },
          { status: res.status }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error:
            'Missing recovery token or active session. Please open the link sent to your email.',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: `Unsupported auth action: ${actionName}` },
      { status: 404 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/**
 * GET /api/auth/[...action]
 * Validates the customer session cookie against Medusa `/store/customers/me`.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params
  const actionName = action.join('/').toLowerCase()
  const baseUrl = getMedusaBackendUrl()

  try {
    if (actionName === 'session' || actionName === 'me') {
      const token = await readSessionCookie(request)
      if (!token) {
        return NextResponse.json({
          authenticated: false,
          customer: null,
          addresses: [],
        })
      }

      try {
        const me = await fetchMeFromMedusa(baseUrl, token)
        if (!me.customer) {
          const response = NextResponse.json({
            authenticated: false,
            customer: null,
            addresses: [],
          })
          if (me.status === 401 || me.status === 404) {
            response.cookies.set(AUTH_COOKIE_NAME, '', { ...getCookieOptions(), maxAge: 0 })
          }
          return response
        }

        return NextResponse.json({
          authenticated: true,
          customer: me.customer,
          addresses: me.addresses,
        })
      } catch {
        return NextResponse.json({
          authenticated: false,
          customer: null,
          addresses: [],
        })
      }
    }

    return NextResponse.json(
      { success: false, error: `Unsupported auth action: ${actionName}` },
      { status: 404 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/auth/[...action]
 * Clears the active httpOnly customer session cookie.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params
  const actionName = action.join('/').toLowerCase()

  if (actionName === 'logout' || actionName === 'session') {
    const response = NextResponse.json({ success: true, cleared: true })
    response.cookies.set(AUTH_COOKIE_NAME, '', { ...getCookieOptions(), maxAge: 0 })
    return response
  }

  return NextResponse.json(
    { success: false, error: `Unsupported auth action: ${actionName}` },
    { status: 404 }
  )
}

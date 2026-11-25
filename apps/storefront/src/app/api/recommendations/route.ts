import { NextResponse } from 'next/server'
import {
  recommendationSignalEventSchema,
  type BackendPopularityResponse,
  type RecommendationTelemetryResponse,
} from '@mobile-station/types'

const BACKEND_URL = (
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  ''
).replace(/\/$/, '')

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

export async function GET(): Promise<NextResponse<BackendPopularityResponse>> {
  if (!BACKEND_URL) {
    return NextResponse.json({ items: [], source: 'fallback' })
  }

  try {
    const res = await fetch(`${BACKEND_URL}/store/recommendations?limit=24`, {
      headers: {
        ...(PUBLISHABLE_KEY ? { 'x-publishable-api-key': PUBLISHABLE_KEY } : {}),
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(800),
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ items: [], source: 'fallback' })
    }

    const payload = (await res.json()) as BackendPopularityResponse
    if (!Array.isArray(payload.items)) {
      return NextResponse.json({ items: [], source: 'fallback' })
    }
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ items: [], source: 'fallback' })
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<RecommendationTelemetryResponse>> {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ recorded: false, signal_type: 'view' }, { status: 400 })
  }

  const parsed = recommendationSignalEventSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ recorded: false, signal_type: 'view' }, { status: 400 })
  }

  if (!BACKEND_URL) {
    return NextResponse.json({ recorded: true, signal_type: parsed.data.signal_type })
  }

  try {
    await fetch(`${BACKEND_URL}/store/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(PUBLISHABLE_KEY ? { 'x-publishable-api-key': PUBLISHABLE_KEY } : {}),
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(800),
    })
  } catch {
    // Non-fatal: client session profile remains source of instant recommendations
  }

  return NextResponse.json({ recorded: true, signal_type: parsed.data.signal_type })
}

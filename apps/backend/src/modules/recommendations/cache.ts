import Redis from 'ioredis'
import type { BackendPopularityEntry, RecommendationSignalType } from '@mobile-station/types'

const POPULARITY_ZSET_KEY = 'ms:recs:popular_scores'
const COVIEW_KEY_PREFIX = 'ms:recs:coview:'

const SIGNAL_SCORE_DELTAS: Record<RecommendationSignalType, number> = {
  view: 1,
  category_browse: 0.5,
  search: 1.5,
  cart_add: 3,
  purchase: 6,
}

let sharedRecRedis: Redis | null = null

function getRecommendationRedis(): Redis | null {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl || process.env.NODE_ENV === 'test') {
    return null
  }
  if (!sharedRecRedis) {
    try {
      sharedRecRedis = new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
      })
      sharedRecRedis.on('error', () => {
        // Fail open when Redis is offline; storefront falls back cleanly to catalog scoring
      })
    } catch {
      return null
    }
  }
  return sharedRecRedis
}

export async function recordRecommendationSignal(params: {
  productHandle?: string
  signalType: RecommendationSignalType
}): Promise<boolean> {
  const client = getRecommendationRedis()
  if (!client || !params.productHandle) return false

  const incrementBy = SIGNAL_SCORE_DELTAS[params.signalType] ?? 1
  try {
    await client.zincrby(POPULARITY_ZSET_KEY, incrementBy, params.productHandle)
    await client.expire(POPULARITY_ZSET_KEY, 60 * 60 * 24 * 14)
    return true
  } catch {
    return false
  }
}

export async function getTopPopularitySignals(
  limit = 20
): Promise<{ items: BackendPopularityEntry[]; source: 'redis' | 'fallback' }> {
  const client = getRecommendationRedis()
  if (!client) {
    return { items: [], source: 'fallback' }
  }

  try {
    const raw = await client.zrevrange(POPULARITY_ZSET_KEY, 0, Math.max(0, limit - 1), 'WITHSCORES')
    const items: BackendPopularityEntry[] = []
    for (let i = 0; i < raw.length; i += 2) {
      const handle = raw[i]
      const score = Number.parseFloat(raw[i + 1] ?? '0')
      if (handle && Number.isFinite(score)) {
        items.push({ handle, score })
      }
    }
    return { items, source: 'redis' }
  } catch {
    return { items: [], source: 'fallback' }
  }
}

export async function recordCoViewPair(anchorHandle: string, targetHandle: string): Promise<void> {
  const client = getRecommendationRedis()
  if (!client || !anchorHandle || !targetHandle || anchorHandle === targetHandle) return
  try {
    const key = `${COVIEW_KEY_PREFIX}${anchorHandle}`
    await client.zincrby(key, 1, targetHandle)
    await client.expire(key, 60 * 60 * 24 * 14)
  } catch {
    // Non-fatal telemetry write
  }
}

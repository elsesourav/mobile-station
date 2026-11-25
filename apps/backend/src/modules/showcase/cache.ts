import Redis from 'ioredis'
import type { ShowcaseRateLimitStatus } from '../../types/showcase-backend'

const CACHE_PREFIX = 'ms:showcase:'

let sharedRedis: Redis | null = null

function getRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl || process.env.NODE_ENV === 'test') {
    return null
  }
  if (!sharedRedis) {
    try {
      sharedRedis = new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 2500,
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
      })
      sharedRedis.on('error', () => {
        // Fail open when Redis is unreachable; PostgreSQL remains source of truth
      })
    } catch {
      return null
    }
  }
  return sharedRedis
}

export async function getCachedShowcasePayload<T>(cacheKey: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null
  try {
    const rawPayload = await client.get(`${CACHE_PREFIX}${cacheKey}`)
    return rawPayload ? (JSON.parse(rawPayload) as T) : null
  } catch {
    return null
  }
}

export async function setCachedShowcasePayload<T>(
  cacheKey: string,
  payload: T,
  ttlSeconds = 60
): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false
  try {
    await client.set(`${CACHE_PREFIX}${cacheKey}`, JSON.stringify(payload), 'EX', ttlSeconds)
    return true
  } catch {
    return false
  }
}

export async function invalidateShowcaseCache(): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0
  let clearedCount = 0
  try {
    let cursor = '0'
    do {
      const [nextCursor, keys] = await client.scan(
        cursor,
        'MATCH',
        `${CACHE_PREFIX}*`,
        'COUNT',
        100
      )
      cursor = nextCursor
      if (keys.length > 0) {
        clearedCount += await client.del(...keys)
      }
    } while (cursor !== '0')
  } catch {
    // Non-fatal cache invalidation
  }
  return clearedCount
}

export async function checkPublicSubmissionRateLimit(
  clientIp: string,
  maxPerWindow = 5,
  windowSeconds = 3600
): Promise<ShowcaseRateLimitStatus> {
  const client = getRedisClient()
  if (!client) return { allowed: true, remaining: maxPerWindow }

  const key = `ms:ratelimit:feedback:${clientIp || 'unknown'}`
  try {
    const count = await client.incr(key)
    if (count === 1) {
      await client.expire(key, windowSeconds)
    }
    return {
      allowed: count <= maxPerWindow,
      remaining: Math.max(0, maxPerWindow - count),
    }
  } catch {
    return { allowed: true, remaining: maxPerWindow }
  }
}

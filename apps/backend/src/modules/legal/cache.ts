import Redis from 'ioredis'

const CACHE_PREFIX = 'ms:legal:'

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

export async function getCachedLegalPayload<T>(cacheKey: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null
  try {
    const rawPayload = await client.get(`${CACHE_PREFIX}${cacheKey}`)
    return rawPayload ? (JSON.parse(rawPayload) as T) : null
  } catch {
    return null
  }
}

export async function setCachedLegalPayload<T>(
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

export async function invalidateLegalCache(): Promise<number> {
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

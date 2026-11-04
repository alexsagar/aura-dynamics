import { getCloudflareContext } from '@opennextjs/cloudflare'
import { APIError, type CollectionBeforeOperationHook } from 'payload'

/**
 * Per-client limits using Workers Rate Limiting bindings from the Wrangler
 * config, keyed on the client IP Cloudflare reports (`cf-connecting-ip`).
 *
 * ponytail: fails open when the binding is absent (local dev, environments
 * without the binding); add a per-phone/email key if abuse shifts to rotating IPs.
 */
async function rateLimited(binding: 'CHECKOUT_RATE_LIMITER' | 'LOGIN_RATE_LIMITER', headers: Headers): Promise<boolean> {
  let limiter: RateLimit | undefined
  try {
    const { env } = await getCloudflareContext({ async: true })
    limiter = (env as unknown as Record<string, RateLimit | undefined>)[binding]
  } catch {
    return false
  }
  if (!limiter) return false
  const key = headers.get('cf-connecting-ip') ?? 'unknown'
  const { success } = await limiter.limit({ key })
  return !success
}

/** Unauthenticated COD orders reserve real stock: bound how fast one client can drain it. */
export const checkoutRateLimited = (req: Request) => rateLimited('CHECKOUT_RATE_LIMITER', req.headers)

/**
 * Login / forgot-password throttle per IP, checked before Payload looks at the
 * account. Slows password guessing and stops one client cheaply locking many
 * accounts via maxLoginAttempts. Generous limit because Nepali mobile networks
 * put many users behind one CGNAT address. Covers REST and GraphQL (both run
 * these operations); keyed on Cloudflare's own cf-connecting-ip, which clients
 * cannot override. A request without it shares one 'unknown' bucket rather
 * than skipping the limit. Workers rate limits are approximate and per location.
 */
const LIMITED_AUTH_OPERATIONS = new Set(['login', 'forgotPassword', 'resetPassword'])
export const authRateLimit: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if (!LIMITED_AUTH_OPERATIONS.has(operation) || req.payloadAPI === 'local') return args
  if (await rateLimited('LOGIN_RATE_LIMITER', req.headers ?? new Headers())) {
    throw new APIError('Too many attempts. Please wait a minute and try again.', 429)
  }
  return args
}

/** Explicit account lockout (Payload's defaults, pinned so an upgrade cannot silently change them). */
export const AUTH_LOCKOUT = { maxLoginAttempts: 5, lockTime: 10 * 60 * 1000 } as const

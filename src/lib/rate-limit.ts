import { getCloudflareContext } from '@opennextjs/cloudflare'

/**
 * Per-client checkout limit using the Workers Rate Limiting binding
 * (`CHECKOUT_RATE_LIMITER` in the Wrangler config). Unauthenticated COD orders
 * reserve real stock, so this bounds how fast one client can drain inventory.
 *
 * ponytail: fails open when the binding is absent (local dev, environments
 * without the binding) and keys on the client IP; add a per-phone/email key
 * if abuse shifts to rotating IPs.
 */
export async function checkoutRateLimited(req: Request): Promise<boolean> {
  let limiter: RateLimit | undefined
  try {
    const { env } = await getCloudflareContext({ async: true })
    limiter = (env as unknown as { CHECKOUT_RATE_LIMITER?: RateLimit }).CHECKOUT_RATE_LIMITER
  } catch {
    return false
  }
  if (!limiter) return false
  const key = req.headers.get('cf-connecting-ip') ?? 'unknown'
  const { success } = await limiter.limit({ key })
  return !success
}

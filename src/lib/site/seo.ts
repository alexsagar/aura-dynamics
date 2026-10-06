/**
 * Canonical site origin for absolute URLs (canonical tags, Open Graph,
 * sitemap, structured data).
 *
 * Driven by env so the real production domain is supplied at launch rather
 * than hardcoded here. `NEXT_PUBLIC_SITE_URL` is the single knob; it falls back
 * to localhost for development. Set it before go-live — see DEFINITION OF DONE.
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')

export const SITE_NAME = 'Aura'

/** Join a site-relative path onto the configured origin. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

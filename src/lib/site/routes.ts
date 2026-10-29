/**
 * Storefront routes retired when Aura narrowed to filaments. Their CMS links
 * (nav, footer, homepage cards) are kept in Payload but dropped at render, so
 * an editor's value is never overwritten and no link points at a 404.
 */
export const RETIRED_PATHS = ['/3d-prints', '/collections'] as const

export function isRetiredUrl(url: string | null | undefined): boolean {
  if (!url) return false
  const path = url.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0].replace(/\/$/, '')
  return RETIRED_PATHS.some((r) => path === r || path.startsWith(r + '/'))
}

import type { Media } from '@/payload-types'

/**
 * Resolves a Payload upload relationship (id, populated doc, or null) to a
 * usable URL. Works the same for local dev and R2-backed Media — both put
 * the servable URL on `media.url`.
 */
export function mediaUrl(media: number | Media | null | undefined): string | undefined {
  if (media && typeof media === 'object') return media.url ?? undefined
  return undefined
}

export function mediaAlt(media: number | Media | null | undefined, fallback: string): string {
  if (media && typeof media === 'object' && media.alt) return media.alt
  return fallback
}

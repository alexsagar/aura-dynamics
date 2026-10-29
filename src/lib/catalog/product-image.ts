import type { Media } from '@/payload-types'
import { mediaUrl } from '@/lib/payload-media'

// The single product-image resolver for every card/gallery context. Pure and
// client-safe. Upload relationships may arrive populated, as bare IDs (depth
// too shallow) or null — only populated Media with a URL counts as an image.

type MediaRef = number | Media | null | undefined
type WithImages = { images?: MediaRef[] | null } | null | undefined
type VariantLike = { images?: MediaRef[] | null; inventory?: number | null; active?: boolean | null }

/** First usable URL in an upload list. */
export function firstMediaUrl(images: MediaRef[] | null | undefined): string | undefined {
  for (const m of images ?? []) {
    const url = mediaUrl(m)
    if (url) return url
  }
  return undefined
}

/**
 * Priority: product gallery → selected/default variant → first in-stock
 * variant → any variant. `undefined` means render the "Image coming soon"
 * placeholder.
 */
export function resolveProductImage(
  product: WithImages,
  variants: VariantLike[] = [],
  selected?: VariantLike | null,
): string | undefined {
  const usable = variants.filter((v) => v.active !== false)
  return (
    firstMediaUrl(product?.images) ??
    firstMediaUrl(selected?.images) ??
    firstMediaUrl(usable.find((v) => (v.inventory ?? 0) > 0 && firstMediaUrl(v.images))?.images) ??
    firstMediaUrl(usable.find((v) => firstMediaUrl(v.images))?.images)
  )
}

import type { FilamentCardProduct, PrintCardProduct } from '@/components/storefront/types'
import type { Product } from '@/payload-types'
import { toFilamentCard, toPrintCard } from '@/lib/homepage/product-cards'

export type RelatedCard =
  | { card: FilamentCardProduct; type: 'filament' }
  | { card: PrintCardProduct; type: '3d-print' }

/**
 * Real "You may also like" products for a product detail page: published
 * products of the same type, excluding the current one, that can render as a
 * real card (they have photography and a price). No mock/demo data — if nothing
 * qualifies the caller simply renders nothing.
 */
export async function getRelatedProducts(
  currentSlug: string,
  productType: 'filament' | '3d-print',
  limit = 4,
): Promise<RelatedCard[]> {
  try {
    const { getPayload } = await import('payload')
    const configPromise = (await import('@/payload.config')).default
    const payload = await getPayload({ config: configPromise })

    const { docs } = await payload.find({
      collection: 'products',
      where: {
        and: [
          { productType: { equals: productType } },
          { _status: { equals: 'published' } },
          { slug: { not_equals: currentSlug } },
        ],
      },
      depth: 2,
      limit: 12,
      pagination: false,
      joins: { variants: { limit: 100 } },
      overrideAccess: false,
    })

    const related: RelatedCard[] = []
    for (const product of docs as Product[]) {
      if (related.length >= limit) break
      if (productType === 'filament') {
        const card = toFilamentCard(product)
        if (card) related.push({ card, type: 'filament' })
      } else {
        const card = toPrintCard(product)
        if (card) related.push({ card, type: '3d-print' })
      }
    }
    return related
  } catch (error) {
    console.error('Failed to load related products', error)
    return []
  }
}

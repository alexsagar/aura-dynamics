import type { FilamentCardProduct, PrintCardProduct } from '@/components/storefront/types'
import type { Product, Variant, VariantOption } from '@/payload-types'
import { toFilamentCard, toPrintCard } from '@/lib/homepage/product-cards'
import { publicProductWhere } from '@/access/ecommerce'

export type RelatedCard =
  | { card: FilamentCardProduct; type: 'filament' }
  | { card: PrintCardProduct; type: '3d-print' }

const idOf = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : undefined

/** Material + category ids a product is associated with (filament material, variant option materials, print category). */
function affinity(p: Product): Set<string> {
  const out = new Set<string>()
  const mat = idOf(p.filamentDetails?.material)
  if (mat) out.add(`m${mat}`)
  const cat = idOf(p.category)
  if (cat) out.add(`c${cat}`)
  for (const v of p.variants?.docs ?? []) {
    if (!v || typeof v !== 'object') continue
    for (const o of (v as Variant).options ?? []) {
      const m = idOf((o as VariantOption)?.material)
      if (m) out.add(`m${m}`)
    }
  }
  return out
}

/**
 * Pure ranking for "You may also like": manual picks (in editor order) →
 * same product type → shared material/category → any other product. Excludes
 * the current product and duplicates.
 */
export function rankRelated(current: Product, candidates: Product[]): Product[] {
  const manual = (current.relatedProducts ?? []).map(idOf).filter((id): id is number => id != null)
  const mine = affinity(current)
  const score = (p: Product) => {
    const m = manual.indexOf(p.id)
    if (m >= 0) return m
    const shared = [...affinity(p)].some((k) => mine.has(k))
    return 100 + (p.productType === current.productType ? 0 : 20) + (shared ? 0 : 10)
  }
  const seen = new Set<number>([current.id])
  return candidates
    .filter((p) => !seen.has(p.id) && seen.add(p.id))
    .map((p, i) => ({ p, i, s: score(p) }))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map(({ p }) => p)
}

/** Cards for sellable products only: priced and not entirely out of stock. */
export function toRelatedCard(p: Product): RelatedCard | null {
  if (p.productType === 'filament') {
    const card = toFilamentCard(p)
    return card && card.stock !== 'out' ? { card, type: 'filament' } : null
  }
  const card = toPrintCard(p)
  return card && card.stock !== 'out' ? { card, type: '3d-print' } : null
}

/** Up to `limit` real recommendations for a product page; empty when none qualify. */
export async function getRelatedProducts(current: Product, limit = 4): Promise<RelatedCard[]> {
  try {
    const { getPayload } = await import('payload')
    const configPromise = (await import('@/payload.config')).default
    const payload = await getPayload({ config: configPromise })

    // ponytail: small catalogue → one query, ranked in memory. Add a
    // type/material pre-filter here if the catalogue grows past ~100.
    const { docs } = await payload.find({
      collection: 'products',
      where: { and: [publicProductWhere, { id: { not_equals: current.id } }] },
      depth: 2, // variants join → variant images populated for card photos
      limit: 100,
      pagination: false,
      joins: { variants: { limit: 100 } },
      overrideAccess: false,
    })

    const related: RelatedCard[] = []
    for (const p of rankRelated(current, docs as Product[])) {
      const card = toRelatedCard(p)
      if (card) related.push(card)
      if (related.length >= limit) break
    }
    return related
  } catch (error) {
    console.error('Failed to load related products', error)
    return []
  }
}

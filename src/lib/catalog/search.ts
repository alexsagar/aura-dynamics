import type { Material, Product, Variant, VariantOption } from '@/payload-types'
import { isPopulated, productHref } from '@/lib/catalog/shared'
import { mediaUrl } from '@/lib/payload-media'

export type SearchResult = {
  slug: string
  href: string
  title: string
  type: 'filament' | '3d-print'
  typeLabel: string
  imageUrl?: string
  price?: number
  fromPrice: boolean
  meta: string
}

/** Product-type synonyms so a search for "filament(s)" or "print(s)" works. */
const TYPE_TERMS: Record<Product['productType'], string[]> = {
  filament: ['filament', 'filaments', 'spool', 'spools'],
  '3d-print': ['3d print', '3d prints', '3d-print', 'print', 'prints', 'printed', 'model', 'figure'],
}

function activeVariants(product: Product): Variant[] {
  return (product.variants?.docs ?? []).filter(isPopulated<Variant>).filter((v) => v.active !== false)
}

function priceInfo(product: Product, variants: Variant[]): { price?: number; fromPrice: boolean } {
  const prices = variants
    .filter((v) => v.priceInNPREnabled && typeof v.priceInNPR === 'number')
    .map((v) => v.priceInNPR as number)
  if (prices.length) return { price: Math.min(...prices), fromPrice: prices.length > 1 }
  if (product.priceInNPREnabled && typeof product.priceInNPR === 'number') {
    return { price: product.priceInNPR, fromPrice: false }
  }
  return { fromPrice: false }
}

/** All lower-cased strings a product can be matched against. */
function haystack(product: Product, variants: Variant[]): string {
  const parts: string[] = [product.title, product.slug, product.shortDescription ?? '']
  parts.push(...TYPE_TERMS[product.productType])

  if (isPopulated<Material>(product.filamentDetails?.material)) parts.push(product.filamentDetails.material.name)
  if (product.filamentDetails?.finish) parts.push(product.filamentDetails.finish)
  if (isPopulated(product.category)) parts.push(product.category.name)

  for (const v of variants) {
    for (const option of v.options ?? []) {
      if (!isPopulated<VariantOption>(option)) continue
      if (option.label) parts.push(option.label)
      if (option.value) parts.push(option.value)
      if (option.colorFamily) parts.push(option.colorFamily)
      if (isPopulated<Material>(option.material)) parts.push(option.material.name)
    }
  }
  return parts.join(' \u0001 ').toLowerCase()
}

/** Normalise a query to lower-case, whitespace-collapsed tokens. */
export function searchTokens(query: string): string[] {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!normalized) return []
  return normalized.split(' ').filter(Boolean)
}

/**
 * Pure match predicate: a product (represented by its lower-cased searchable
 * text) matches when every query token is a substring of that text. Exported
 * for unit testing without a Payload instance.
 */
export function matchesSearch(searchableText: string, query: string): boolean {
  const tokens = searchTokens(query)
  if (!tokens.length) return false
  const text = searchableText.toLowerCase()
  return tokens.every((t) => text.includes(t))
}

function metaLabel(product: Product): string {
  if (product.productType === 'filament') {
    if (isPopulated<Material>(product.filamentDetails?.material)) return product.filamentDetails.material.name
    return 'Filament'
  }
  if (isPopulated(product.category)) return product.category.name
  return '3D Print'
}

/**
 * Case-insensitive, whitespace-tolerant product search over the published
 * catalogue. A product matches when every whitespace-separated token in the
 * query appears somewhere in its searchable text (title, summary, material,
 * category, finish, variant colour/material labels, or product-type synonyms).
 * Small catalogue → fetched once and filtered in memory, mirroring the catalog
 * data layer.
 */
export async function searchProducts(query: string): Promise<SearchResult[]> {
  const tokens = searchTokens(query)
  if (!tokens.length) return []

  try {
    const { getPayload } = await import('payload')
    const configPromise = (await import('@/payload.config')).default
    const payload = await getPayload({ config: configPromise })

    const { docs } = await payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      depth: 2,
      limit: 200,
      pagination: false,
      joins: { variants: { limit: 100 } },
      overrideAccess: false,
    })

    const results: SearchResult[] = []
    for (const product of docs as Product[]) {
      const variants = activeVariants(product)
      const text = haystack(product, variants)
      if (!tokens.every((t) => text.includes(t.toLowerCase()))) continue

      const { price, fromPrice } = priceInfo(product, variants)
      const type = product.productType === '3d-print' ? '3d-print' : 'filament'
      results.push({
        slug: product.slug,
        href: productHref(product.slug),
        title: product.title,
        type,
        typeLabel: type === 'filament' ? 'Filament' : '3D Print',
        imageUrl: mediaUrl(product.images?.[0]),
        price,
        fromPrice,
        meta: metaLabel(product),
      })
    }

    // Featured first, then alphabetical — stable and predictable.
    return results.sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    console.error('Product search failed', error)
    return []
  }
}

import type { PrintCardProduct } from '@/components/storefront/types'
import type { Category, Material, Product, Variant, VariantOption } from '@/payload-types'
import { compareCatalog, csv, deriveStock, isPopulated, num, paginate, SORT_KEYS } from '@/lib/catalog/shared'
import { mediaUrl } from '@/lib/payload-media'

import type { SortKey } from '@/lib/filaments/sort-options'

export { SORT_OPTIONS } from '@/lib/filaments/sort-options'
export type { SortKey } from '@/lib/filaments/sort-options'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PrintFilters = {
  categories: string[] // category slugs
  materials: string[] // variant material slugs
  min?: number
  max?: number
  inStockOnly: boolean
  q: string
  sort: SortKey
  page: number
}

export type Facet = { count: number; label: string; value: string }

export type PrintFacets = {
  categories: Facet[]
  materials: Facet[]
  priceMax: number
  priceMin: number
}

export type PrintCatalogResult = {
  cards: PrintCardProduct[]
  /** Total published 3D-print products before filters — tells an empty catalogue from empty results. */
  catalogTotal: number
  facets: PrintFacets
  page: number
  pageCount: number
  pageSize: number
  total: number
}

export const PAGE_SIZE = 12

// ---------------------------------------------------------------------------
// Normalisation — flatten populated Payload docs into a filterable shape.
// For 3D prints, material lives on the VARIANT (a Material variant option),
// not on a product-level field like filaments.
// ---------------------------------------------------------------------------

export type NPrintVariant = {
  inventory: number
  lowStock: number
  materialLabel?: string
  materialSlug?: string
  price: number | null
}

export type NPrintProduct = {
  /** Every material this product is offered in — shown on the card regardless of filters. */
  allMaterials: string[]
  categoryName?: string
  categorySlug?: string
  createdAt: number
  featured: boolean
  imageUrl?: string
  slug: string
  title: string
  variants: NPrintVariant[]
}

function normalizeVariant(variant: Variant): NPrintVariant {
  const nv: NPrintVariant = {
    inventory: variant.inventory ?? 0,
    lowStock: variant.lowStockThreshold ?? 3,
    price: variant.priceInNPREnabled && typeof variant.priceInNPR === 'number' ? variant.priceInNPR : null,
  }
  for (const option of variant.options ?? []) {
    if (!isPopulated<VariantOption>(option)) continue
    // A material variant option carries the canonical Material relationship.
    if (isPopulated<Material>(option.material)) {
      nv.materialSlug = option.material.slug
      nv.materialLabel = option.label || option.material.name
    }
  }
  return nv
}

function normalizeProduct(product: Product, variantDocs: Variant[]): NPrintProduct {
  const activeVariants = variantDocs.filter((v) => v.active !== false)
  const variants: NPrintVariant[] = product.enableVariants && activeVariants.length
    ? activeVariants.map(normalizeVariant)
    : [
        {
          inventory: product.inventory ?? 0,
          lowStock: 3,
          price: product.priceInNPREnabled && typeof product.priceInNPR === 'number' ? product.priceInNPR : null,
        },
      ]

  const allMaterials: string[] = []
  const seen = new Set<string>()
  for (const v of variants) {
    if (v.materialLabel && !seen.has(v.materialLabel)) {
      seen.add(v.materialLabel)
      allMaterials.push(v.materialLabel)
    }
  }

  const category = isPopulated<Category>(product.category) ? product.category : null

  return {
    allMaterials,
    categoryName: category?.name,
    categorySlug: category?.slug,
    createdAt: Date.parse(product.createdAt) || 0,
    featured: Boolean(product.featured),
    imageUrl: mediaUrl(product.images?.[0]),
    slug: product.slug,
    title: product.title,
    variants,
  }
}

// ---------------------------------------------------------------------------
// Variant-aware matching — a product matches variant-level filters only when a
// SINGLE variant satisfies material + price + stock at once.
// ---------------------------------------------------------------------------

/** Variants of one product that satisfy the variant-level filters. */
export function matchingVariants(np: NPrintProduct, f: PrintFilters): NPrintVariant[] {
  return np.variants.filter((v) => {
    if (v.price == null) return false
    if (f.materials.length && !(v.materialSlug && f.materials.includes(v.materialSlug))) return false
    if (f.min != null && v.price < f.min) return false
    if (f.max != null && v.price > f.max) return false
    if (f.inStockOnly && v.inventory <= 0) return false
    return true
  })
}

/** Product-level filters that don't depend on a specific variant. */
function matchesProductLevel(np: NPrintProduct, f: PrintFilters): boolean {
  if (f.categories.length && !(np.categorySlug && f.categories.includes(np.categorySlug))) return false
  if (f.q) {
    const q = f.q.toLowerCase()
    const inTitle = np.title.toLowerCase().includes(q)
    const inCategory = (np.categoryName ?? '').toLowerCase().includes(q)
    const inMaterial = np.allMaterials.some((m) => m.toLowerCase().includes(q))
    if (!inTitle && !inCategory && !inMaterial) return false
  }
  return true
}

function buildCard(np: NPrintProduct, matching: NPrintVariant[]): PrintCardProduct {
  const prices = matching.map((v) => v.price as number)
  const price = Math.min(...prices)
  const totalInventory = matching.reduce((sum, v) => sum + v.inventory, 0)
  const lowest = Math.min(...matching.map((v) => v.lowStock))
  const stock = deriveStock(totalInventory, lowest)
  return {
    category: np.categoryName || '',
    fromPrice: matching.length > 1,
    href: `/product/${np.slug}`,
    imageUrl: np.imageUrl,
    materials: np.allMaterials,
    price,
    stock: stock.state,
    stockLeft: stock.left,
    title: np.title,
  }
}

// ---------------------------------------------------------------------------
// Facets — from the whole (unfiltered) catalogue so the sidebar only ever
// offers options backed by a real product.
// ---------------------------------------------------------------------------

function buildFacets(products: NPrintProduct[]): PrintFacets {
  const categories = new Map<string, Facet>()
  const materials = new Map<string, Facet>()
  let priceMin = Infinity
  let priceMax = 0

  for (const np of products) {
    if (np.categorySlug) {
      const f = categories.get(np.categorySlug) ?? { count: 0, label: np.categoryName || np.categorySlug, value: np.categorySlug }
      f.count++
      categories.set(np.categorySlug, f)
    }
    const seenMaterial = new Set<string>()
    for (const v of np.variants) {
      if (typeof v.price === 'number') {
        priceMin = Math.min(priceMin, v.price)
        priceMax = Math.max(priceMax, v.price)
      }
      if (v.materialSlug && !seenMaterial.has(v.materialSlug)) {
        seenMaterial.add(v.materialSlug)
        const f = materials.get(v.materialSlug) ?? { count: 0, label: v.materialLabel || v.materialSlug, value: v.materialSlug }
        f.count++
        materials.set(v.materialSlug, f)
      }
    }
  }

  const byLabel = (a: Facet, b: Facet) => a.label.localeCompare(b.label)
  return {
    categories: [...categories.values()].sort(byLabel),
    materials: [...materials.values()].sort(byLabel),
    priceMax: priceMax || 0,
    priceMin: priceMin === Infinity ? 0 : priceMin,
  }
}

// ---------------------------------------------------------------------------
// Query + assemble
// ---------------------------------------------------------------------------

async function fetchPrintProducts(): Promise<NPrintProduct[]> {
  // Lazy import so the pure helpers stay importable in tests without pulling in
  // payload.config (which runs wrangler at module load).
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const payload = await getPayload({ config: configPromise })

  const { docs: productDocs } = await payload.find({
    collection: 'products',
    where: { and: [{ productType: { equals: '3d-print' } }, { _status: { equals: 'published' } }] },
    depth: 1, // category + images populated; variants fetched separately below.
    limit: 200,
    pagination: false,
    overrideAccess: false,
  })
  const products = productDocs as Product[]
  if (!products.length) return []

  // Fetch variants directly: the products→variants join does NOT cascade depth
  // to option.material (a print's material is a relationship two levels deep),
  // so a direct variants query at depth 2 is the only way to resolve it.
  const { docs: variantDocs } = await payload.find({
    collection: 'variants',
    where: {
      and: [{ product: { in: products.map((p) => p.id) } }, { _status: { equals: 'published' } }],
    },
    depth: 2, // variant → option → option.material
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  })

  const byProduct = new Map<number, Variant[]>()
  for (const v of variantDocs as Variant[]) {
    const pid = isPopulated<Product>(v.product) ? v.product.id : v.product
    const list = byProduct.get(pid) ?? []
    list.push(v)
    byProduct.set(pid, list)
  }

  return products.map((p) => normalizeProduct(p, byProduct.get(p.id) ?? []))
}

// ponytail: whole (small) print catalogue fetched once and filtered in memory —
// variant-combination matching can't be a product-level Payload `where`. Move to
// a denormalised index if the catalogue grows past a few hundred products.
export async function getPrintCatalog(f: PrintFilters): Promise<PrintCatalogResult> {
  let products: NPrintProduct[]
  try {
    products = await fetchPrintProducts()
  } catch (error) {
    console.error('Failed to load 3D print products from Payload', error)
    products = []
  }

  const facets = buildFacets(products)

  const built = products
    .filter((np) => matchesProductLevel(np, f))
    .map((np) => ({ np, matching: matchingVariants(np, f) }))
    .filter((x) => x.matching.length > 0)
    .map((x) => ({ card: buildCard(x.np, x.matching), np: x.np, sortPrice: Math.min(...x.matching.map((v) => v.price as number)) }))

  built.sort((a, b) =>
    compareCatalog(f.sort, { ...a.np, sortPrice: a.sortPrice }, { ...b.np, sortPrice: b.sortPrice }),
  )

  const { page, pageCount, slice, total } = paginate(built, f.page, PAGE_SIZE)
  const cards = slice.map((x) => x.card)

  return { cards, catalogTotal: products.length, facets, page, pageCount, pageSize: PAGE_SIZE, total }
}

// ---------------------------------------------------------------------------
// searchParams <-> filters
// ---------------------------------------------------------------------------

type SearchParams = Record<string, string | string[] | undefined>

export function parseFilters(sp: SearchParams): PrintFilters {
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort
  return {
    categories: csv(sp.category),
    inStockOnly: (Array.isArray(sp.availability) ? sp.availability[0] : sp.availability) === 'in',
    materials: csv(sp.material),
    max: num(sp.max),
    min: num(sp.min),
    page: Math.max(1, Math.trunc(num(sp.page) ?? 1)),
    q: (Array.isArray(sp.q) ? sp.q[0] : sp.q ?? '').trim(),
    sort: sortRaw && SORT_KEYS.has(sortRaw as SortKey) ? (sortRaw as SortKey) : 'featured',
  }
}

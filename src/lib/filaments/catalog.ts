import type { FilamentCardProduct, FilamentColor } from '@/components/storefront/types'
import type { Material, Product, Variant, VariantOption } from '@/payload-types'
import { compareCatalog, csv, deriveStock, isPopulated, num, paginate, SORT_KEYS } from '@/lib/catalog/shared'
import { mediaUrl } from '@/lib/payload-media'

import type { SortKey } from './sort-options'

export { SORT_OPTIONS } from './sort-options'
export type { SortKey } from './sort-options'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FilamentFilters = {
  materials: string[] // material slugs
  colors: string[] // variant option values
  packaging: string[] // 'full-spool' | 'refill'
  finishes: string[]
  min?: number
  max?: number
  inStockOnly: boolean
  q: string
  sort: SortKey
  page: number
}

export type Facet = { count: number; label: string; value: string }
export type ColorFacet = Facet & { hex: string }

export type CatalogFacets = {
  colors: ColorFacet[]
  finishes: Facet[]
  materials: Facet[]
  packaging: Facet[]
  priceMax: number
  priceMin: number
}

export type CatalogResult = {
  cards: FilamentCardProduct[]
  /** Total published filament products before filters — distinguishes an empty catalogue from empty results. */
  catalogTotal: number
  facets: CatalogFacets
  page: number
  pageCount: number
  pageSize: number
  total: number
}

export const PAGE_SIZE = 12

// ---------------------------------------------------------------------------
// Normalisation — turn populated Payload docs into a flat, filterable shape.
// ---------------------------------------------------------------------------

const PACKAGING_VALUES = new Set(['full-spool', 'refill'])
const PACKAGING_LABELS: Record<string, string> = { 'full-spool': 'Full Spool', refill: 'Refill' }
const FINISH_LABELS: Record<string, string> = {
  basic: 'Basic', matte: 'Matte', silk: 'Silk', glossy: 'Glossy', metallic: 'Metallic',
  transparent: 'Transparent', translucent: 'Translucent', sparkle: 'Sparkle', marble: 'Marble',
  gradient: 'Gradient', 'dual-color': 'Dual Color', 'tri-color': 'Tri Color', glow: 'Glow',
  wood: 'Wood', other: 'Other',
}
const COLOR_FALLBACK_HEX: Record<string, string> = {
  black: '#1A1A1A', white: '#F5F5F5', gray: '#9AA0A8', red: '#C0392B', orange: '#E8842D',
  yellow: '#E8C33D', green: '#36AD60', blue: '#2D6CDF', purple: '#6E4AA8', pink: '#E86AA8',
  brown: '#8B5E3C', beige: '#D8C3A5', gold: '#C9A227', silver: '#C0C5CE', transparent: '#E9EEF0',
  multicolor: '#999999', other: '#999999',
}

export type NVariant = {
  colorHex?: string
  colorLabel?: string
  colorValue?: string
  imageUrl?: string
  inventory: number
  lowStock: number
  packaging?: string
  price: number | null
}

export type NProduct = {
  allColors: FilamentColor[]
  createdAt: number
  featured: boolean
  finish?: string
  finishLabel?: string
  imageUrl?: string
  materialName?: string
  materialSlug?: string
  slug: string
  title: string
  variants: NVariant[]
  weight?: string
}

function normalizeVariant(variant: Variant): NVariant {
  const nv: NVariant = {
    imageUrl: mediaUrl(variant.images?.[0]),
    inventory: variant.inventory ?? 0,
    lowStock: variant.lowStockThreshold ?? 3,
    price: variant.priceInNPREnabled && typeof variant.priceInNPR === 'number' ? variant.priceInNPR : null,
  }
  for (const option of variant.options ?? []) {
    if (!isPopulated<VariantOption>(option)) continue
    if (PACKAGING_VALUES.has(option.value)) {
      nv.packaging = option.value
    } else if (option.colorFamily || option.hexColor) {
      nv.colorValue = option.value
      nv.colorLabel = option.label
      nv.colorHex = option.hexColor || COLOR_FALLBACK_HEX[option.colorFamily ?? 'other'] || '#999999'
    }
  }
  return nv
}

function normalizeProduct(product: Product): NProduct {
  const variantDocs = (product.variants?.docs ?? []).filter(isPopulated<Variant>).filter((v) => v.active !== false)
  const variants: NVariant[] = product.enableVariants && variantDocs.length
    ? variantDocs.map(normalizeVariant)
    : [
        {
          inventory: product.inventory ?? 0,
          lowStock: 3,
          price: product.priceInNPREnabled && typeof product.priceInNPR === 'number' ? product.priceInNPR : null,
        },
      ]

  // Card swatches show the whole product palette, not just filtered colours.
  const allColors: FilamentColor[] = []
  const seen = new Set<string>()
  for (const v of variants) {
    if (v.colorValue && !seen.has(v.colorValue)) {
      seen.add(v.colorValue)
      allColors.push({ hex: v.colorHex || '#999999', name: v.colorLabel || v.colorValue })
    }
  }

  const material = isPopulated<Material>(product.filamentDetails?.material) ? product.filamentDetails.material : null
  const finish = product.filamentDetails?.finish ?? undefined

  return {
    allColors,
    createdAt: Date.parse(product.createdAt) || 0,
    featured: Boolean(product.featured),
    finish,
    finishLabel: finish ? FINISH_LABELS[finish] ?? finish : undefined,
    imageUrl: mediaUrl(product.images?.[0]),
    materialName: material?.name,
    materialSlug: material?.slug,
    slug: product.slug,
    title: product.title,
    variants,
    weight: product.filamentDetails?.netWeightKg ? `${product.filamentDetails.netWeightKg} KG` : undefined,
  }
}

// ---------------------------------------------------------------------------
// Variant-aware matching — the money path. A product matches variant-level
// filters only when a SINGLE variant satisfies all of them at once.
// ---------------------------------------------------------------------------

/** Variants of one product that satisfy the variant-level filters (color, packaging, price, stock). */
export function matchingVariants(np: NProduct, f: FilamentFilters): NVariant[] {
  return np.variants.filter((v) => {
    if (v.price == null) return false
    if (f.colors.length && !(v.colorValue && f.colors.includes(v.colorValue))) return false
    if (f.packaging.length && !(v.packaging && f.packaging.includes(v.packaging))) return false
    if (f.min != null && v.price < f.min) return false
    if (f.max != null && v.price > f.max) return false
    if (f.inStockOnly && v.inventory <= 0) return false
    return true
  })
}

/** Product-level filters that don't depend on a specific variant. */
function matchesProductLevel(np: NProduct, f: FilamentFilters): boolean {
  if (f.materials.length && !(np.materialSlug && f.materials.includes(np.materialSlug))) return false
  if (f.finishes.length && !(np.finish && f.finishes.includes(np.finish))) return false
  if (f.q) {
    const q = f.q.toLowerCase()
    if (!np.title.toLowerCase().includes(q) && !(np.materialName ?? '').toLowerCase().includes(q)) return false
  }
  return true
}

export function buildCard(
  np: NProduct,
  matching: NVariant[],
  isColorFiltered = false,
): FilamentCardProduct {
  const prices = matching.map((v) => v.price as number)
  const price = Math.min(...prices)
  const totalInventory = matching.reduce((sum, v) => sum + v.inventory, 0)
  const lowest = Math.min(...matching.map((v) => v.lowStock))
  const stock = deriveStock(totalInventory, lowest)

  // Variant-level image matching:
  // If a color filter is active, display that matching variant's image.
  // Fallbacks:
  // 1. Product's primary/default image (np.imageUrl)
  // 2. Sensible first in-stock variant image
  // 3. First available variant image
  let cardImage: string | undefined
  if (isColorFiltered) {
    const matchingWithImage = matching.find((v) => v.imageUrl)
    if (matchingWithImage) {
      cardImage = matchingWithImage.imageUrl
    }
  }

  if (!cardImage) {
    cardImage =
      np.imageUrl ||
      np.variants.find((v) => v.inventory > 0 && v.imageUrl)?.imageUrl ||
      np.variants.find((v) => v.imageUrl)?.imageUrl
  }

  return {
    colors: np.allColors,
    fromPrice: matching.length > 1,
    href: `/product/${np.slug}`,
    imageUrl: cardImage,
    material: np.materialName || np.finishLabel || '',
    price,
    stock: stock.state,
    stockLeft: stock.left,
    title: np.title,
    weight: np.weight,
  }
}

// ---------------------------------------------------------------------------
// Facets — derived from the whole (unfiltered) catalogue so the sidebar only
// ever offers options that back a real product.
// ---------------------------------------------------------------------------

function buildFacets(products: NProduct[]): CatalogFacets {
  const materials = new Map<string, Facet>()
  const finishes = new Map<string, Facet>()
  const packaging = new Map<string, Facet>()
  const colors = new Map<string, ColorFacet>()
  let priceMin = Infinity
  let priceMax = 0

  for (const np of products) {
    if (np.materialSlug) {
      const f = materials.get(np.materialSlug) ?? { count: 0, label: np.materialName || np.materialSlug, value: np.materialSlug }
      f.count++
      materials.set(np.materialSlug, f)
    }
    if (np.finish) {
      const f = finishes.get(np.finish) ?? { count: 0, label: np.finishLabel || np.finish, value: np.finish }
      f.count++
      finishes.set(np.finish, f)
    }
    const seenPack = new Set<string>()
    const seenColor = new Set<string>()
    for (const v of np.variants) {
      if (typeof v.price === 'number') {
        priceMin = Math.min(priceMin, v.price)
        priceMax = Math.max(priceMax, v.price)
      }
      if (v.packaging && !seenPack.has(v.packaging)) {
        seenPack.add(v.packaging)
        const f = packaging.get(v.packaging) ?? { count: 0, label: PACKAGING_LABELS[v.packaging] || v.packaging, value: v.packaging }
        f.count++
        packaging.set(v.packaging, f)
      }
      if (v.colorValue && !seenColor.has(v.colorValue)) {
        seenColor.add(v.colorValue)
        const f = colors.get(v.colorValue) ?? { count: 0, hex: v.colorHex || '#999999', label: v.colorLabel || v.colorValue, value: v.colorValue }
        f.count++
        colors.set(v.colorValue, f)
      }
    }
  }

  const byLabel = (a: Facet, b: Facet) => a.label.localeCompare(b.label)
  return {
    colors: [...colors.values()].sort(byLabel),
    finishes: [...finishes.values()].sort(byLabel),
    materials: [...materials.values()].sort(byLabel),
    packaging: [...packaging.values()].sort((a, b) => a.value.localeCompare(b.value)),
    priceMax: priceMax || 0,
    priceMin: priceMin === Infinity ? 0 : priceMin,
  }
}

// ---------------------------------------------------------------------------
// Query + assemble
// ---------------------------------------------------------------------------

async function fetchFilamentProducts(): Promise<NProduct[]> {
  // Lazy so the pure filter/parse helpers stay importable without dragging in
  // payload.config (which runs wrangler at module load and breaks in tests).
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    where: { and: [{ productType: { equals: 'filament' } }, { _status: { equals: 'published' } }] },
    depth: 2,
    limit: 200,
    pagination: false,
    // Variant-aware filtering is wrong if variants get truncated by the join default.
    joins: { variants: { limit: 100 } },
    overrideAccess: false,
  })
  return (docs as Product[]).map(normalizeProduct)
}

// ponytail: whole (small) filament catalogue is fetched once and filtered in
// memory — variant-combination matching can't be expressed as a product-level
// Payload `where`. Move to a denormalised index if the catalogue grows past a
// few hundred products.
export async function getFilamentCatalog(f: FilamentFilters): Promise<CatalogResult> {
  let products: NProduct[]
  try {
    products = await fetchFilamentProducts()
  } catch (error) {
    console.error('Failed to load filament products from Payload', error)
    products = []
  }

  const facets = buildFacets(products)

  const isColorFiltered = f.colors.length > 0
  const built = products
    .filter((np) => matchesProductLevel(np, f))
    .map((np) => ({ np, matching: matchingVariants(np, f) }))
    .filter((x) => x.matching.length > 0)
    .map((x) => ({
      card: buildCard(x.np, x.matching, isColorFiltered),
      np: x.np,
      sortPrice: Math.min(...x.matching.map((v) => v.price as number)),
    }))

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

export function parseFilters(sp: SearchParams): FilamentFilters {
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort
  return {
    colors: csv(sp.color),
    finishes: csv(sp.finish),
    inStockOnly: (Array.isArray(sp.availability) ? sp.availability[0] : sp.availability) === 'in',
    materials: csv(sp.material),
    max: num(sp.max),
    min: num(sp.min),
    packaging: csv(sp.packaging),
    page: Math.max(1, Math.trunc(num(sp.page) ?? 1)),
    q: (Array.isArray(sp.q) ? sp.q[0] : sp.q ?? '').trim(),
    sort: sortRaw && SORT_KEYS.has(sortRaw as SortKey) ? (sortRaw as SortKey) : 'featured',
  }
}

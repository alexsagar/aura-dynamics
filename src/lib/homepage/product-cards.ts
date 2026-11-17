import type { FilamentColor, FilamentCardProduct, PackagingKind, PrintCardProduct, StockState } from '@/components/storefront/types'
import type { Material, Product, Variant, VariantOption } from '@/payload-types'
import { productHref } from '@/lib/catalog/shared'
import { variantPriceNPR } from '@/lib/catalog/pricing'
import { resolveProductImage } from '@/lib/catalog/product-image'

/** Real product records only — populated relationships (depth >= 2), not IDs. */
type PopulatedVariant = Variant & { options: VariantOption[] }

const isPopulated = <T,>(value: number | T | null | undefined): value is T =>
  Boolean(value) && typeof value === 'object'

function populatedVariants(product: Product): PopulatedVariant[] {
  const docs = product.variants?.docs ?? []
  return docs.filter(isPopulated<Variant>).filter((v) => v.active !== false) as PopulatedVariant[]
}

/** Lowest active price across variants, or the product's own price. NPR only. */
function derivePrice(product: Product, variants: PopulatedVariant[]) {
  if (product.enableVariants && variants.length) {
    const prices = variants.map((v) => variantPriceNPR(product, v)).filter((p): p is number => p != null)
    if (prices.length) {
      return { fromPrice: variants.length > 1 || prices.length > 1, price: Math.min(...prices) }
    }
  }
  if (product.priceInNPREnabled && typeof product.priceInNPR === 'number') {
    return { fromPrice: false, price: product.priceInNPR }
  }
  return null
}

/** Mirrors the variant `lowStockThreshold` default (3) for product-level stock. */
function deriveStock(inventory: number | null | undefined, lowStockThreshold = 3): {
  state: StockState
  left?: number
} {
  if (inventory == null) return { state: 'in' }
  if (inventory <= 0) return { state: 'out' }
  if (inventory <= lowStockThreshold) return { state: 'low', left: inventory }
  return { state: 'in' }
}

function deriveStockFromVariants(variants: PopulatedVariant[]) {
  if (!variants.length) return deriveStock(undefined)
  const totalInventory = variants.reduce((sum, v) => sum + (v.inventory ?? 0), 0)
  const lowest = Math.min(...variants.map((v) => v.lowStockThreshold ?? 3))
  return deriveStock(totalInventory, lowest)
}

function deriveColors(variants: PopulatedVariant[]): FilamentColor[] {
  const seen = new Map<string, FilamentColor>()
  for (const variant of variants) {
    for (const option of variant.options) {
      if (!isPopulated<VariantOption>(option)) continue
      if (!option.hexColor && !option.colorFamily) continue
      const key = option.hexColor || option.colorFamily || option.label
      if (!seen.has(key)) {
        seen.set(key, { hex: option.hexColor || '#999999', name: option.label })
      }
    }
  }
  return [...seen.values()]
}

const PACKAGING_VALUES: PackagingKind[] = ['full-spool', 'refill']

function derivePackaging(variants: PopulatedVariant[]): PackagingKind[] {
  const found = new Set<PackagingKind>()
  for (const variant of variants) {
    for (const option of variant.options) {
      if (!isPopulated<VariantOption>(option)) continue
      if (PACKAGING_VALUES.includes(option.value as PackagingKind)) {
        found.add(option.value as PackagingKind)
      }
    }
  }
  return [...found]
}

function deriveMaterialNames(variants: PopulatedVariant[], fallback?: number | Material | null): string[] {
  const names = new Set<string>()
  for (const variant of variants) {
    for (const option of variant.options) {
      if (isPopulated<VariantOption>(option) && isPopulated<Material>(option.material)) {
        names.add(option.material.name)
      }
    }
  }
  if (!names.size && isPopulated<Material>(fallback)) names.add(fallback.name)
  return [...names]
}

/**
 * Builds a FilamentCard prop from a real, populated Product. Returns null only
 * when it has no sellable price. Image comes from the shared resolver
 * (product → variant photos); none → the card's "Image coming soon" state.
 */
export function toFilamentCard(product: Product): FilamentCardProduct | null {
  const variants = populatedVariants(product)
  const imageUrl = resolveProductImage(product, variants)
  const priceInfo = derivePrice(product, variants)
  if (!priceInfo) return null

  const stock = product.enableVariants ? deriveStockFromVariants(variants) : deriveStock(product.inventory)
  const material = isPopulated<Material>(product.filamentDetails?.material)
    ? product.filamentDetails.material.name
    : (product.filamentDetails?.finish ?? '')

  return {
    colors: deriveColors(variants),
    fromPrice: priceInfo.fromPrice,
    href: productHref(product.slug),
    imageUrl,
    material,
    packaging: derivePackaging(variants),
    price: priceInfo.price,
    stock: stock.state,
    stockLeft: stock.left,
    title: product.title,
    weight: product.filamentDetails?.netWeightKg ? `${product.filamentDetails.netWeightKg} KG` : undefined,
  }
}

export function toPrintCard(product: Product): PrintCardProduct | null {
  const variants = populatedVariants(product)
  const imageUrl = resolveProductImage(product, variants)
  const priceInfo = derivePrice(product, variants)
  if (!priceInfo) return null

  const stock = product.enableVariants ? deriveStockFromVariants(variants) : deriveStock(product.inventory)

  return {
    category: isPopulated(product.category) ? product.category.name : '',
    fromPrice: priceInfo.fromPrice,
    href: productHref(product.slug),
    imageUrl,
    materials: deriveMaterialNames(variants),
    price: priceInfo.price,
    stock: stock.state,
    stockLeft: stock.left,
    title: product.title,
  }
}

/** Resolves a Homepage `products` relationship field, dropping IDs that weren't populated. */
export function populatedProducts(products: (number | Product)[] | null | undefined): Product[] {
  return (products ?? []).filter(isPopulated<Product>)
}

/**
 * One card per sellable colour variant of a filament product (no extra
 * database records): the variant's own colour, photo (falling back to the
 * product's), price, packaging and stock, linking to the product page with
 * that variant preselected. Products without variants give their single card.
 * In-stock colours come first; out-of-stock ones stay visible but last.
 */
export function toVariantCards(product: Product): FilamentCardProduct[] {
  const variants = populatedVariants(product)
  if (!product.enableVariants || !variants.length) {
    const card = toFilamentCard(product)
    return card ? [card] : []
  }
  const base = toFilamentCard(product)
  if (!base) return []
  const cards: FilamentCardProduct[] = []
  for (const variant of variants) {
    const price = variantPriceNPR(product, variant)
    if (price == null) continue
    const stock = deriveStock(variant.inventory ?? 0, variant.lowStockThreshold ?? 3)
    const colors = deriveColors([variant])
    const colorName = colors[0]?.name
    cards.push({
      ...base,
      colors,
      fromPrice: false,
      href: `${productHref(product.slug)}?variant=${variant.id}`,
      imageUrl: resolveProductImage(null, [], variant) ?? base.imageUrl,
      packaging: derivePackaging([variant]),
      price,
      stock: stock.state,
      stockLeft: stock.left,
      title: colorName ? `${product.title} — ${colorName}` : variant.title || product.title,
    })
  }
  const rank = (c: FilamentCardProduct) => (c.stock === 'out' ? 1 : 0)
  return cards.sort((a, b) => rank(a) - rank(b))
}

export type CatalogShade = {
  id: string
  name: string
  hex: string
  image?: string
  href: string
  inStock: boolean
}

/**
 * Every distinct colour sold across the given (published) products, from
 * their active variants' colour options. Photo: an editor override matched by
 * colour name or hex, else the first variant photo of that colour. In-stock
 * colours first. Nothing is invented: no colour without a sellable variant.
 */
export function catalogShades(
  products: Product[],
  overrides: { name?: string | null; hex?: string | null; image?: string }[] = [],
): CatalogShade[] {
  const byValue = new Map<string, CatalogShade>()
  for (const product of products) {
    for (const variant of populatedVariants(product)) {
      const option = variant.options.find(
        (o): o is VariantOption => isPopulated<VariantOption>(o) && Boolean(o.hexColor || o.colorFamily),
      )
      if (!option) continue
      const inStock = (variant.inventory ?? 0) > 0
      const existing = byValue.get(option.value)
      if (existing) {
        existing.inStock ||= inStock
        existing.image ??= resolveProductImage(null, [], variant)
        continue
      }
      byValue.set(option.value, {
        id: option.value,
        name: option.label,
        hex: option.hexColor || '#999999',
        image: resolveProductImage(null, [], variant),
        href: `/filaments?color=${encodeURIComponent(option.value)}`,
        inStock,
      })
    }
  }
  const norm = (v?: string | null) => (v ?? '').trim().toLowerCase()
  const shades = [...byValue.values()].map((shade) => {
    const o = overrides.find(
      (x) => x.image && ((x.name && norm(x.name) === norm(shade.name)) || (x.hex && norm(x.hex) === norm(shade.hex))),
    )
    return o?.image ? { ...shade, image: o.image } : shade
  })
  return shades.sort((a, b) => Number(b.inStock) - Number(a.inStock))
}

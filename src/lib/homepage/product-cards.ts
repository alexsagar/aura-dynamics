import type { FilamentColor, FilamentCardProduct, PackagingKind, PrintCardProduct, StockState } from '@/components/storefront/types'
import type { Material, Product, Variant, VariantOption } from '@/payload-types'
import { mediaUrl } from '@/lib/payload-media'

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
    const prices = variants
      .filter((v) => v.priceInNPREnabled && typeof v.priceInNPR === 'number')
      .map((v) => v.priceInNPR as number)
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
 * Builds a FilamentCard prop from a real, populated Product. Returns null
 * when the product can't be rendered as a real card yet — currently, when it
 * has no product photography. That keeps the merchandising row from showing
 * a placeholder box next to real photos.
 */
export function toFilamentCard(product: Product): FilamentCardProduct | null {
  const imageUrl = mediaUrl(product.images?.[0])
  if (!imageUrl) return null

  const variants = populatedVariants(product)
  const priceInfo = derivePrice(product, variants)
  if (!priceInfo) return null

  const stock = product.enableVariants ? deriveStockFromVariants(variants) : deriveStock(product.inventory)
  const material = isPopulated<Material>(product.filamentDetails?.material)
    ? product.filamentDetails.material.name
    : (product.filamentDetails?.finish ?? '')

  return {
    colors: deriveColors(variants),
    fromPrice: priceInfo.fromPrice,
    href: `/product/${product.slug}`,
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
  const imageUrl = mediaUrl(product.images?.[0])
  if (!imageUrl) return null

  const variants = populatedVariants(product)
  const priceInfo = derivePrice(product, variants)
  if (!priceInfo) return null

  const stock = product.enableVariants ? deriveStockFromVariants(variants) : deriveStock(product.inventory)

  return {
    category: isPopulated(product.category) ? product.category.name : '',
    fromPrice: priceInfo.fromPrice,
    href: `/product/${product.slug}`,
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

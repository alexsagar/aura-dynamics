/**
 * The one place a variant's selling price (NPR) is decided. Pure and
 * client-safe: checkout uses it for the charged price, every card, page and
 * cart uses it for display, so they cannot disagree.
 *
 * Order:
 *  1. Product "Full spool price" / "Refill price" (Admin → product → Colour
 *     pricing), shared by every colour of that packaging, unless the variant
 *     is marked "Custom price".
 *  2. The variant's own price (when enabled).
 *  3. The product's base price.
 *
 * With no shared price set, this is exactly the earlier behaviour (2 → 3).
 * Prices are read at request time and copied into the order snapshot at
 * checkout, so changing them never alters existing orders.
 */
type ProductPricing = {
  priceInNPR?: number | null
  spoolPriceInNPR?: number | null
  refillPriceInNPR?: number | null
  spoolOriginalPriceInNPR?: number | null
  refillOriginalPriceInNPR?: number | null
}
type VariantPricing = {
  priceInNPREnabled?: boolean | null
  priceInNPR?: number | null
  originalPriceInNPR?: number | null
  customPrice?: boolean | null
  options?: unknown[] | null
}

const positive = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null)

/** Packaging comes from the variant's populated options ('refill' option value). Unpopulated → full spool. */
export function isRefill(variant: Pick<VariantPricing, 'options'> | null | undefined): boolean {
  return (variant?.options ?? []).some((o) => Boolean(o) && typeof o === 'object' && (o as { value?: unknown }).value === 'refill')
}

export function variantPriceNPR(
  product: ProductPricing | null | undefined,
  variant: VariantPricing | null | undefined,
): number | null {
  if (variant && !variant.customPrice) {
    const shared = positive(isRefill(variant) ? product?.refillPriceInNPR : product?.spoolPriceInNPR)
    if (shared) return shared
  }
  const own = variant?.priceInNPREnabled ? positive(variant.priceInNPR) : null
  return own ?? positive(product?.priceInNPR)
}

/**
 * Display-only "original" price (struck through), paired with whichever
 * source `variantPriceNPR` charged: shared spool/refill original, or the
 * variant's own. Never used for cart, checkout or order totals.
 */
export function variantOriginalPriceNPR(
  product: ProductPricing | null | undefined,
  variant: VariantPricing | null | undefined,
): number | null {
  if (variant && !variant.customPrice) {
    const refill = isRefill(variant)
    if (positive(refill ? product?.refillPriceInNPR : product?.spoolPriceInNPR)) {
      return positive(refill ? product?.refillOriginalPriceInNPR : product?.spoolOriginalPriceInNPR)
    }
  }
  return variant?.priceInNPREnabled && positive(variant.priceInNPR) ? positive(variant.originalPriceInNPR) : null
}

/** Real discount only: original must exceed the selling price. Percent rounded (2,299 → 2,000 = 13%). */
export function discountNPR(price: number | null | undefined, original: number | null | undefined) {
  const p = positive(price)
  const o = positive(original)
  if (!p || !o || o <= p) return null
  return { original: o, saved: o - p, percent: Math.round(((o - p) / o) * 100) }
}

/** Cheapest {price, original} pair; the struck price belongs to the cheapest option, so "From" never overstates. */
export function cheapest(items: { price: number | null; original?: number | null }[]) {
  let best: { price: number; original?: number | null } | null = null
  for (const it of items) if (it.price != null && (!best || it.price < best.price)) best = { price: it.price, original: it.original }
  return best && { price: best.price, compareAt: discountNPR(best.price, best.original)?.original }
}

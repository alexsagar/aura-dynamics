/**
 * Display name for an order line. Variant titles are usually already
 * "Product — Colour", so the product name is not repeated in front of them.
 */
export function itemName(title?: string | null, variant?: string | null): string {
  const t = title || 'Item'
  if (!variant || variant === t) return t
  return variant.startsWith(t) ? variant : `${t} — ${variant}`
}

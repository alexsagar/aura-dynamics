/**
 * Input bounds for the public checkout API. Unauthenticated orders reserve real
 * stock and are stored verbatim, so cap what one request can take and store.
 *
 * Quantity caps are build-time configurable for future wholesale orders
 * (NEXT_PUBLIC_ so the cart and the API share one value):
 *   NEXT_PUBLIC_CHECKOUT_MAX_QTY_PER_LINE   (default 10)
 *   NEXT_PUBLIC_CHECKOUT_MAX_UNITS_PER_ORDER (default 30)
 */
const intEnv = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

export const CHECKOUT_LIMITS = {
  MAX_LINES: 20,
  MAX_QTY_PER_LINE: intEnv(process.env.NEXT_PUBLIC_CHECKOUT_MAX_QTY_PER_LINE, 10),
  MAX_UNITS_PER_ORDER: intEnv(process.env.NEXT_PUBLIC_CHECKOUT_MAX_UNITS_PER_ORDER, 30),
  maxLength: {
    idempotencyKey: 100,
    fullName: 100,
    email: 254,
    address: 300,
    city: 100,
    orderNotes: 1000,
    paymentReference: 100,
  },
} as const

type Field = keyof typeof CHECKOUT_LIMITS.maxLength

/** Returns a user-facing error for the first exceeded bound, or null. */
export function checkoutLimitsError(
  fields: Partial<Record<Field, unknown>>,
  items: unknown[],
  limits: { MAX_QTY_PER_LINE: number; MAX_UNITS_PER_ORDER: number } = CHECKOUT_LIMITS,
): string | null {
  for (const [name, max] of Object.entries(CHECKOUT_LIMITS.maxLength) as [Field, number][]) {
    const v = fields[name]
    if (typeof v === 'string' && v.length > max) return `${name} is too long (max ${max} characters).`
  }
  if (items.length > CHECKOUT_LIMITS.MAX_LINES) return `Too many items in one order (max ${CHECKOUT_LIMITS.MAX_LINES}).`
  let total = 0
  for (const item of items as { quantity?: unknown }[]) {
    const qty = Math.floor(Number(item?.quantity))
    if (qty > limits.MAX_QTY_PER_LINE) {
      return `Maximum ${limits.MAX_QTY_PER_LINE} units per item per order. Contact us for bulk orders.`
    }
    if (qty > 0) total += qty
  }
  if (total > limits.MAX_UNITS_PER_ORDER) {
    return `Maximum ${limits.MAX_UNITS_PER_ORDER} units per order. Contact us for bulk orders.`
  }
  return null
}

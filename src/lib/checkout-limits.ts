/**
 * Input bounds for the public checkout API. Unauthenticated orders reserve real
 * stock and are stored verbatim, so cap what one request can take and store.
 * Adjust MAX_QTY_PER_LINE if bulk orders become a business need.
 */
export const CHECKOUT_LIMITS = {
  MAX_LINES: 20,
  MAX_QTY_PER_LINE: 10,
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
export function checkoutLimitsError(fields: Partial<Record<Field, unknown>>, items: unknown[]): string | null {
  for (const [name, max] of Object.entries(CHECKOUT_LIMITS.maxLength) as [Field, number][]) {
    const v = fields[name]
    if (typeof v === 'string' && v.length > max) return `${name} is too long (max ${max} characters).`
  }
  if (items.length > CHECKOUT_LIMITS.MAX_LINES) return `Too many items in one order (max ${CHECKOUT_LIMITS.MAX_LINES}).`
  for (const item of items as { quantity?: unknown }[]) {
    if (Math.floor(Number(item?.quantity)) > CHECKOUT_LIMITS.MAX_QTY_PER_LINE) {
      return `Maximum ${CHECKOUT_LIMITS.MAX_QTY_PER_LINE} units per item per order. Contact us for bulk orders.`
    }
  }
  return null
}

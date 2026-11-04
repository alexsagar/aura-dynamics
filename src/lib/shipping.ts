/**
 * Single source of the delivery rule, shared by cart, checkout page, the
 * checkout API and /api/payment-settings so the total a customer sees is the
 * total the server charges. Amounts are whole NPR (see README "Money units").
 */
export type ShippingSettings = {
  shippingFee: number
  freeShippingThreshold: number
  freeShippingEnabled: boolean
}

export const DEFAULT_SHIPPING: ShippingSettings = {
  shippingFee: 150,
  freeShippingThreshold: 5000,
  freeShippingEnabled: true,
}

/** Normalise the Site Settings group (any field may be missing) onto the defaults. */
export function resolveShippingSettings(raw?: Partial<Record<keyof ShippingSettings, unknown>> | null): ShippingSettings {
  return {
    shippingFee: typeof raw?.shippingFee === 'number' ? raw.shippingFee : DEFAULT_SHIPPING.shippingFee,
    freeShippingThreshold:
      typeof raw?.freeShippingThreshold === 'number' ? raw.freeShippingThreshold : DEFAULT_SHIPPING.freeShippingThreshold,
    freeShippingEnabled: raw?.freeShippingEnabled !== false,
  }
}

export function shippingFor(subtotal: number, s: ShippingSettings): number {
  return s.freeShippingEnabled && subtotal >= s.freeShippingThreshold ? 0 : s.shippingFee
}

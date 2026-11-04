import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

import { DEFAULT_SHIPPING, resolveShippingSettings, shippingFor } from '@/lib/shipping'

describe('delivery rule (shared by cart, checkout page and checkout API)', () => {
  it('charges Rs. 150 below the free threshold', () => {
    expect(shippingFor(2500, DEFAULT_SHIPPING)).toBe(150)
    expect(shippingFor(4999, DEFAULT_SHIPPING)).toBe(150)
  })

  it('is free at or above Rs. 5,000', () => {
    expect(shippingFor(5000, DEFAULT_SHIPPING)).toBe(0)
    expect(shippingFor(25000, DEFAULT_SHIPPING)).toBe(0)
  })

  it('always charges when the promotion is disabled', () => {
    expect(shippingFor(25000, { ...DEFAULT_SHIPPING, freeShippingEnabled: false })).toBe(150)
  })

  it('falls back to defaults for missing Site Settings fields', () => {
    expect(resolveShippingSettings(null)).toEqual(DEFAULT_SHIPPING)
    expect(resolveShippingSettings({ shippingFee: 200 })).toEqual({ ...DEFAULT_SHIPPING, shippingFee: 200 })
    expect(resolveShippingSettings({ freeShippingEnabled: false }).freeShippingEnabled).toBe(false)
  })
})

describe('money units', () => {
  // Stored amounts are whole rupees; the plugin divides by 10^decimals in Admin.
  // decimals: 2 showed Rs. 2,650 as "NPR 26.50" and would store a typed 2500 as 250000.
  it('NPR currency uses decimals: 0', () => {
    const config = readFileSync('src/payload.config.ts', 'utf8')
    expect(config).toMatch(/code: 'NPR',[\s\S]{0,400}?decimals: 0,/)
  })
})

describe('checkout links signed-in customers', () => {
  it('sets the order customer from the session, never from the request body', () => {
    const route = readFileSync('src/app/api/checkout/route.ts', 'utf8')
    expect(route).toMatch(/payload\.auth\(\{ headers: req\.headers \}\)/)
    expect(route).toMatch(/customer: customerId,/)
    expect(route).not.toMatch(/customer: body\./)
  })
})

import { describe, it, expect } from 'vitest'

import { cheapest, discountNPR, variantOriginalPriceNPR, variantPriceNPR } from '@/lib/catalog/pricing'
import { toVariantCards } from '@/lib/homepage/product-cards'
import { buildCard, type NProduct } from '@/lib/filaments/catalog'

const refill = { id: 90, value: 'refill', label: 'Refill' }
const spool = { id: 91, value: 'full-spool', label: 'Full Spool' }
const own = { priceInNPREnabled: true, priceInNPR: 2500 }
// Numakers PLA as configured: shared full-spool 2,000 (orig 2,299), refill 1,800 without original.
const pla = { spoolPriceInNPR: 2000, spoolOriginalPriceInNPR: 2299, refillPriceInNPR: 1800 }

describe('discountNPR', () => {
  it('2,299 original / 2,000 selling → Rs. 299 saved, 13% off', () => {
    expect(discountNPR(2000, 2299)).toEqual({ original: 2299, saved: 299, percent: 13 })
  })
  it('no discount without a real original', () => {
    expect(discountNPR(2000, null)).toBeNull()
    expect(discountNPR(2000, undefined)).toBeNull()
    expect(discountNPR(2000, 0)).toBeNull()
    expect(discountNPR(2000, 2000)).toBeNull()
    expect(discountNPR(2000, 1500)).toBeNull()
  })
})

describe('variantOriginalPriceNPR (display only)', () => {
  it('full spool and refill use their own shared originals', () => {
    expect(variantOriginalPriceNPR(pla, { ...own, options: [spool] })).toBe(2299)
    expect(variantOriginalPriceNPR(pla, { ...own, options: [refill] })).toBeNull()
    expect(variantOriginalPriceNPR({ ...pla, refillOriginalPriceInNPR: 2000 }, { ...own, options: [refill] })).toBe(2000)
  })
  it('custom-priced variant uses its own original, not the shared one', () => {
    const custom = { ...own, customPrice: true, originalPriceInNPR: 2800, options: [spool] }
    expect(variantPriceNPR(pla, custom)).toBe(2500)
    expect(variantOriginalPriceNPR(pla, custom)).toBe(2800)
    expect(variantOriginalPriceNPR(pla, { ...custom, originalPriceInNPR: null })).toBeNull()
  })
  it('a shared original without a shared selling price is ignored', () => {
    expect(variantOriginalPriceNPR({ spoolOriginalPriceInNPR: 2299 }, own)).toBeNull()
  })
  it('never changes the charged (cart/checkout) price', () => {
    expect(variantPriceNPR(pla, { ...own, options: [spool] })).toBe(2000)
    expect(variantPriceNPR(pla, { ...own, options: [refill] })).toBe(1800)
    expect(variantPriceNPR({ ...pla, spoolOriginalPriceInNPR: undefined }, own)).toBe(2000)
  })
})

describe('cheapest', () => {
  it('struck price belongs to the cheapest option', () => {
    expect(cheapest([{ price: 2000, original: 2299 }, { price: 1800, original: null }])).toEqual({ price: 1800, compareAt: undefined })
    expect(cheapest([{ price: 2000, original: 2299 }, { price: 2500 }])).toEqual({ price: 2000, compareAt: 2299 })
    expect(cheapest([{ price: null }])).toBeNull()
  })
})

describe('cards carry the original price', () => {
  const black = { id: 'black', value: 'black', label: 'Black', hexColor: '#000', colorFamily: 'black' }
  const white = { id: 'white', value: 'white', label: 'White', hexColor: '#fff', colorFamily: 'white' }
  const v = (id: number, options: unknown[], inventory: number) => ({ id, active: true, inventory, ...own, options })
  const product = {
    id: 1, slug: 'numakers-pla', title: 'Numakers PLA', enableVariants: true, ...pla,
    variants: { docs: [v(1, [black, spool], 5), v(2, [white, spool], 0)] },
  } as any

  it('homepage/popular colour cards show original + selling, including out of stock', () => {
    const cards = toVariantCards(product)
    expect(cards.map((c) => [c.price, c.compareAt, c.stock])).toEqual([
      [2000, 2299, 'in'],
      [2000, 2299, 'out'],
    ])
  })
  it('filament listing card', () => {
    const np = { allColors: [], slug: 'x', title: 'X', variants: [] } as unknown as NProduct
    const card = buildCard(np, [{ inventory: 5, lowStock: 3, price: 2000, original: 2299 }])
    expect([card.price, card.compareAt]).toEqual([2000, 2299])
    expect(buildCard(np, [{ inventory: 5, lowStock: 3, price: 2000 }]).compareAt).toBeUndefined()
  })
})

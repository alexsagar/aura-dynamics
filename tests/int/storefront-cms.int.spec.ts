import { describe, it, expect } from 'vitest'

import { isRefill, variantPriceNPR } from '@/lib/catalog/pricing'
import { catalogShades, toVariantCards } from '@/lib/homepage/product-cards'
import { itemName } from '@/lib/item-name'
import { orderConfirmationEmail } from '@/lib/order-emails'

const refill = { id: 90, value: 'refill', label: 'Refill' }
const colour = (value: string, label: string, hexColor: string) => ({ id: value, value, label, hexColor, colorFamily: 'other' })
const media = (url: string) => ({ id: url, url, alt: url })

describe('variantPriceNPR (one price rule for display and checkout)', () => {
  const own = { priceInNPREnabled: true, priceInNPR: 2500 }

  it('without shared prices, behaves as before: variant price, then product price', () => {
    expect(variantPriceNPR({}, own)).toBe(2500)
    expect(variantPriceNPR({ priceInNPR: 1800 }, { priceInNPREnabled: false, priceInNPR: 2500 })).toBe(1800)
    expect(variantPriceNPR({}, { priceInNPREnabled: false })).toBeNull()
  })

  it('shared Full spool / Refill price applies to every colour unless Custom price', () => {
    const product = { spoolPriceInNPR: 2700, refillPriceInNPR: 2200 }
    expect(variantPriceNPR(product, own)).toBe(2700)
    expect(variantPriceNPR(product, { ...own, options: [refill] })).toBe(2200)
    expect(isRefill({ options: [refill] })).toBe(true)
    expect(variantPriceNPR(product, { ...own, customPrice: true })).toBe(2500)
  })

  it('ignores empty / zero / non-numeric shared prices', () => {
    expect(variantPriceNPR({ spoolPriceInNPR: 0 }, own)).toBe(2500)
    expect(variantPriceNPR({ spoolPriceInNPR: null }, own)).toBe(2500)
    // Refill variant with no refill price falls back to its own price, never the spool price.
    expect(variantPriceNPR({ spoolPriceInNPR: 2700 }, { ...own, options: [refill] })).toBe(2500)
  })
})

const variant = (id: number, opt: ReturnType<typeof colour>, inventory: number, images: unknown[] = []) => ({
  id,
  title: `Numakers PLA — ${opt.label}`,
  active: true,
  inventory,
  priceInNPREnabled: true,
  priceInNPR: 2500,
  options: [opt],
  images,
})
const white = colour('pure-white', 'Pure White', '#FFFFFF')
const black = colour('pitch-black', 'Pitch Black', '#000000')
const product: any = {
  id: 1,
  slug: 'numakers-pla',
  title: 'Numakers PLA',
  enableVariants: true,
  spoolPriceInNPR: 2700,
  filamentDetails: { material: { name: 'PLA' }, netWeightKg: 1 },
  variants: { docs: [variant(1, white, 0, [media('/w.jpg')]), variant(2, black, 5, [media('/b.jpg')]), { ...variant(3, black, 9), active: false }] },
}

describe('toVariantCards (Popular: one card per colour, no new records)', () => {
  it('builds a card per active colour variant with its own image, price, stock and deep link; in stock first', () => {
    const cards = toVariantCards(product)
    expect(cards.map((c) => c.title)).toEqual(['Numakers PLA — Pitch Black', 'Numakers PLA — Pure White'])
    expect(cards[0]).toMatchObject({ href: '/product/numakers-pla?variant=2', imageUrl: '/b.jpg', price: 2700, stock: 'in', fromPrice: false })
    expect(cards[1]).toMatchObject({ stock: 'out', imageUrl: '/w.jpg' })
    expect(cards[0].colors).toEqual([{ hex: '#000000', name: 'Pitch Black' }])
  })
})

describe('catalogShades (Explore by Color from real colours)', () => {
  it('lists each sold colour once, with variant photo, filter link and stock; editor photo overrides by name', () => {
    const shades = catalogShades([product], [{ name: 'pure white', image: '/override.jpg' }])
    expect(shades).toEqual([
      { id: 'pitch-black', name: 'Pitch Black', hex: '#000000', image: '/b.jpg', href: '/filaments?color=pitch-black', inStock: true },
      { id: 'pure-white', name: 'Pure White', hex: '#FFFFFF', image: '/override.jpg', href: '/filaments?color=pure-white', inStock: false },
    ])
  })

  it('no products → no colours (section hides)', () => {
    expect(catalogShades([])).toEqual([])
  })
})

describe('order line names (no repeated product name)', () => {
  it('itemName', () => {
    expect(itemName('Numakers PLA', 'Numakers PLA — Pure White')).toBe('Numakers PLA — Pure White')
    expect(itemName('Numakers PLA', 'Pure White')).toBe('Numakers PLA — Pure White')
    expect(itemName('Numakers PLA', 'Numakers PLA')).toBe('Numakers PLA')
    expect(itemName('Numakers PLA', null)).toBe('Numakers PLA')
  })

  it('confirmation email names each line once', () => {
    const { html } = orderConfirmationEmail(
      {
        orderNumber: 'AURA-1',
        paymentMethod: 'cod',
        items: [{ title: 'Numakers PLA', variantTitle: 'Numakers PLA — Pure White', quantity: 2, lineTotal: 5000 }],
        subtotal: 5000,
        shipping: 0,
        total: 5000,
      } as any,
      'https://example.test',
    )
    expect(html).toContain('Numakers PLA — Pure White × 2')
    expect(html).not.toContain('Numakers PLA — Numakers PLA')
  })
})

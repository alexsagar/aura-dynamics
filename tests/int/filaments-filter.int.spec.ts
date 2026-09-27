import { describe, expect, it } from 'vitest'

import { matchingVariants, parseFilters, type FilamentFilters, type NProduct } from '@/lib/filaments/catalog'

// The seeded Numakers PLA+ matrix (see src/seed/catalog-test.ts).
const numakers: NProduct = {
  allColors: [],
  createdAt: 0,
  featured: false,
  materialSlug: 'pla',
  slug: 'numakers-pla-plus',
  title: 'Numakers PLA+',
  variants: [
    { colorValue: 'black', inventory: 8, lowStock: 3, packaging: 'full-spool', price: 2500 },
    { colorValue: 'black', inventory: 4, lowStock: 3, packaging: 'refill', price: 2300 },
    { colorValue: 'white', inventory: 3, lowStock: 3, packaging: 'full-spool', price: 2500 },
    { colorValue: 'white', inventory: 0, lowStock: 3, packaging: 'refill', price: 2300 },
  ],
}

const base = (over: Partial<FilamentFilters> = {}): FilamentFilters => ({
  colors: [], finishes: [], inStockOnly: false, materials: [], packaging: [], page: 1, q: '', sort: 'featured', ...over,
})

describe('variant-aware filament filtering', () => {
  it('excludes the product when White + Refill + In Stock has zero inventory', () => {
    const m = matchingVariants(numakers, base({ colors: ['white'], packaging: ['refill'], inStockOnly: true }))
    expect(m).toHaveLength(0)
  })

  it('still matches White + Refill without the stock filter (out-of-stock combo exists)', () => {
    const m = matchingVariants(numakers, base({ colors: ['white'], packaging: ['refill'] }))
    expect(m).toHaveLength(1)
    expect(m[0].price).toBe(2300)
  })

  it('prices Black + Refill at 2300', () => {
    const m = matchingVariants(numakers, base({ colors: ['black'], packaging: ['refill'] }))
    expect(Math.min(...m.map((v) => v.price as number))).toBe(2300)
  })

  it('does not cross variants: Black + no-stock-filter keeps both black combos', () => {
    const m = matchingVariants(numakers, base({ colors: ['black'] }))
    expect(m.map((v) => v.packaging).sort()).toEqual(['full-spool', 'refill'])
  })

  it('respects the price range against variant prices', () => {
    const m = matchingVariants(numakers, base({ max: 2400 }))
    expect(m.every((v) => (v.price as number) <= 2400)).toBe(true)
    expect(m).toHaveLength(2) // the two refills at 2300
  })
})

describe('parseFilters', () => {
  it('reads csv, price, availability and sort from search params', () => {
    const f = parseFilters({ material: 'pla,petg', color: 'black', availability: 'in', min: '2000', sort: 'price-asc', page: '2' })
    expect(f.materials).toEqual(['pla', 'petg'])
    expect(f.colors).toEqual(['black'])
    expect(f.inStockOnly).toBe(true)
    expect(f.min).toBe(2000)
    expect(f.sort).toBe('price-asc')
    expect(f.page).toBe(2)
  })

  it('falls back to featured sort on garbage input', () => {
    expect(parseFilters({ sort: 'best-selling' }).sort).toBe('featured')
  })
})

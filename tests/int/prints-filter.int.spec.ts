import { describe, expect, it } from 'vitest'

import { matchingVariants, parseFilters, type NPrintProduct, type PrintFilters } from '@/lib/prints/catalog'

// The seeded Dragon Figure matrix (see src/seed/catalog-test.ts):
// PLA 800/inv5, PETG 950/inv2, ABS 1050/inv0 (out of stock).
const dragon: NPrintProduct = {
  allMaterials: ['PLA', 'PETG', 'ABS'],
  categorySlug: 'figures',
  categoryName: 'Figures',
  createdAt: 0,
  featured: false,
  slug: 'dragon-figure',
  title: 'Dragon Figure',
  variants: [
    { materialSlug: 'pla', materialLabel: 'PLA', inventory: 5, lowStock: 3, price: 800 },
    { materialSlug: 'petg', materialLabel: 'PETG', inventory: 2, lowStock: 3, price: 950 },
    { materialSlug: 'abs', materialLabel: 'ABS', inventory: 0, lowStock: 3, price: 1050 },
  ],
}

const base = (over: Partial<PrintFilters> = {}): PrintFilters => ({
  categories: [], inStockOnly: false, materials: [], page: 1, q: '', sort: 'featured', ...over,
})

describe('variant-aware 3D print filtering', () => {
  it('excludes the product when ABS + In Stock (ABS variant is out of stock)', () => {
    const m = matchingVariants(dragon, base({ materials: ['abs'], inStockOnly: true }))
    expect(m).toHaveLength(0)
  })

  it('still matches ABS without the stock filter, at the ABS price', () => {
    const m = matchingVariants(dragon, base({ materials: ['abs'] }))
    expect(m).toHaveLength(1)
    expect(m[0].price).toBe(1050)
  })

  it('prices PETG at 950, not the cheapest PLA', () => {
    const m = matchingVariants(dragon, base({ materials: ['petg'] }))
    expect(Math.min(...m.map((v) => v.price as number))).toBe(950)
  })

  it('does not cross variants: PLA keeps only the PLA variant', () => {
    const m = matchingVariants(dragon, base({ materials: ['pla'] }))
    expect(m.map((v) => v.materialSlug)).toEqual(['pla'])
  })

  it('respects the price range against variant prices', () => {
    const m = matchingVariants(dragon, base({ max: 900 }))
    expect(m.every((v) => (v.price as number) <= 900)).toBe(true)
    expect(m).toHaveLength(1) // only PLA at 800
  })
})

describe('parseFilters (prints)', () => {
  it('reads category, material, price, availability and sort', () => {
    const f = parseFilters({ category: 'figures,miniatures', material: 'pla', availability: 'in', max: '1000', sort: 'price-desc', page: '2' })
    expect(f.categories).toEqual(['figures', 'miniatures'])
    expect(f.materials).toEqual(['pla'])
    expect(f.inStockOnly).toBe(true)
    expect(f.max).toBe(1000)
    expect(f.sort).toBe('price-desc')
    expect(f.page).toBe(2)
  })

  it('falls back to featured sort on garbage input', () => {
    expect(parseFilters({ sort: 'top-rated' }).sort).toBe('featured')
  })
})

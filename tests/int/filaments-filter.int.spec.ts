import { describe, expect, it } from 'vitest'

import { buildCard, matchingVariants, parseFilters, type FilamentFilters, type NProduct } from '@/lib/filaments/catalog'

// The confirmed Numakers PLA matrix (see src/seed/catalog-test.ts).
const numakersPLA: NProduct = {
  allColors: [
    { hex: '#FFFFFF', name: 'Pure White' },
    { hex: '#111111', name: 'Pitch Black' },
    { hex: '#2D6A4F', name: 'Forest Green' },
    { hex: '#E63946', name: 'Nuclear Red' },
    { hex: '#2563EB', name: 'Royal Blue' },
    { hex: '#FACC15', name: 'Lemon Yellow' },
    { hex: '#E9EEF0', name: 'Transparent' },
  ],
  createdAt: 0,
  featured: false,
  imageUrl: '/api/media/file/numakers-pla-pure-white.png',
  materialName: 'PLA',
  materialSlug: 'pla',
  slug: 'numakers-pla',
  title: 'Numakers PLA',
  variants: [
    { colorHex: '#FFFFFF', colorLabel: 'Pure White', colorValue: 'pure-white', imageUrl: '/api/media/file/numakers-pla-pure-white.png', inventory: 120, lowStock: 3, price: 2500 },
    { colorHex: '#111111', colorLabel: 'Pitch Black', colorValue: 'pitch-black', imageUrl: '/api/media/file/numakers-pla-pitch-black.png', inventory: 160, lowStock: 3, price: 2500 },
    { colorHex: '#2D6A4F', colorLabel: 'Forest Green', colorValue: 'forest-green', imageUrl: '/api/media/file/numakers-pla-forest-green.png', inventory: 50, lowStock: 3, price: 2500 },
    { colorHex: '#E63946', colorLabel: 'Nuclear Red', colorValue: 'nuclear-red', imageUrl: '/api/media/file/numakers-pla-nuclear-red.png', inventory: 60, lowStock: 3, price: 2500 },
    { colorHex: '#2563EB', colorLabel: 'Royal Blue', colorValue: 'royal-blue', imageUrl: '/api/media/file/numakers-pla-royal-blue.png', inventory: 60, lowStock: 3, price: 2500 },
    { colorHex: '#FACC15', colorLabel: 'Lemon Yellow', colorValue: 'lemon-yellow', imageUrl: '/api/media/file/numakers-pla-lemon-yellow.png', inventory: 40, lowStock: 3, price: 2500 },
    { colorHex: '#E9EEF0', colorLabel: 'Transparent', colorValue: 'transparent', imageUrl: '/api/media/file/numakers-pla-transparent.png', inventory: 10, lowStock: 3, price: 2500 },
  ],
}

const base = (over: Partial<FilamentFilters> = {}): FilamentFilters => ({
  colors: [],
  finishes: [],
  inStockOnly: false,
  materials: [],
  packaging: [],
  page: 1,
  q: '',
  sort: 'featured',
  ...over,
})

describe('Numakers PLA catalog & variant-aware filtering', () => {
  it('1. Product title is Numakers PLA', () => {
    expect(numakersPLA.title).toBe('Numakers PLA')
    expect(numakersPLA.slug).toBe('numakers-pla')
  })

  it('2. Exactly seven color variants exist', () => {
    expect(numakersPLA.variants).toHaveLength(7)
  })

  it('3. No Packaging variant matching is required', () => {
    expect(numakersPLA.variants.every((v) => v.packaging === undefined)).toBe(true)
    const matched = matchingVariants(numakersPLA, base())
    expect(matched).toHaveLength(7)
  })

  it('4. Transparent is selectable', () => {
    const matched = matchingVariants(numakersPLA, base({ colors: ['transparent'] }))
    expect(matched).toHaveLength(1)
    expect(matched[0].colorValue).toBe('transparent')
    expect(matched[0].colorLabel).toBe('Transparent')
  })

  it('5. Pure White stock = 120', () => {
    const white = numakersPLA.variants.find((v) => v.colorValue === 'pure-white')
    expect(white?.inventory).toBe(120)
  })

  it('6. Pitch Black stock = 160', () => {
    const black = numakersPLA.variants.find((v) => v.colorValue === 'pitch-black')
    expect(black?.inventory).toBe(160)
  })

  it('7. Transparent stock = 10', () => {
    const transparent = numakersPLA.variants.find((v) => v.colorValue === 'transparent')
    expect(transparent?.inventory).toBe(10)
  })

  it('8. Availability filter includes all seven variants (all in stock)', () => {
    const inStock = matchingVariants(numakersPLA, base({ inStockOnly: true }))
    expect(inStock).toHaveLength(7)
    const totalInventory = inStock.reduce((acc, v) => acc + v.inventory, 0)
    expect(totalInventory).toBe(500)
  })

  it('9. Filaments without packaging variants have no packaging facets', () => {
    const packagingSet = new Set<string>()
    for (const v of numakersPLA.variants) {
      if (v.packaging) packagingSet.add(v.packaging)
    }
    expect(packagingSet.size).toBe(0)
  })

  it('10. No PLA+ label remains in product title or slug', () => {
    expect(numakersPLA.title).not.toContain('PLA+')
    expect(numakersPLA.slug).not.toContain('pla-plus')
  })

  it('allows filtering by each confirmed color individually', () => {
    const colors = [
      'pure-white',
      'pitch-black',
      'forest-green',
      'nuclear-red',
      'royal-blue',
      'lemon-yellow',
      'transparent',
    ]
    for (const color of colors) {
      const m = matchingVariants(numakersPLA, base({ colors: [color] }))
      expect(m).toHaveLength(1)
      expect(m[0].colorValue).toBe(color)
    }
  })
})

describe('parseFilters', () => {
  it('reads csv, price, availability and sort from search params', () => {
    const f = parseFilters({
      availability: 'in',
      color: 'pure-white,pitch-black',
      material: 'pla',
      min: '2000',
      page: '2',
      sort: 'price-asc',
    })
    expect(f.materials).toEqual(['pla'])
    expect(f.colors).toEqual(['pure-white', 'pitch-black'])
    expect(f.inStockOnly).toBe(true)
    expect(f.min).toBe(2000)
    expect(f.sort).toBe('price-asc')
    expect(f.page).toBe(2)
  })

  it('falls back to featured sort on garbage input', () => {
    expect(parseFilters({ sort: 'best-selling' }).sort).toBe('featured')
  })
})

describe('buildCard variant image resolution & fallbacks', () => {
  it('1. Displays matching variant image when color filter is active (forest-green)', () => {
    const matching = matchingVariants(numakersPLA, base({ colors: ['forest-green'] }))
    const card = buildCard(numakersPLA, matching, true)
    expect(card.imageUrl).toBe('/api/media/file/numakers-pla-forest-green.png')
  })

  it('2. Displays matching variant image when color filter is active (transparent)', () => {
    const matching = matchingVariants(numakersPLA, base({ colors: ['transparent'] }))
    const card = buildCard(numakersPLA, matching, true)
    expect(card.imageUrl).toBe('/api/media/file/numakers-pla-transparent.png')
  })

  it('3. Displays product primary image when no color filter is active', () => {
    const matching = matchingVariants(numakersPLA, base())
    const card = buildCard(numakersPLA, matching, false)
    expect(card.imageUrl).toBe('/api/media/file/numakers-pla-pure-white.png')
  })

  it('4. Falls back to first in-stock variant image if product primary image is missing', () => {
    const productWithoutImage: NProduct = {
      ...numakersPLA,
      imageUrl: undefined,
    }
    const matching = matchingVariants(productWithoutImage, base())
    const card = buildCard(productWithoutImage, matching, false)
    expect(card.imageUrl).toBe('/api/media/file/numakers-pla-pure-white.png')
  })

  it('5. Falls back to parent product gallery image if matching variant has no image', () => {
    const productWithVariantNoImage: NProduct = {
      ...numakersPLA,
      imageUrl: '/api/media/file/fallback-parent.png',
      variants: numakersPLA.variants.map((v) => ({ ...v, imageUrl: undefined as string | undefined })),
    }
    const matching = matchingVariants(productWithVariantNoImage, base({ colors: ['forest-green'] }))
    const card = buildCard(productWithVariantNoImage, matching, true)
    expect(card.imageUrl).toBe('/api/media/file/fallback-parent.png')
  })
})

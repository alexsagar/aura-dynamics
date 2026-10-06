import { describe, expect, it } from 'vitest'

import { matchesSearch, searchTokens } from '@/lib/catalog/search'
import { productHref } from '@/lib/catalog/shared'

// Searchable text for the confirmed catalogue products (see search.ts haystack
// + src/seed/catalog-test.ts). Mirrors what the server builds per product.
const numakersPLAText =
  'Numakers PLA numakers-pla Numakers PLA 1.75 mm 1 kg spool for everyday 3D printing filament filaments spool spools PLA basic Pure White pure-white white Pitch Black pitch-black black Forest Green forest-green green Nuclear Red Royal Blue Lemon Yellow Transparent transparent'

const dragonFigureText =
  'Dragon Figure dragon-figure Ready-stock 3D-printed decorative dragon figure 3d print 3d prints print prints printed model figure Figures PLA'

describe('search predicate', () => {
  it('tokenises case-insensitively and collapses whitespace', () => {
    expect(searchTokens('  Numakers   PLA ')).toEqual(['numakers', 'pla'])
    expect(searchTokens('')).toEqual([])
    expect(searchTokens('   ')).toEqual([])
  })

  it('matches by product title and brand', () => {
    expect(matchesSearch(numakersPLAText, 'Numakers')).toBe(true)
    expect(matchesSearch(dragonFigureText, 'Dragon')).toBe(true)
  })

  it('matches by material term', () => {
    expect(matchesSearch(numakersPLAText, 'PLA')).toBe(true)
    expect(matchesSearch(dragonFigureText, 'pla')).toBe(true)
  })

  it('matches by variant colour label (e.g. "White")', () => {
    expect(matchesSearch(numakersPLAText, 'White')).toBe(true)
    expect(matchesSearch(numakersPLAText, 'forest green')).toBe(true)
  })

  it('matches by product-type synonym', () => {
    expect(matchesSearch(numakersPLAText, 'filament')).toBe(true)
    expect(matchesSearch(dragonFigureText, 'print')).toBe(true)
  })

  it('requires every token to be present (AND semantics)', () => {
    expect(matchesSearch(numakersPLAText, 'numakers pla')).toBe(true)
    expect(matchesSearch(numakersPLAText, 'numakers abs')).toBe(false)
  })

  it('returns no match for an empty query or unrelated term', () => {
    expect(matchesSearch(numakersPLAText, '')).toBe(false)
    expect(matchesSearch(numakersPLAText, 'xyzzy')).toBe(false)
  })
})

describe('productHref resolver', () => {
  it('builds the canonical /product/<slug> URL', () => {
    expect(productHref('numakers-pla')).toBe('/product/numakers-pla')
    expect(productHref('dragon-figure')).toBe('/product/dragon-figure')
  })

  it('falls back to home for a missing slug rather than a broken link', () => {
    expect(productHref('')).toBe('/')
    expect(productHref(null)).toBe('/')
    expect(productHref(undefined)).toBe('/')
  })
})

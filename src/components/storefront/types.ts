/**
 * Mock-friendly prop types for the storefront design system.
 * These are deliberately independent of payload-types.ts — real data mapping
 * happens later, in the page/data layer.
 */

export type StockState = 'in' | 'low' | 'out'

export type FilamentColor = {
  name: string
  hex: string
  available?: boolean
}

export type PackagingKind = 'full-spool' | 'refill'

export type FilamentCardProduct = {
  href: string
  title: string
  material: string
  weight?: string
  colors: FilamentColor[]
  /** Lowest price across variants, in NPR rupees. */
  price: number
  fromPrice?: boolean
  stock: StockState
  stockLeft?: number
  packaging?: PackagingKind[]
  imageUrl?: string
  isNew?: boolean
  featured?: boolean
}

export type PrintCardProduct = {
  href: string
  title: string
  category: string
  materials: string[]
  /** Lowest price across variants, in NPR rupees. */
  price: number
  fromPrice?: boolean
  stock: StockState
  stockLeft?: number
  imageUrl?: string
  isNew?: boolean
  featured?: boolean
}

// Product-agnostic catalog helpers shared by the Filaments and 3D Prints
// catalogs. Pure + client-safe: no Payload/server imports, so both the server
// data layers and (indirectly) client components can pull from here without
// dragging payload.config into the browser bundle.

import type { StockState } from '@/components/storefront/types'

import type { SortKey } from '@/lib/filaments/sort-options'

export const isPopulated = <T,>(value: number | T | null | undefined): value is T =>
  Boolean(value) && typeof value === 'object'

/** One product's stock state from its (matching) inventory total. */
export function deriveStock(inventory: number, lowStockThreshold: number): { left?: number; state: StockState } {
  if (inventory <= 0) return { state: 'out' }
  if (inventory <= lowStockThreshold) return { left: inventory, state: 'low' }
  return { state: 'in' }
}

/** csv query param → trimmed, non-empty values. */
export const csv = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v.join(',') : v ?? '').split(',').map((s) => s.trim()).filter(Boolean)

/** non-negative number query param, else undefined. */
export const num = (v: string | string[] | undefined): number | undefined => {
  const n = Number(Array.isArray(v) ? v[0] : v)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export const SORT_KEYS = new Set<SortKey>(['featured', 'name', 'newest', 'price-asc', 'price-desc'])

export type Sortable = { createdAt: number; featured: boolean; sortPrice: number; title: string }

/** Shared sort order for both catalogs. `sortPrice` is the lowest matching-variant price. */
export function compareCatalog(sort: SortKey, a: Sortable, b: Sortable): number {
  switch (sort) {
    case 'price-asc':
      return a.sortPrice - b.sortPrice
    case 'price-desc':
      return b.sortPrice - a.sortPrice
    case 'name':
      return a.title.localeCompare(b.title)
    case 'newest':
      return b.createdAt - a.createdAt
    case 'featured':
    default:
      return Number(b.featured) - Number(a.featured) || b.createdAt - a.createdAt
  }
}

/** Clamp the requested page and slice the current page out of the full result set. */
export function paginate<T>(items: T[], requestedPage: number, pageSize: number) {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, requestedPage), pageCount)
  const start = (page - 1) * pageSize
  return { page, pageCount, slice: items.slice(start, start + pageSize), total }
}

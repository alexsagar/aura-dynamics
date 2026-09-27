// Client-safe: no Payload/server imports, so Client Components can use these
// without dragging the server catalogue module into the browser bundle.

export type SortKey = 'featured' | 'name' | 'newest' | 'price-asc' | 'price-desc'

export const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name: A–Z', value: 'name' },
  { label: 'Newest', value: 'newest' },
]

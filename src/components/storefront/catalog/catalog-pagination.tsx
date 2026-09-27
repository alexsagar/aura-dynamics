import Link from 'next/link'

import { cn } from '@/components/storefront/ui/cn'

type SearchParams = Record<string, string | string[] | undefined>

/** Server-rendered pagination that preserves every active filter/sort param. */
export function CatalogPagination({
  basePath,
  page,
  pageCount,
  searchParams,
}: {
  basePath: string
  page: number
  pageCount: number
  searchParams: SearchParams
}) {
  if (pageCount <= 1) return null

  const href = (n: number): string => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === 'page' || v == null) continue
      p.set(k, Array.isArray(v) ? v.join(',') : v)
    }
    if (n > 1) p.set('page', String(n))
    const qs = p.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link className="rounded-control border border-border px-3 py-2 text-sm hover:bg-surface" href={href(page - 1)}>
          Previous
        </Link>
      )}
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
        <Link
          aria-current={n === page ? 'page' : undefined}
          className={cn(
            'min-w-9 rounded-control border px-3 py-2 text-center text-sm',
            n === page ? 'border-deep-forest bg-deep-forest text-white' : 'border-border hover:bg-surface',
          )}
          href={href(n)}
          key={n}
        >
          {n}
        </Link>
      ))}
      {page < pageCount && (
        <Link className="rounded-control border border-border px-3 py-2 text-sm hover:bg-surface" href={href(page + 1)}>
          Next
        </Link>
      )}
    </nav>
  )
}

'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { SORT_OPTIONS } from '@/lib/filaments/sort-options'

/** Search + sort toolbar shared by every catalog. `noun` tunes the search copy. */
export function CatalogToolbar({ noun = 'products' }: { noun?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')

  useEffect(() => setQ(params.get('q') ?? ''), [params])

  const push = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(params.toString())
    mutate(p)
    p.delete('page')
    const qs = p.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const commitSearch = () =>
    push((p) => {
      const v = q.trim()
      if (v) p.set('q', v)
      else p.delete('q')
    })

  return (
    <div className="flex flex-1 items-center gap-3">
      <div className="relative flex-1 sm:max-w-xs">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
        </svg>
        <input
          aria-label={`Search ${noun}`}
          className="w-full rounded-control border border-border bg-surface py-2 pr-3 pl-9 text-sm"
          onBlur={commitSearch}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commitSearch()}
          placeholder={`Search ${noun}...`}
          type="search"
          value={q}
        />
      </div>

      <label className="flex flex-none items-center gap-2 text-sm text-muted">
        <span className="hidden sm:inline">Sort</span>
        <select
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground"
          onChange={(e) => push((p) => (e.target.value === 'featured' ? p.delete('sort') : p.set('sort', e.target.value)))}
          value={params.get('sort') ?? 'featured'}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

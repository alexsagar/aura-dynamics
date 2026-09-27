'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

import { cn } from '@/components/storefront/ui/cn'

/** Toggle a value inside a csv query param. */
export function toggleCsv(p: URLSearchParams, key: string, value: string) {
  const cur = (p.get(key) ?? '').split(',').filter(Boolean)
  const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
  if (next.length) p.set(key, next.join(','))
  else p.delete(key)
}

/**
 * Shared filter-URL state for every catalog. `csvKeys` are the multi-select
 * query params that count toward the active-filter badge (e.g. material,
 * color for filaments; category, material for prints). availability + price
 * are always counted.
 */
export function useCatalogFilters(csvKeys: string[]) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const update = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(params.toString())
      mutate(p)
      p.delete('page') // any filter change returns to the first page
      const qs = p.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router],
  )

  const has = (key: string, value: string) => (params.get(key) ?? '').split(',').includes(value)
  const activeCount =
    csvKeys.reduce((n, k) => n + (params.get(k) ?? '').split(',').filter(Boolean).length, 0) +
    (params.get('availability') === 'in' ? 1 : 0) +
    (params.get('min') || params.get('max') ? 1 : 0)

  return { activeCount, has, params, pathname, router, update }
}

export function FilterSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="border-t border-border py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}

export function FilterCheck({ checked, label, onChange }: { checked: boolean; label: ReactNode; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-foreground">
      <input checked={checked} className="size-4 accent-primary" onChange={onChange} type="checkbox" />
      <span>{label}</span>
    </label>
  )
}

export function ClearAllButton({ activeCount, className = '' }: { activeCount: number; className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  if (!activeCount) return null
  return (
    <button
      className={cn('text-sm font-medium text-primary-text underline underline-offset-4 hover:text-deep-forest', className)}
      onClick={() => router.push(pathname, { scroll: false })}
      type="button"
    >
      Clear all filters
    </button>
  )
}

/**
 * Desktop sidebar + mobile trigger/drawer chrome shared by every catalog.
 * `children` is the catalog-specific filter form; it renders inside both the
 * desktop aside and the mobile drawer.
 */
export function FilterShell({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Mobile trigger */}
      <button
        className="flex items-center justify-center gap-2 rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-medium lg:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="4" x2="20" y1="6" y2="6" /><line x1="7" x2="17" y1="12" y2="12" /><line x1="10" x2="14" y1="18" y2="18" />
        </svg>
        Filters{activeCount ? ` (${activeCount})` : ''}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Filters</h2>
          <ClearAllButton activeCount={activeCount} />
        </div>
        {children}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div aria-label="Filters" aria-modal="true" className="fixed inset-0 z-50 lg:hidden" role="dialog">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Filters</h2>
              <button aria-label="Close filters" onClick={() => setOpen(false)} type="button">
                <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="6" x2="18" y1="6" y2="18" /><line x1="6" x2="18" y1="18" y2="6" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
              <ClearAllButton activeCount={activeCount} />
              <button
                className="ml-auto rounded-full bg-deep-forest px-6 py-2.5 text-sm font-medium text-white"
                onClick={() => setOpen(false)}
                type="button"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

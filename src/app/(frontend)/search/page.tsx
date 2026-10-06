import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'

import { Container } from '@/components/storefront/layout/Container'
import { Price } from '@/components/storefront/commerce/Price'
import { ProductImage } from '@/components/storefront/ui/ProductImage'
import { SearchIcon } from '@/components/storefront/ui/icons'
import { searchProducts } from '@/lib/catalog/search'

export const metadata: Metadata = {
  title: 'Search · Aura',
  description: 'Search Aura for filaments and ready-stock 3D prints.',
  // Search results pages carry no durable content; keep them out of the index.
  robots: { index: false, follow: true },
}

function firstParam(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v ?? '').toString()
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const q = firstParam(sp.q).trim()
  const results = q ? await searchProducts(q) : []

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Search</h1>

          {/* GET form: shareable ?q= URL, works without client JS, keyboard-first */}
          <form action="/search" method="get" role="search" className="mt-6">
            <label htmlFor="search-q" className="sr-only">
              Search products
            </label>
            <div className="flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 focus-within:border-foreground">
              <span aria-hidden="true" className="text-muted">
                <SearchIcon />
              </span>
              <input
                id="search-q"
                name="q"
                type="search"
                defaultValue={q}
                autoFocus
                placeholder="Search filaments, 3D prints, colours…"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                className="rounded-full bg-cta px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cta-hover"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          {!q ? (
            <p className="text-muted">Enter a product name, material or colour to get started.</p>
          ) : results.length === 0 ? (
            <div className="rounded-3xl border border-border bg-white p-10 text-center">
              <p className="text-lg font-medium">No results for “{q}”.</p>
              <p className="mt-2 text-muted">
                Try a different term, or browse the{' '}
                <Link className="underline hover:text-foreground" href="/filaments">
                  filament
                </Link>{' '}
                and{' '}
                <Link className="underline hover:text-foreground" href="/3d-prints">
                  3D print
                </Link>{' '}
                catalogues.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-8 text-sm text-muted" aria-live="polite">
                {results.length} {results.length === 1 ? 'result' : 'results'} for “{q}”
              </p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
                {results.map((r) => (
                  <li key={r.slug}>
                    <Link href={r.href} className="group flex flex-col gap-3">
                      <ProductImage
                        alt={r.title}
                        src={r.imageUrl}
                        ratio="portrait"
                        className="rounded-card transition-opacity group-hover:opacity-92"
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                          {r.typeLabel}
                        </span>
                        <h2 className="text-base font-semibold leading-tight">{r.title}</h2>
                        <p className="text-sm text-muted">{r.meta}</p>
                        {r.price != null ? <Price amount={r.price} from={r.fromPrice} /> : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Container>
    </div>
  )
}

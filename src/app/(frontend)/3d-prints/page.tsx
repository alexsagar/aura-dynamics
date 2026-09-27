import Link from 'next/link'
import { Suspense } from 'react'

import { CatalogPagination } from '@/components/storefront/catalog/catalog-pagination'
import { CatalogToolbar } from '@/components/storefront/catalog/catalog-toolbar'
import { Container } from '@/components/storefront/layout/Container'
import { PrintCard } from '@/components/storefront/product/PrintCard'
import { getPrintCatalog, parseFilters } from '@/lib/prints/catalog'

import { CatalogFilters } from './catalog-filters'

export const metadata = {
  description: 'Browse Aura ready-made 3D prints — figures, miniatures and more, shipped across Nepal.',
  title: '3D Prints — Aura',
}

type SearchParams = Record<string, string | string[] | undefined>

export default async function PrintsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const filters = parseFilters(sp)
  const { cards, catalogTotal, facets, page, pageCount, total } = await getPrintCatalog(filters)

  return (
    <Container className="pt-28 pb-8 lg:pt-32 lg:pb-10">
      {/* Breadcrumb + heading */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link className="hover:text-foreground" href="/">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">3D Prints</span>
      </nav>

      <div className="mt-3 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">3D Prints</h1>
        <p className="mt-1.5 text-muted">Explore our collection of ready-made 3D prints.</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="lg:w-64 lg:flex-none">
          <Suspense>
            <CatalogFilters facets={facets} />
          </Suspense>
        </div>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              {total} {total === 1 ? 'product' : 'products'}
            </p>
            <Suspense>
              <CatalogToolbar noun="3D prints" />
            </Suspense>
          </div>

          {/* Results */}
          {total > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                {cards.map((card) => (
                  <PrintCard key={card.href} product={card} ratio="square" />
                ))}
              </div>

              <CatalogPagination basePath="/3d-prints" page={page} pageCount={pageCount} searchParams={sp} />
            </>
          ) : (
            <div className="mt-16 flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium">
                {catalogTotal === 0 ? 'No 3D prints available yet.' : 'No 3D prints match your filters.'}
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                {catalogTotal === 0
                  ? 'Check back soon — new prints are added regularly.'
                  : 'Try removing a filter or widening your price range.'}
              </p>
              {catalogTotal > 0 && (
                <Link
                  className="mt-5 rounded-full bg-deep-forest px-6 py-2.5 text-sm font-medium text-white"
                  href="/3d-prints"
                >
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

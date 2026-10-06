import React from 'react'

import { Container } from '@/components/storefront/layout/Container'
import { FilamentCard } from '@/components/storefront/product/FilamentCard'
import { PrintCard } from '@/components/storefront/product/PrintCard'
import type { RelatedCard } from '@/lib/catalog/related'

/**
 * "You may also like" row. Receives real, already-resolved product cards from
 * the server (see `getRelatedProducts`). Renders nothing when there are no
 * legitimate recommendations — we never show mock or placeholder products.
 */
export function ProductRecommendations({ items }: { items: RelatedCard[] }) {
  if (!items.length) return null

  return (
    <section className="bg-background py-24" aria-labelledby="recommendations-heading">
      <Container>
        <div className="mb-12 flex items-end justify-between border-b border-black/10 pb-6">
          <h2
            id="recommendations-heading"
            className="text-3xl font-medium tracking-[-0.02em] md:text-4xl"
          >
            You May Also Like
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {items.map((item, idx) =>
            item.type === 'filament' ? (
              <FilamentCard key={idx} product={item.card} ratio="portrait" />
            ) : (
              <PrintCard key={idx} product={item.card} ratio="portrait" />
            ),
          )}
        </div>
      </Container>
    </section>
  )
}

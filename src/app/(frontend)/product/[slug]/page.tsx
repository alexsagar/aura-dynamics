import React, { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'

import configPromise from '@/payload.config'
import type { Product } from '@/payload-types'
import { Container } from '@/components/storefront/layout/Container'
import { ProductView } from './ProductView'
import { TechSpecs } from '@/components/storefront/product/TechSpecs'
import { ProductRecommendations } from '@/components/storefront/product/ProductRecommendations'
import { ProductJsonLd } from '@/components/storefront/product/ProductJsonLd'
import { getRelatedProducts } from '@/lib/catalog/related'
import { mediaUrl } from '@/lib/payload-media'
import { absoluteUrl } from '@/lib/site/seo'

/**
 * Fetch a single published product by slug. `cache` dedupes the query so the
 * page body and `generateMetadata` share one Payload round-trip per request.
 */
const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'products',
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
      depth: 2,
      limit: 1,
      // Oldest-first so the first-seeded variant (the primary colour) is the
      // default selection and default gallery image, deterministically.
      joins: { variants: { limit: 100, sort: 'createdAt' } },
      overrideAccess: false,
    })
    return (docs[0] as Product) ?? null
  } catch (error) {
    console.error(`Error fetching product "${slug}" from Payload`, error)
    return null
  }
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found · Aura' }

  const description =
    product.shortDescription ||
    `${product.title} — available now from Aura, shipped across Nepal.`
  const image = mediaUrl(product.images?.[0])
  const url = absoluteUrl(`/product/${product.slug}`)

  return {
    title: `${product.title} · Aura`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.title} · Aura`,
      description,
      type: 'website',
      url,
      images: image ? [{ url: image }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  // No mock fallback: an unknown or unpublished slug is a real 404, never a
  // fabricated product page.
  if (!product) notFound()

  const productType = product.productType === '3d-print' ? '3d-print' : 'filament'
  const related = await getRelatedProducts(product.slug, productType)

  const description = product.description as unknown
  const hasRichText =
    typeof description === 'object' && description !== null && 'root' in (description as object)

  return (
    <div className="min-h-screen bg-background pt-32">
      <ProductJsonLd product={product} />
      <Container>
        <ProductView product={product} />
      </Container>

      {/* Product Description: full content lower on the product page */}
      {description ? (
        <section
          className="border-t border-black/10 bg-white py-16 lg:py-24"
          data-testid="product-description-section"
        >
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                About this Product
              </h2>
              <div className="prose prose-neutral max-w-none leading-relaxed text-muted">
                {hasRichText ? (
                  <RichText data={description as never} />
                ) : typeof description === 'string' ? (
                  <p>{description}</p>
                ) : null}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* Full-width Technical Specs Section (only when real technical specifications exist) */}
      {product.productType === 'filament' && product.filamentDetails?.technicalSpecifications ? (
        <TechSpecs specs={product.filamentDetails.technicalSpecifications} />
      ) : null}

      {/* Recommendations: real same-type products only, hidden when there are none */}
      <ProductRecommendations items={related} />
    </div>
  )
}

import React, { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Product } from '@/payload-types'
import { AboutProduct, DeliveryInfo, KeyFeatures, ProductSpecs } from '@/components/storefront/product/ProductDetails'
import { ProductView } from './ProductView'
import { TechSpecs } from '@/components/storefront/product/TechSpecs'
import { ProductRecommendations } from '@/components/storefront/product/ProductRecommendations'
import { ProductJsonLd } from '@/components/storefront/product/ProductJsonLd'
import { getRelatedProducts } from '@/lib/catalog/related'
import { resolveProductImage } from '@/lib/catalog/product-image'
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
  const image = resolveProductImage(product, (product.variants?.docs ?? []).filter((v) => typeof v === 'object'))
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

  const [related, settings] = await Promise.all([
    getRelatedProducts(product),
    getPayload({ config: configPromise })
      .then((payload) => payload.findGlobal({ slug: 'site-settings', depth: 0 }))
      .catch((): null => null),
  ])

  // A: purchase (unchanged) · B: about · C: features · D: specs · E: colours
  // (client, shares variant selection) · F: print settings · G: delivery · H: related
  return (
    <div className="min-h-screen bg-background pt-32">
      <ProductJsonLd product={product} />
      <ProductView
        product={product}
        beforeColours={
          <>
            <AboutProduct product={product} />
            <KeyFeatures product={product} />
            <ProductSpecs product={product} />
          </>
        }
        afterColours={
          <>
            {product.productType === 'filament' && product.filamentDetails?.technicalSpecifications ? (
              <TechSpecs specs={product.filamentDetails.technicalSpecifications} />
            ) : null}
            <DeliveryInfo settings={settings} />
          </>
        }
      />
      <ProductRecommendations items={related} />
    </div>
  )
}

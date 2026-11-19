import React from 'react'

import type { Product, Variant } from '@/payload-types'
import { isPopulated } from '@/lib/catalog/shared'
import { resolveProductImage } from '@/lib/catalog/product-image'
import { variantPriceNPR } from '@/lib/catalog/pricing'
import { absoluteUrl } from '@/lib/site/seo'

/**
 * Schema.org Product structured data, emitting ONLY values that are verified
 * from the Payload record: name, description, images, brand, and an offer with
 * the real NPR price and stock-derived availability. No ratings, reviews, GTIN,
 * MPN, or fabricated discounts — those are intentionally omitted.
 */
export function ProductJsonLd({ product }: { product: Product }) {
  const variants = (product.variants?.docs ?? []).filter(isPopulated<Variant>).filter((v) => v.active !== false)

  const variantPrices = variants.map((v) => variantPriceNPR(product, v)).filter((p): p is number => p != null)
  const productPrice =
    product.priceInNPREnabled && typeof product.priceInNPR === 'number' ? product.priceInNPR : undefined
  const prices = variantPrices.length ? variantPrices : productPrice != null ? [productPrice] : []
  const lowPrice = prices.length ? Math.min(...prices) : undefined

  const totalInventory = variants.length
    ? variants.reduce((sum, v) => sum + (v.inventory ?? 0), 0)
    : (product.inventory ?? 0)
  const availability =
    totalInventory > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'

  // Same image the product page and og:image use (gallery, else a variant photo), absolute.
  const image = resolveProductImage(product, variants)
  const images = image ? [absoluteUrl(image)] : []

  const brand =
    product.productType === 'filament' && product.filamentDetails?.brand
      ? product.filamentDetails.brand
      : undefined

  const url = absoluteUrl(`/product/${product.slug}`)

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    url,
    ...(product.shortDescription ? { description: product.shortDescription } : {}),
    ...(images.length ? { image: images } : {}),
    ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
    ...(lowPrice != null
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'NPR',
            price: lowPrice,
            availability,
            url,
          },
        }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- controlled, server-generated JSON-LD from verified fields
      // Escape `<` so CMS text containing `</script>` cannot close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  )
}

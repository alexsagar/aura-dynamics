'use client'

import React, { useState } from 'react'
import { ProductGallery, type GalleryImage } from '@/components/storefront/product/ProductGallery'
import { ProductForm } from '@/components/storefront/product/ProductForm'

function toGalleryImage(media: any, fallbackAlt: string, idPrefix: string): GalleryImage | null {
  if (!media) return null
  if (typeof media === 'object') {
    const url = media.url || ''
    if (!url) return null
    return {
      id: media.id || idPrefix,
      url,
      alt: media.alt || fallbackAlt,
    }
  }
  return null
}

export function ProductView({ product }: { product: any }) {
  const variants: any[] = Array.isArray(product.variants)
    ? product.variants
    : product.variants?.docs || []

  const [selectedVariant, setSelectedVariant] = useState<any>(variants[0] || null)

  // Map parent product images to GalleryImage array (Parent Gallery Fallback)
  const rawProductImages = (product.images as any[]) || []
  const productGalleryImages: GalleryImage[] = rawProductImages
    .map((img: any, idx: number) => toGalleryImage(img, product.title, `prod-img-${idx}`))
    .filter((img): img is GalleryImage => Boolean(img))

  // Map selected variant image (Selected Variant Image priority)
  const variantImages = (selectedVariant?.images as any[]) || []
  const activeVariantImage: GalleryImage | null =
    variantImages.length > 0
      ? toGalleryImage(
          variantImages[0],
          `${product.title} ${selectedVariant?.title || ''}`,
          `var-img-${selectedVariant?.id || 0}`
        )
      : null

  return (
    <div className="mb-24 grid gap-16 lg:grid-cols-2 lg:gap-24">
      {/* Left Column: Interactive Image Gallery */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <ProductGallery
          images={productGalleryImages}
          selectedImage={activeVariantImage}
        />
      </div>

      {/* Right Column: Product Details & Cart Form */}
      <div className="flex flex-col pt-8 lg:pt-16">
        <ProductForm
          product={product}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
        />
      </div>
    </div>
  )
}

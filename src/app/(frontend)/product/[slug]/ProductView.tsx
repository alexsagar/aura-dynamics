'use client'

import React, { useState } from 'react'
import { Container } from '@/components/storefront/layout/Container'
import { ProductGallery, type GalleryImage } from '@/components/storefront/product/ProductGallery'
import { ProductForm } from '@/components/storefront/product/ProductForm'
import { cn } from '@/components/storefront/ui/cn'
import { firstMediaUrl } from '@/lib/catalog/product-image'

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

/** Colour option of a variant (an option carrying a hex/colour family), if any. */
const colourOf = (variant: any) =>
  (variant?.options ?? []).find((o: any) => o && typeof o === 'object' && (o.hexColor || o.colorFamily))

/**
 * Purchase section + the lower content. Server-rendered sections arrive as
 * `beforeColours` / `afterColours` so the colour grid can sit between them and
 * share the purchase form's variant selection (one selection state).
 */
export function ProductView({
  product,
  beforeColours,
  afterColours,
}: {
  product: any
  beforeColours?: React.ReactNode
  afterColours?: React.ReactNode
}) {
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

  const colourVariants = variants.filter((v) => v?.active !== false && colourOf(v))

  const chooseColour = (variant: any) => {
    setSelectedVariant(variant)
    document.getElementById('product-purchase')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Container>
        <div className="mb-24 grid scroll-mt-28 grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24" id="product-purchase">
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
      </Container>

      {beforeColours}

      {colourVariants.length > 1 ? (
        <section className="border-t border-black/10 bg-background py-16 lg:py-24" data-testid="product-colours-section">
          <Container>
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-4 text-sm font-semibold tracking-[0.1em] text-muted uppercase">Available Colours</p>
                <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                  {colourVariants.length} colours
                </h2>
              </div>
              <p className="text-muted">Choose a colour to select it above.</p>
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {colourVariants.map((v) => {
                const c = colourOf(v)
                const img = firstMediaUrl(v.images)
                const selected = selectedVariant?.id === v.id
                const out = (v.inventory ?? 0) <= 0
                return (
                  <li key={v.id}>
                    <button
                      aria-pressed={selected}
                      className={cn(
                        'group flex w-full flex-col gap-3 rounded-3xl border bg-white p-3 text-left transition-colors',
                        selected ? 'border-foreground' : 'border-black/10 hover:border-black/30',
                      )}
                      data-testid={`colour-card-${c.value || v.id}`}
                      onClick={() => chooseColour(v)}
                      type="button"
                    >
                      <span className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-[#f4f4f4]">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element -- same-origin Payload media, loaded directly
                          <img alt="" className="size-full object-contain" loading="lazy" src={img} />
                        ) : null}
                      </span>
                      <span className="flex items-center gap-2 px-1 pb-1">
                        <span
                          aria-hidden="true"
                          className="size-4 flex-none rounded-full border border-black/10"
                          style={{ background: c.hexColor || '#999' }}
                        />
                        <span className="text-sm font-medium">{c.label}</span>
                        {out ? <span className="ml-auto text-xs text-muted">Sold out</span> : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      ) : null}

      {afterColours}
    </>
  )
}

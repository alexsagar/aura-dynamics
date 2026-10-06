import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Container } from '@/components/storefront/layout/Container'
import { ProductView } from './ProductView'
import { TechSpecs } from '@/components/storefront/product/TechSpecs'
import { ProductRecommendations } from '@/components/storefront/product/ProductRecommendations'
import { RichText } from '@payloadcms/richtext-lexical/react'

// MOCK DATA FALLBACK for design review (No invented technical specs or ratings)
const MOCK_PRODUCT: any = {
  id: 'mock-1',
  title: 'Numakers PLA',
  slug: 'numakers-pla',
  productType: 'filament',
  shortDescription: '1 kg Numakers PLA filament (1.75 mm) for reliable everyday 3D printing.',
  prices: [{ amount: 2500 }],
  images: [
    { id: 'img-wht', url: '/api/media/file/numakers-pla-pure-white.png', alt: 'Numakers PLA Pure White filament spool' },
    { id: 'img-blk', url: '/api/media/file/numakers-pla-pitch-black.png', alt: 'Numakers PLA Pitch Black filament spool' },
    { id: 'img-grn', url: '/api/media/file/numakers-pla-forest-green.png', alt: 'Numakers PLA Forest Green filament spool' },
    { id: 'img-red', url: '/api/media/file/numakers-pla-nuclear-red.png', alt: 'Numakers PLA Nuclear Red filament spool' },
    { id: 'img-blu', url: '/api/media/file/numakers-pla-royal-blue.png', alt: 'Numakers PLA Royal Blue filament spool' },
    { id: 'img-ylw', url: '/api/media/file/numakers-pla-lemon-yellow.png', alt: 'Numakers PLA Lemon Yellow filament spool' },
    { id: 'img-clr', url: '/api/media/file/numakers-pla-transparent.png', alt: 'Numakers PLA Transparent filament spool' },
  ],
  variants: [
    { id: 'v21', title: 'Numakers PLA — Pure White', inventory: 120, priceInNPR: 2500, images: [{ id: 'img-wht', url: '/api/media/file/numakers-pla-pure-white.png', alt: 'Numakers PLA Pure White filament spool' }], options: [{ label: 'Pure White', colorFamily: 'white', hexColor: '#FFFFFF' }] },
    { id: 'v22', title: 'Numakers PLA — Pitch Black', inventory: 160, priceInNPR: 2500, images: [{ id: 'img-blk', url: '/api/media/file/numakers-pla-pitch-black.png', alt: 'Numakers PLA Pitch Black filament spool' }], options: [{ label: 'Pitch Black', colorFamily: 'black', hexColor: '#111111' }] },
    { id: 'v23', title: 'Numakers PLA — Forest Green', inventory: 50, priceInNPR: 2500, images: [{ id: 'img-grn', url: '/api/media/file/numakers-pla-forest-green.png', alt: 'Numakers PLA Forest Green filament spool' }], options: [{ label: 'Forest Green', colorFamily: 'green', hexColor: '#2D6A4F' }] },
    { id: 'v24', title: 'Numakers PLA — Nuclear Red', inventory: 60, priceInNPR: 2500, images: [{ id: 'img-red', url: '/api/media/file/numakers-pla-nuclear-red.png', alt: 'Numakers PLA Nuclear Red filament spool' }], options: [{ label: 'Nuclear Red', colorFamily: 'red', hexColor: '#E63946' }] },
    { id: 'v25', title: 'Numakers PLA — Royal Blue', inventory: 60, priceInNPR: 2500, images: [{ id: 'img-blu', url: '/api/media/file/numakers-pla-royal-blue.png', alt: 'Numakers PLA Royal Blue filament spool' }], options: [{ label: 'Royal Blue', colorFamily: 'blue', hexColor: '#2563EB' }] },
    { id: 'v26', title: 'Numakers PLA — Lemon Yellow', inventory: 40, priceInNPR: 2500, images: [{ id: 'img-ylw', url: '/api/media/file/numakers-pla-lemon-yellow.png', alt: 'Numakers PLA Lemon Yellow filament spool' }], options: [{ label: 'Lemon Yellow', colorFamily: 'yellow', hexColor: '#FACC15' }] },
    { id: 'v27', title: 'Numakers PLA — Transparent', inventory: 10, priceInNPR: 2500, images: [{ id: 'img-clr', url: '/api/media/file/numakers-pla-transparent.png', alt: 'Numakers PLA Transparent filament spool' }], options: [{ label: 'Transparent', colorFamily: 'transparent', hexColor: '#E9EEF0' }] },
  ],
  filamentDetails: {
    brand: 'Numakers',
    material: { name: 'PLA', slug: 'pla' },
    diameter: 1.75,
    netWeightKg: 1,
  },
}

export default async function ProductPage({ params }: { params: any }) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  let product = null

  // Attempt to fetch real product from Payload
  try {
    const { docs } = await payload.find({
      collection: 'products',
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 2,
      joins: { variants: { limit: 100 } },
    })

    if (docs && docs.length > 0) {
      product = docs[0]
    }
  } catch (error) {
    console.error('Error fetching product from payload', error)
  }

  // Fallback to MOCK data if no product is found (to allow UI review)
  if (!product) {
    console.log(`Product ${slug} not found in DB. Falling back to mock data.`)
    product = MOCK_PRODUCT
  }

  return (
    <div className="min-h-screen bg-background pt-32">
      <Container>
        <ProductView product={product} />
      </Container>

      {/* Product Description: full content lower on the product page */}
      {product.description && (
        <section
          className="border-t border-black/10 py-16 lg:py-24 bg-white"
          data-testid="product-description-section"
        >
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                About this Product
              </h2>
              <div className="prose prose-neutral max-w-none text-muted leading-relaxed">
                {typeof product.description === 'object' && (product.description as any)?.root ? (
                  <RichText data={product.description} />
                ) : typeof product.description === 'string' ? (
                  <p>{product.description}</p>
                ) : null}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Full-width Technical Specs Section (only when real technical specifications exist) */}
      {product.productType === 'filament' && product.filamentDetails?.technicalSpecifications && (
        <TechSpecs specs={product.filamentDetails.technicalSpecifications} />
      )}

      {/* Recommendations Section */}
      <ProductRecommendations />
    </div>
  )
}

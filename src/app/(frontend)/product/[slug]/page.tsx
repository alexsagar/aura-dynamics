import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Container } from '@/components/storefront/layout/Container'
import { ProductGallery } from '@/components/storefront/product/ProductGallery'
import { ProductForm } from '@/components/storefront/product/ProductForm'
import { TechSpecs } from '@/components/storefront/product/TechSpecs'
import { ProductRecommendations } from '@/components/storefront/product/ProductRecommendations'

// MOCK DATA FALLBACK for design review
const MOCK_PRODUCT = {
  id: 'mock-1',
  title: 'Numakers PLA+ High Speed Filament',
  slug: 'numakers-pla-plus',
  productType: 'filament',
  shortDescription: 'Industrial-grade PLA+ engineered for high-speed printing without compromising on layer adhesion or surface finish. Perfectly spooled for zero tangles.',
  prices: [{ amount: 2200 }],
  images: [
    { id: 'img1', url: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=800&auto=format&fit=crop', alt: 'Spool front' },
    { id: 'img2', url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=800&auto=format&fit=crop', alt: 'Spool side' },
  ],
  variants: [
    { id: 'v1', title: 'Matte Black', options: [{ colorFamily: 'black', hexColor: '#1A1A1A' }] },
    { id: 'v2', title: 'Arctic White', options: [{ colorFamily: 'white', hexColor: '#F5F5F5' }] },
    { id: 'v3', title: 'Aura Green', options: [{ colorFamily: 'green', hexColor: '#15A246' }] },
  ],
  filamentDetails: {
    technicalSpecifications: {
      nozzleTempMin: 190,
      nozzleTempMax: 230,
      bedTempMin: 40,
      bedTempMax: 60,
      printSpeedMin: 40,
      printSpeedMax: 300,
      density: 1.24,
      enclosure: 'not-required',
      drying: {
        recommended: true,
        temperature: 45,
        durationHours: 4,
      }
    }
  }
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
        <div className="mb-24 grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left Column: Interactive Image Gallery */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <ProductGallery images={(product.images as any) || []} />
          </div>

          {/* Right Column: Product Details & Cart Form */}
          <div className="flex flex-col pt-8 lg:pt-16">
            <ProductForm product={product} />
          </div>
        </div>
      </Container>

      {/* Full-width Technical Specs Section (if it's a filament) */}
      {product.productType === 'filament' && product.filamentDetails?.technicalSpecifications && (
        <TechSpecs specs={product.filamentDetails.technicalSpecifications} />
      )}

      {/* Recommendations Section */}
      <ProductRecommendations />
    </div>
  )
}

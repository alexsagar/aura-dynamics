'use client'

import React from 'react'
import { Container } from '@/components/storefront/layout/Container'
import { FilamentCard } from '@/components/storefront/product/FilamentCard'

const MOCK_RECOMMENDATIONS = [
  {
    href: '/product/numakers-pla-plus',
    title: 'Numakers PLA+ High Speed',
    material: 'PLA+',
    weight: '1 kg',
    price: 2200,
    fromPrice: true,
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#ffffff' }, { name: 'Red', hex: '#ff0000' }],
    stock: 'in' as const,
    stockLeft: 45,
    imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=600&auto=format&fit=crop',
    isNew: true,
  },
  {
    href: '/product/numakers-petg',
    title: 'Numakers PETG Tough',
    material: 'PETG',
    weight: '1 kg',
    price: 2400,
    colors: [{ name: 'Black', hex: '#111111' }, { name: 'Gray', hex: '#cccccc' }],
    stock: 'low' as const,
    stockLeft: 3,
    imageUrl: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=600&auto=format&fit=crop',
  },
  {
    href: '/product/numakers-tpu',
    title: 'Numakers TPU 95A',
    material: 'TPU',
    weight: '1 kg',
    price: 3500,
    colors: [{ name: 'Black', hex: '#000000' }],
    stock: 'in' as const,
    stockLeft: 12,
    imageUrl: 'https://images.unsplash.com/photo-1531297172815-1a221f73752e?q=80&w=600&auto=format&fit=crop',
  },
  {
    href: '/product/numakers-abs',
    title: 'Numakers ABS Pro',
    material: 'ABS',
    weight: '1 kg',
    price: 2300,
    colors: [{ name: 'White', hex: '#ffffff' }],
    stock: 'out' as const,
    stockLeft: 0,
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop',
  },
]

export function ProductRecommendations() {
  return (
    <section className="bg-background py-32">
      <Container>
        <div className="mb-12 flex items-end justify-between border-b border-black/10 pb-6">
          <h2 className="text-3xl font-medium tracking-[-0.02em] md:text-4xl">
            You May Also Like
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {MOCK_RECOMMENDATIONS.map((product, idx) => (
            <FilamentCard key={idx} product={product} ratio="portrait" />
          ))}
        </div>
      </Container>
    </section>
  )
}

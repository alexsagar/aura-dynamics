'use client'

import React, { useState } from 'react'
import { Button } from '@/components/storefront/ui/Button'
import { useCart } from '@/providers/CartProvider'

export function ProductForm({ product }: { product: any }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants?.[0] || null
  )
  const [isAdding, setIsAdding] = useState(false)

  // Determine price based on selected variant or fallback to product base price
  const price = selectedVariant?.prices?.[0]?.amount 
    || product.prices?.[0]?.amount 
    || 0

  const handleAddToCart = async () => {
    setIsAdding(true)
    // Add item to global cart
    await addItem(product, quantity)
    
    // Simulate slight delay for UI feedback
    setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] font-medium leading-[1.1] tracking-[-0.02em]">
          {product.title}
        </h1>
        <p className="text-2xl font-medium tracking-[-0.02em] text-muted">
          Rs. {price.toFixed(2)}
        </p>
      </div>

      <div className="prose prose-lg text-muted">
        <p>{product.shortDescription}</p>
      </div>

      {/* Variants (Mocked for Colors/Materials based on Payload Schema) */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex flex-col gap-4">
          <span className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
            Select Option
          </span>
          <div className="flex flex-wrap gap-3">
            {product.variants.map((variant: any, idx: number) => {
              const isSelected = selectedVariant?.id === variant.id
              // Attempt to extract hexColor or colorFamily from options if available
              const optionData = variant.options?.[0]
              const hex = optionData?.hexColor
              
              return (
                <button
                  key={variant.id || idx}
                  onClick={() => setSelectedVariant(variant)}
                  className={`flex items-center gap-3 rounded-full border px-4 py-2 transition-all ${
                    isSelected ? 'border-black bg-black text-white' : 'border-black/10 bg-white hover:border-black/30'
                  }`}
                >
                  {hex && (
                    <span 
                      className="size-4 rounded-full shadow-inner border border-black/10" 
                      style={{ backgroundColor: hex }} 
                    />
                  )}
                  <span className="text-sm font-medium">
                    {variant.title || optionData?.colorFamily || `Variant ${idx + 1}`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center">
        <div className="flex h-14 items-center gap-4 rounded-full border border-black/10 bg-white px-6">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-2xl text-muted transition-colors hover:text-black"
          >
            -
          </button>
          <span className="min-w-[32px] text-center text-lg font-medium">
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="text-2xl text-muted transition-colors hover:text-black"
          >
            +
          </button>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          className="h-14 flex-1 text-lg"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted">
        <p className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-lime"></span>
          In Stock. Ready to ship.
        </p>
        <p>Free delivery inside Ring Road on orders over Rs. 5,000</p>
      </div>
    </div>
  )
}

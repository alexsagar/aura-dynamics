'use client'

import React from 'react'
import Link from 'next/link'
import { useCart } from '@/providers/CartProvider'
import { Container } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, cartTotal, isLoading } = useCart()

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background">
        <p className="text-muted">Loading cart...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background py-32 text-center">
        <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-black/5 text-muted">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3h2l3.6 7.6L7 14h10l3-8H6.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
        </div>
        <h1 className="mb-4 text-3xl font-medium tracking-[-0.02em]">Your cart is empty.</h1>
        <p className="mb-8 text-lg text-muted">Looks like you haven't added anything yet.</p>
        <Button as="a" href="/filaments" variant="primary" size="lg">
          Explore Products
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Container>
        <div className="mb-12 border-b border-black/10 pb-6">
          <h1 className="text-[clamp(2.5rem,4vw,4rem)] font-medium leading-[1] tracking-[-0.03em]">
            Your Cart.
          </h1>
        </div>

        <div className="grid gap-16 lg:grid-cols-[1fr_350px]">
          {/* Cart Items */}
          <div className="flex flex-col gap-8">
            {cartItems.map((item, index) => {
              // Handle populated product vs ID only
              const product = typeof item.product === 'object' ? item.product : null
              const productId = product ? product.id : item.product
              
              // Fallback to placeholder data if not fully populated
              const title = product?.title || `Product ${productId}`
              const price = product?.prices?.[0]?.amount || 0
              const image = product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=400&auto=format&fit=crop'

              return (
                <div key={`${productId}-${index}`} className="flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-center">
                  <Link href={`/product/${product?.slug || productId}`} className="aspect-square w-32 shrink-0 overflow-hidden rounded-2xl bg-black/5">
                    <img src={image} alt={title} className="size-full object-cover mix-blend-multiply" />
                  </Link>
                  
                  <div className="flex flex-1 flex-col justify-between md:flex-row md:items-center">
                    <div className="flex flex-col gap-1">
                      <Link href={`/product/${product?.slug || productId}`} className="text-xl font-medium tracking-[-0.02em] hover:underline">
                        {title}
                      </Link>
                      <span className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                        Rs. {price.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-6 md:mt-0">
                      <div className="flex items-center gap-4 rounded-full border border-black/10 bg-white px-4 py-2">
                        <button 
                          onClick={() => updateQuantity(productId, item.quantity - 1)}
                          className="text-xl font-medium text-muted transition-colors hover:text-black"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="min-w-[20px] text-center font-medium">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(productId, item.quantity + 1)}
                          className="text-xl font-medium text-muted transition-colors hover:text-black"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(productId)}
                        className="text-sm font-semibold text-red-500 hover:text-red-700 underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="relative">
            <div className="sticky top-32 flex flex-col gap-6 rounded-3xl border border-black/10 bg-[#f4f4f4] p-8">
              <h2 className="text-2xl font-medium tracking-[-0.02em]">Summary</h2>
              
              <div className="flex flex-col gap-4 border-b border-black/10 pb-6 text-lg">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">Rs. {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="font-medium text-black">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-medium tracking-[-0.02em]">
                <span>Total</span>
                <span>Rs. {cartTotal.toFixed(2)}</span>
              </div>

              <Button as="a" href="/checkout" variant="primary" size="lg" className="w-full mt-4">
                Proceed to Checkout
              </Button>

              <p className="mt-2 text-center text-sm text-muted">
                Taxes included. Secure payment powered by Stripe.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

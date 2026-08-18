'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/providers/CartProvider'
import { Button } from '@/components/storefront/ui/Button'

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, cartTotal, clearCart } = useCart()
  
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate order processing
    setTimeout(async () => {
      await clearCart()
      router.push('/checkout/success')
    }, 1500)
  }

  // Calculate totals
  const shipping = cartTotal > 5000 ? 0 : 150
  const finalTotal = cartTotal + shipping

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background py-32 text-center">
        <h1 className="mb-4 text-3xl font-medium tracking-[-0.02em]">Your cart is empty.</h1>
        <p className="mb-8 text-lg text-muted">You need items in your cart to checkout.</p>
        <Button as="a" href="/filaments" variant="primary" size="lg">
          Return to Shop
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Left Column: Forms */}
      <div className="flex w-full flex-col items-center justify-center border-r border-black/10 bg-white px-8 py-20 lg:w-3/5 lg:py-32">
        <div className="w-full max-w-[600px]">
          <div className="mb-12">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Aura.
            </Link>
          </div>

          <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-12">
            
            {/* Contact Info */}
            <section>
              <h2 className="mb-6 text-xl font-medium tracking-[-0.02em]">Contact Information</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black"
                  required
                />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="newsletter" className="size-4 rounded border-black/20 text-black" />
                  <label htmlFor="newsletter" className="text-sm text-muted">Email me with news and offers</label>
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="mb-6 text-xl font-medium tracking-[-0.02em]">Delivery</h2>
              <div className="flex flex-col gap-4">
                <select className="w-full rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black">
                  <option value="NP">Nepal</option>
                </select>
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First name" className="rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black" required />
                  <input type="text" placeholder="Last name" className="rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black" required />
                </div>

                <input type="text" placeholder="Address" className="rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black" required />
                <input type="text" placeholder="Apartment, suite, etc. (optional)" className="rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black" />
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="City" className="rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black" required />
                  <input type="text" placeholder="Postal code" className="rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black" required />
                </div>

                <input type="tel" placeholder="Phone" className="rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black" required />
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="mb-6 text-xl font-medium tracking-[-0.02em]">Payment</h2>
              <p className="mb-4 text-sm text-muted">All transactions are secure and encrypted.</p>
              
              <div className="flex flex-col overflow-hidden rounded-xl border border-black/20">
                <label className="flex cursor-pointer items-center gap-4 border-b border-black/10 bg-[#f4f4f4] p-4 transition-colors hover:bg-black/5">
                  <input type="radio" name="payment" value="card" className="size-4" defaultChecked />
                  <span className="font-medium">Credit card</span>
                </label>
                <div className="flex flex-col gap-4 bg-white p-4">
                  <input type="text" placeholder="Card number" className="rounded-xl border border-black/20 px-4 py-3 outline-none focus:border-black" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Expiration date (MM / YY)" className="rounded-xl border border-black/20 px-4 py-3 outline-none focus:border-black" />
                    <input type="text" placeholder="Security code" className="rounded-xl border border-black/20 px-4 py-3 outline-none focus:border-black" />
                  </div>
                  <input type="text" placeholder="Name on card" className="rounded-xl border border-black/20 px-4 py-3 outline-none focus:border-black" />
                </div>
                
                <label className="flex cursor-pointer items-center gap-4 border-t border-black/10 bg-[#f4f4f4] p-4 transition-colors hover:bg-black/5">
                  <input type="radio" name="payment" value="cod" className="size-4" />
                  <span className="font-medium">Cash on Delivery (COD)</span>
                </label>
              </div>
            </section>

          </form>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="sticky top-0 h-screen w-full bg-[#f4f4f4] px-8 py-20 lg:w-2/5 lg:px-12 lg:py-32">
        <div className="mx-auto w-full max-w-[420px]">
          <h2 className="mb-8 text-2xl font-medium tracking-[-0.02em]">Order Summary</h2>
          
          <div className="mb-8 flex flex-col gap-6">
            {cartItems.map((item, idx) => {
              const product = typeof item.product === 'object' ? item.product : null
              const productId = product ? product.id : item.product
              const title = product?.title || `Product ${productId}`
              const price = product?.prices?.[0]?.amount || 0
              const image = product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=400&auto=format&fit=crop'

              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white">
                    <img src={image} alt={title} className="size-full object-cover mix-blend-multiply" />
                    <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-xs text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-medium">{title}</span>
                    <span className="text-sm text-muted">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-medium">Rs. {(price * item.quantity).toFixed(2)}</span>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-4 border-y border-black/10 py-6 text-sm text-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-black">Rs. {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-black">
                {shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <span className="text-lg font-medium">Total</span>
            <span className="text-3xl font-medium tracking-[-0.02em]">Rs. {finalTotal.toFixed(2)}</span>
          </div>

          <Button 
            type="submit"
            form="checkout-form"
            variant="primary" 
            size="lg" 
            className="mt-8 w-full h-14"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing Order...' : 'Pay Now'}
          </Button>

          <p className="mt-4 text-center text-xs text-muted">
            By placing your order, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/providers/CartProvider'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'

export function CartSidebar() {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeItem, cartTotal } = useCart()
  const pathname = usePathname()

  // Close sidebar on route change
  useEffect(() => {
    closeCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out',
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-label="Cart"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <h2 className="text-xl font-medium tracking-[-0.02em]">Your Cart</h2>
          <div className="flex items-center gap-4">
            <Link 
              href="/cart" 
              className="text-sm font-semibold tracking-[0.1em] text-muted uppercase transition-colors hover:text-black"
              onClick={closeCart}
            >
              View Cart
            </Link>
            <button 
              onClick={closeCart}
              className="flex size-10 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Close cart"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-black/5 text-muted">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3h2l3.6 7.6L7 14h10l3-8H6.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
              </div>
              <p className="text-lg font-medium text-black">Your cart is empty.</p>
              <Button onClick={closeCart} variant="secondary" className="mt-6">Continue Shopping</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cartItems.map((item, idx) => {
                const product = typeof item.product === 'object' ? item.product : null
                const productId = product ? product.id : item.product
                const title = product?.title || `Product ${productId}`
                const price = product?.prices?.[0]?.amount || 0
                const image = product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=400&auto=format&fit=crop'

                return (
                  <div key={`${productId}-${idx}`} className="flex gap-4">
                    <Link href={`/product/${product?.slug || productId}`} className="aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-black/5" onClick={closeCart}>
                      <img src={image} alt={title} className="size-full object-cover mix-blend-multiply" />
                    </Link>
                    
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex flex-col">
                        <div className="flex justify-between gap-4">
                          <Link href={`/product/${product?.slug || productId}`} className="font-medium tracking-[-0.02em] hover:underline" onClick={closeCart}>
                            {title}
                          </Link>
                          <span className="font-medium">Rs. {(price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-[#f4f4f4] px-3 py-1">
                          <button 
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                            className="text-lg font-medium text-muted transition-colors hover:text-black"
                          >-</button>
                          <span className="min-w-[16px] text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            className="text-lg font-medium text-muted transition-colors hover:text-black"
                          >+</button>
                        </div>
                        <button 
                          onClick={() => removeItem(productId)}
                          className="text-sm font-semibold text-red-500 hover:text-red-700 underline"
                        >Remove</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-black/10 bg-[#f4f4f4] p-6">
            <div className="mb-6 flex justify-between text-xl font-medium tracking-[-0.02em]">
              <span>Subtotal</span>
              <span>Rs. {cartTotal.toFixed(2)}</span>
            </div>
            <p className="mb-4 text-xs text-muted">Shipping and taxes calculated at checkout.</p>
            <Button as="a" href="/checkout" variant="primary" size="lg" className="w-full h-14" onClick={closeCart}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

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
              type="button"
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
              {cartItems.map((item) => {
                const lineTotal = item.unitPrice * item.quantity
                const productHref = item.slug ? `/product/${item.slug}` : `/product/${item.productId}`

                return (
                  <div key={item.id} className="flex gap-4 border-b border-black/5 pb-6">
                    <Link
                      href={productHref}
                      className="aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-black/5"
                      onClick={closeCart}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="size-full object-cover mix-blend-multiply"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted text-xs">
                          No Image
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={productHref}
                            className="font-medium tracking-[-0.02em] hover:underline leading-snug"
                            onClick={closeCart}
                          >
                            {item.title}
                          </Link>
                          <span className="font-semibold text-sm whitespace-nowrap">
                            Rs. {lineTotal.toFixed(2)}
                          </span>
                        </div>
                        {item.color && (
                          <div className="flex items-center gap-2">
                            {item.hexColor && (
                              <span
                                className="size-3 rounded-full border border-black/10 inline-block"
                                style={{ backgroundColor: item.hexColor }}
                              />
                            )}
                            <span className="text-xs text-muted">{item.color}</span>
                          </div>
                        )}
                        <span className="text-xs text-muted">
                          Rs. {item.unitPrice.toFixed(2)} each
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-[#f4f4f4] px-3 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="text-lg font-medium text-muted transition-colors hover:text-black disabled:opacity-30 disabled:pointer-events-none"
                            aria-label={`Decrease quantity of ${item.title}`}
                          >
                            -
                          </button>
                          <span className="min-w-[16px] text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="text-lg font-medium text-muted transition-colors hover:text-black disabled:opacity-30 disabled:pointer-events-none"
                            aria-label={`Increase quantity of ${item.title}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 underline"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          Remove
                        </button>
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
            <div className="mb-4 flex justify-between text-xl font-medium tracking-[-0.02em]">
              <span>Subtotal</span>
              <span className="font-semibold">Rs. {cartTotal.toFixed(2)}</span>
            </div>
            <p className="mb-4 text-xs text-muted">Shipping and delivery calculated at checkout.</p>
            <Button
              as="a"
              href="/checkout"
              variant="primary"
              size="lg"
              className="w-full h-14"
              onClick={closeCart}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

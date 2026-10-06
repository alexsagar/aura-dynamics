'use client'

import React from 'react'
import Link from 'next/link'
import { useCart } from '@/providers/CartProvider'
import { Container } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, cartTotal, isLoading } = useCart()

  const [shippingConfig, setShippingConfig] = React.useState({
    shippingFee: 150,
    freeShippingThreshold: 5000,
    freeShippingEnabled: true,
  })

  React.useEffect(() => {
    fetch('/api/payment-settings')
      .then((res) => (res.ok ? (res.json() as Promise<any>) : null))
      .then((data: any) => {
        if (data?.shippingSettings) {
          setShippingConfig(data.shippingSettings)
        }
      })
      .catch(() => {})
  }, [])

  const shipping =
    shippingConfig.freeShippingEnabled && cartTotal >= shippingConfig.freeShippingThreshold
      ? 0
      : shippingConfig.shippingFee
  const estimatedTotal = cartTotal + shipping

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

        <div className="grid gap-16 lg:grid-cols-[1fr_360px]">
          {/* Cart Items List */}
          <div className="flex flex-col gap-6" data-testid="cart-items-list">
            {cartItems.map((item) => {
              const lineTotal = item.unitPrice * item.quantity
              const productHref = item.slug ? `/product/${item.slug}` : `/product/${item.productId}`

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-center"
                  data-testid={`cart-row-${item.id}`}
                >
                  <Link
                    href={productHref}
                    className="aspect-square w-28 shrink-0 overflow-hidden rounded-2xl bg-black/5"
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

                  <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-1.5">
                      <Link
                        href={productHref}
                        className="text-xl font-medium tracking-[-0.02em] hover:underline"
                      >
                        {item.title}
                      </Link>
                      {item.color && (
                        <div className="flex items-center gap-2">
                          {item.hexColor && (
                            <span
                              className="size-3.5 rounded-full border border-black/10 inline-block"
                              style={{ backgroundColor: item.hexColor }}
                            />
                          )}
                          <span className="text-sm text-muted">{item.color}</span>
                        </div>
                      )}
                      <span className="text-sm font-semibold tracking-[0.05em] text-muted">
                        Rs. {item.unitPrice.toFixed(2)} each
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center gap-4 rounded-full border border-black/10 bg-white px-4 py-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-xl font-medium text-muted transition-colors hover:text-black disabled:opacity-30 disabled:pointer-events-none"
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          -
                        </button>
                        <span
                          className="min-w-[24px] text-center font-medium"
                          data-testid={`cart-item-qty-${item.id}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="text-xl font-medium text-muted transition-colors hover:text-black disabled:opacity-30 disabled:pointer-events-none"
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="min-w-[100px] text-right">
                        <span className="text-lg font-semibold block">
                          Rs. {lineTotal.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 underline mt-1"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="relative">
            <div className="sticky top-32 flex flex-col gap-6 rounded-3xl border border-black/10 bg-[#f4f4f4] p-8">
              <h2 className="text-2xl font-medium tracking-[-0.02em]">Order Summary</h2>

              <div className="flex flex-col gap-4 border-b border-black/10 pb-6 text-base">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-black" data-testid="cart-subtotal">
                    Rs. {cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Estimated Delivery</span>
                  <span className="font-medium text-black">
                    {shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-medium tracking-[-0.02em]">
                <span>Total</span>
                <span className="font-bold text-foreground" data-testid="cart-grand-total">
                  Rs. {estimatedTotal.toFixed(2)}
                </span>
              </div>

              <Button
                as="a"
                href="/checkout"
                variant="primary"
                size="lg"
                className="w-full mt-4 h-14 text-base"
                data-testid="proceed-to-checkout-btn"
              >
                Proceed to Checkout
              </Button>

              <p className="mt-2 text-center text-xs text-muted">
                Prices in NPR. Real checkout totals verified on server.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

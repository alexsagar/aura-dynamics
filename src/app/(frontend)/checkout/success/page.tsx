import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'

export default function OrderSuccessPage() {
  // Generate a mock order number
  const orderNumber = `ORD-${Math.floor(Math.random() * 90000) + 10000}`

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f4f4]">
      {/* Minimal Header */}
      <header className="flex h-24 items-center justify-center border-b border-black/5 bg-white">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Aura.
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center py-24">
        <Container>
          <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 text-center shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)]">
            <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full bg-lime/20 text-lime">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h1 className="mb-4 text-4xl font-medium tracking-[-0.02em] md:text-5xl">
              Thank you for your order!
            </h1>
            
            <p className="mb-8 text-lg text-muted">
              We've received your order and will contact you as soon as your package is shipped. You can find your purchase information below.
            </p>

            <div className="mb-12 rounded-2xl bg-[#f4f4f4] p-6 text-left">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <span className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">Order Number</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">Status</span>
                <span className="flex items-center gap-2 font-medium text-amber-600">
                  <span className="size-2 rounded-full bg-amber-500"></span>
                  Processing
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button as="a" href="/filaments" variant="primary" size="lg" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
              <Button as="a" href="/account" variant="secondary" size="lg" className="w-full sm:w-auto">
                View Account
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}

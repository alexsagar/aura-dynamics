'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber') || 'AURA-ORD-SAMPLE'
  const amountRaw = searchParams.get('amount')
  const amount = amountRaw ? Number(amountRaw) : null
  const paymentMethod = searchParams.get('paymentMethod') || 'esewa_qr'
  const paymentStatus = searchParams.get('paymentStatus') || 'awaiting_verification'

  const isEsewa = paymentMethod === 'esewa_qr'

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 sm:p-12 text-center shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] border border-black/5">
      {/* Icon */}
      <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h1 className="mb-4 text-3xl font-medium tracking-[-0.02em] md:text-4xl text-foreground">
        Thank you for your order!
      </h1>

      <p className="mb-8 text-base sm:text-lg text-muted leading-relaxed" data-testid="success-message">
        {isEsewa
          ? 'Your order has been received and your payment is awaiting verification.'
          : 'Your order has been received as Cash on Delivery.'}
      </p>

      {/* Order Details Card */}
      <div className="mb-10 rounded-2xl bg-[#f8f9fa] border border-black/5 p-6 text-left text-sm">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <span className="text-xs font-semibold tracking-[0.1em] text-muted uppercase">
            Order Number
          </span>
          <span className="font-mono font-bold text-foreground text-base" data-testid="success-order-number">
            {orderNumber}
          </span>
        </div>

        {amount != null && (
          <div className="flex items-center justify-between border-b border-black/10 py-4">
            <span className="text-xs font-semibold tracking-[0.1em] text-muted uppercase">
              Amount
            </span>
            <span className="font-bold text-foreground text-base" data-testid="success-order-amount">
              Rs. {amount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-black/10 py-4">
          <span className="text-xs font-semibold tracking-[0.1em] text-muted uppercase">
            Payment Method
          </span>
          <span className="font-medium text-foreground" data-testid="success-payment-method">
            {isEsewa ? 'eSewa QR' : 'Cash on Delivery'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4">
          <span className="text-xs font-semibold tracking-[0.1em] text-muted uppercase">
            Payment Status
          </span>
          <span
            className={`inline-flex items-center gap-1.5 font-semibold text-xs rounded-full px-3 py-1 ${
              paymentStatus === 'paid'
                ? 'bg-emerald-50 text-emerald-700'
                : paymentStatus === 'awaiting_verification'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-700'
            }`}
            data-testid="success-payment-status"
          >
            <span
              className={`size-2 rounded-full ${
                paymentStatus === 'paid'
                  ? 'bg-emerald-500'
                  : paymentStatus === 'awaiting_verification'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
              }`}
            />
            {paymentStatus === 'awaiting_verification'
              ? 'Awaiting Verification'
              : paymentStatus === 'paid'
                ? 'Paid'
                : 'Unpaid'}
          </span>
        </div>
      </div>

      <div className="mb-10 text-xs text-muted leading-relaxed max-w-md mx-auto">
        {isEsewa ? (
          <p>
            Our administrator will verify the transaction code with eSewa shortly. You will receive an update once verified.
          </p>
        ) : (
          <p>
            Please have the exact cash ready when our delivery courier arrives at your address.
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <Button as="a" href="/filaments" variant="primary" size="lg" className="w-full sm:w-auto px-8">
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f4f4]">
      {/* Minimal Header */}
      <header className="flex h-20 items-center justify-center border-b border-black/5 bg-white">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Aura.
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center py-16 px-4">
        <Container>
          <Suspense
            fallback={
              <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 text-center text-muted">
                Loading order details...
              </div>
            }
          >
            <OrderSuccessContent />
          </Suspense>
        </Container>
      </div>
    </div>
  )
}

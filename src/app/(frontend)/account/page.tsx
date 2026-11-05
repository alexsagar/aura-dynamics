import React from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Container } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'
import { getCustomerOrders, type OrderSummary } from '@/lib/account-orders'
import { SignOutButton } from './SignOutButton'

export const metadata: Metadata = {
  title: 'Your account',
  robots: { index: false, follow: false },
}

// Per-customer data: always rendered per request (headers() also opts in), never prerendered or shared.
export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const payload = await getPayload({ config: configPromise })
  // Same cookie + CSRF rules as the REST API: only a valid customer session counts.
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.collection !== 'customers') redirect('/login')

  let orders: OrderSummary[] | null = null
  try {
    orders = await getCustomerOrders(payload, user)
  } catch {
    payload.logger.error({ msg: 'account: orders could not be loaded' })
  }

  const name = (user as { name?: string | null }).name || user.email?.split('@')[0]

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Container>
        <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-black/10 pb-10 md:mb-16 md:flex-row md:items-end">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">Dashboard</p>
            <h1 className="mt-2 text-4xl font-medium tracking-[-0.02em] break-words md:text-5xl">Hello, {name}</h1>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-16">
          <section aria-labelledby="order-history" className="min-w-0">
            <h2 id="order-history" className="mb-6 text-2xl font-medium tracking-[-0.02em]">
              Order History
            </h2>
            <OrderHistory orders={orders} />
          </section>

          <section aria-labelledby="account-details">
            <h2 id="account-details" className="mb-6 text-2xl font-medium tracking-[-0.02em]">
              Account Details
            </h2>
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <p className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">Email</p>
              <p className="mt-1 text-lg font-medium break-all">{user.email}</p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  )
}

function OrderHistory({ orders }: { orders: OrderSummary[] | null }) {
  if (orders === null) {
    return (
      <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        We couldn&apos;t load your orders right now. Please refresh the page or try again shortly.
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-12 text-center">
        <p className="text-lg text-muted">You haven&apos;t placed any orders yet.</p>
        <Button as="a" href="/filaments" variant="primary" className="mt-6">
          Start Shopping
        </Button>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-white">
      <li aria-hidden className="hidden grid-cols-[1.4fr_1fr_1fr_auto] gap-6 bg-[#f4f4f4] px-6 py-3 text-sm font-semibold text-muted md:grid">
        <span>Order</span>
        <span>Date</span>
        <span>Status</span>
        <span className="text-right">Total</span>
      </li>
      {orders.map((order) => (
        <li key={order.id} className="grid gap-3 px-5 py-5 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center md:gap-6 md:px-6">
          <div className="min-w-0">
            <p className="font-medium break-all">{order.reference}</p>
            <p className="mt-1 flex min-w-0 gap-1 text-sm text-muted">
              <span className="truncate">{order.firstItem ?? 'Items unavailable'}</span>
              {order.itemCount > 0 && (
                <span className="shrink-0">· {order.itemCount === 1 ? '1 item' : `${order.itemCount} items`}</span>
              )}
            </p>
          </div>
          <p className="text-sm text-muted md:text-base">
            <span className="md:sr-only">Placed </span>
            {order.date}
          </p>
          <p>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${order.status.className}`}>
              {order.status.label}
            </span>
          </p>
          <p className="font-medium md:text-right">
            {order.amount ?? <span className="text-sm font-normal text-muted">Amount unavailable</span>}
          </p>
        </li>
      ))}
    </ul>
  )
}

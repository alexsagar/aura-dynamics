import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Container } from '@/components/storefront/layout/Container'
import { getCustomerOrder, parseOrderId } from '@/lib/account-orders'

export const metadata: Metadata = {
  title: 'Order details',
  robots: { index: false, follow: false },
}

// Private, per-customer data: rendered per request, never prerendered or shared.
export const dynamic = 'force-dynamic'

const label = 'text-sm font-semibold tracking-[0.1em] text-muted uppercase'
const card = 'rounded-2xl border border-black/10 bg-white p-6'

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.collection !== 'customers') redirect('/login')

  const id = parseOrderId((await params).id)
  // Missing, malformed, guest and other customers' orders all get the same 404.
  const order = id === null ? null : await getCustomerOrder(payload, user, id)
  if (!order) notFound()

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Container>
        <Link href="/account" className="text-sm font-semibold text-muted hover:text-black">
          ← Back to order history
        </Link>

        <div className="mt-6 mb-10 flex flex-col gap-4 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className={label}>Order</p>
            <h1 className="mt-2 text-3xl font-medium tracking-[-0.02em] break-all md:text-4xl">
              {order.reference}
            </h1>
            <p className="mt-2 text-muted">Placed {order.date}</p>
          </div>
          <span
            className={`inline-flex self-start rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset md:self-auto ${order.status.className}`}
          >
            {order.status.label}
          </span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
          <section aria-labelledby="items" className="min-w-0">
            <h2 id="items" className="mb-6 text-2xl font-medium tracking-[-0.02em]">
              Items
            </h2>
            <ul className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
              {order.lines.length === 0 && (
                <li className="px-6 py-5 text-muted">
                  Item details are unavailable for this order.
                </li>
              )}
              {order.lines.map((line, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 md:px-6"
                >
                  <div className="min-w-0">
                    <p className="font-medium break-words">{line.product || 'Item'}</p>
                    {line.variant && (
                      <p className="mt-1 text-sm text-muted break-words">{line.variant}</p>
                    )}
                    <p className="mt-1 text-sm text-muted">
                      Qty {line.quantity}
                      {line.unitPrice && ` × ${line.unitPrice}`}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium sm:text-right">
                    {line.lineTotal ?? (
                      <span className="text-sm font-normal text-muted">Price unavailable</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
            {!order.hasPrices && order.lines.length > 0 && (
              <p className="mt-3 text-sm text-muted">
                Purchase prices weren&apos;t recorded for this order. Contact us if you need a
                breakdown.
              </p>
            )}
          </section>

          <div className="flex flex-col gap-6">
            <section aria-labelledby="summary" className={card}>
              <h2 id="summary" className={label}>
                Summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row term="Subtotal" value={order.subtotal} />
                <Row term="Shipping" value={order.shipping} />
                <div className="flex justify-between gap-4 border-t border-black/10 pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>
                    {order.total ?? (
                      <span className="text-sm font-normal text-muted">Unavailable</span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="payment" className={card}>
              <h2 id="payment" className={label}>
                Payment
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row term="Method" value={order.payment.method} />
                <Row term="Status" value={order.payment.status} />
              </dl>
            </section>

            <section aria-labelledby="delivery" className={card}>
              <h2 id="delivery" className={label}>
                Delivery
              </h2>
              {order.delivery ? (
                <address className="mt-4 text-sm leading-relaxed not-italic break-words">
                  {order.delivery.name && (
                    <span className="block font-medium">{order.delivery.name}</span>
                  )}
                  {order.delivery.address.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                  {order.delivery.phone && (
                    <span className="mt-2 block text-muted">{order.delivery.phone}</span>
                  )}
                </address>
              ) : (
                <p className="mt-4 text-sm text-muted">No delivery details recorded.</p>
              )}
            </section>

            <p className="text-sm text-muted">
              Questions about this order? Email{' '}
              <a
                href="mailto:support@printwithaura.com"
                className="font-semibold text-black hover:underline"
              >
                support@printwithaura.com
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}

function Row({ term, value }: { term: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{term}</dt>
      <dd className="text-right">{value ?? <span className="text-muted">Unavailable</span>}</dd>
    </div>
  )
}

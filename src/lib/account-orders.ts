import type { Payload, TypedUser } from 'payload'
import { formatNPR } from '../components/storefront/commerce/Price'

/** Stored order statuses (plugin-ecommerce). No shipped/delivered states exist. */
export const ORDER_STATUS = {
  processing: { label: 'Processing', className: 'bg-amber-50 text-amber-900 ring-amber-200' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-900 ring-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-zinc-100 text-zinc-700 ring-zinc-300' },
  refunded: { label: 'Refunded', className: 'bg-sky-50 text-sky-900 ring-sky-200' },
} as const

export const statusOf = (status: unknown) =>
  ORDER_STATUS[status as keyof typeof ORDER_STATUS] ?? { label: 'Unknown', className: 'bg-zinc-100 text-zinc-700 ring-zinc-300' }

export const orderReference = (order: { orderNumber?: string | null; id: number | string }) =>
  order.orderNumber?.trim() || `#${order.id}`

/** A missing total is shown as unavailable, never as Rs. 0; a stored 0 is a real zero. */
export const formatOrderAmount = (amount: unknown) => (typeof amount === 'number' ? formatNPR(amount) : null)

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kathmandu' })

/** Only what the order list renders: no idempotency key, payment reference, address or customer fields. */
export type OrderSummary = {
  id: number | string
  reference: string
  date: string
  status: { label: string; className: string }
  firstItem: string | null
  itemCount: number
  amount: string | null
}

type OrderDoc = {
  id: number | string
  orderNumber?: string | null
  createdAt: string
  status?: string | null
  amount?: number | null
  itemsSnapshot?: unknown
  items?: { product?: unknown; variant?: unknown; quantity?: number | null }[] | null
}

const titleOf = (rel: unknown) => (rel && typeof rel === 'object' && 'title' in rel ? String((rel as { title: unknown }).title ?? '') : '')

export function summarizeOrder(order: OrderDoc): OrderSummary {
  // Checkout orders carry an immutable snapshot of what was bought; Admin-created ones only the relations.
  const snapshot = Array.isArray(order.itemsSnapshot)
    ? (order.itemsSnapshot as { title?: unknown; variantTitle?: unknown; quantity?: unknown }[])
    : []
  const lines = snapshot.length
    ? snapshot.map((s) => ({ title: String(s.title ?? ''), variant: String(s.variantTitle ?? ''), quantity: Number(s.quantity) || 0 }))
    : (order.items ?? []).map((it) => ({ title: titleOf(it.product), variant: titleOf(it.variant), quantity: Number(it.quantity) || 0 }))
  const first = lines.find((l) => l.title)
  return {
    id: order.id,
    reference: orderReference(order),
    date: dateFormat.format(new Date(order.createdAt)),
    status: statusOf(order.status),
    // Variant titles are often already "Product — Colour"; don't repeat the product name.
    firstItem: first
      ? !first.variant || first.variant === first.title
        ? first.title
        : first.variant.startsWith(first.title)
          ? first.variant
          : `${first.title} — ${first.variant}`
      : null,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    amount: formatOrderAmount(order.amount),
  }
}

export const ORDERS_PER_PAGE = 10

/** `?page=` from the URL: a positive whole number, anything else is page 1. */
export function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || !/^\d{1,6}$/.test(value)) return 1
  return Math.max(1, Number(value))
}

export type OrderPage = { orders: OrderSummary[]; page: number; totalPages: number; totalDocs: number }

/**
 * One page of the signed-in customer's own orders, newest first (id breaks
 * createdAt ties so pages are stable). Runs as that user with overrideAccess:
 * false, so Payload's orders read access (admin or document owner) decides
 * what is returned; the where clause only narrows it further. Guest orders
 * (no customer) never match.
 */
export async function getCustomerOrders(payload: Payload, user: TypedUser, page = 1): Promise<OrderPage> {
  const result = await payload.find({
    collection: 'orders',
    where: { customer: { equals: user.id } },
    sort: ['-createdAt', '-id'],
    limit: ORDERS_PER_PAGE,
    page,
    depth: 1,
    user,
    overrideAccess: false,
    select: { orderNumber: true, createdAt: true, status: true, amount: true, itemsSnapshot: true, items: true },
  })
  return {
    orders: result.docs.map((d) => summarizeOrder(d as unknown as OrderDoc)),
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
  }
}

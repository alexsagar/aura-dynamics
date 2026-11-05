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
  ORDER_STATUS[status as keyof typeof ORDER_STATUS] ?? {
    label: 'Unknown',
    className: 'bg-zinc-100 text-zinc-700 ring-zinc-300',
  }

export const orderReference = (order: { orderNumber?: string | null; id: number | string }) =>
  order.orderNumber?.trim() || `#${order.id}`

/** A missing total is shown as unavailable, never as Rs. 0; a stored 0 is a real zero. */
export const formatOrderAmount = (amount: unknown) =>
  typeof amount === 'number' ? formatNPR(amount) : null

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kathmandu',
})

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

const titleOf = (rel: unknown) =>
  rel && typeof rel === 'object' && 'title' in rel
    ? String((rel as { title: unknown }).title ?? '')
    : ''

export function summarizeOrder(order: OrderDoc): OrderSummary {
  // Checkout orders carry an immutable snapshot of what was bought; Admin-created ones only the relations.
  const snapshot = Array.isArray(order.itemsSnapshot)
    ? (order.itemsSnapshot as { title?: unknown; variantTitle?: unknown; quantity?: unknown }[])
    : []
  const lines = snapshot.length
    ? snapshot.map((s) => ({
        title: String(s.title ?? ''),
        variant: String(s.variantTitle ?? ''),
        quantity: Number(s.quantity) || 0,
      }))
    : (order.items ?? []).map((it) => ({
        title: titleOf(it.product),
        variant: titleOf(it.variant),
        quantity: Number(it.quantity) || 0,
      }))
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

/** Variant titles are often "Product — Colour"; return just the part after the product name. */
const variantOnly = (product: string, variant: string) => {
  if (!variant || variant === product) return ''
  return variant.startsWith(product)
    ? variant.slice(product.length).replace(/^[\s—–-]+/, '')
    : variant
}

const PAYMENT_METHOD: Record<string, string> = { cod: 'Cash on Delivery', esewa_qr: 'eSewa QR' }

/** Wording follows the stored payment status only; nothing is called paid unless it is `paid`. */
export function paymentStatusLabel(method: unknown, status: unknown): string {
  if (status === 'unpaid') return method === 'cod' ? 'Pay on Delivery' : 'Unpaid'
  if (status === 'awaiting_verification') return 'Awaiting verification'
  if (status === 'paid') return 'Paid'
  if (status === 'refunded') return 'Refunded'
  return 'Not recorded'
}

export type OrderLine = {
  product: string
  variant: string
  quantity: number
  unitPrice: string | null
  lineTotal: string | null
}

export type OrderDetail = {
  id: number | string
  reference: string
  date: string
  status: { label: string; className: string }
  lines: OrderLine[]
  /** False for orders without a checkout snapshot (e.g. created in Admin): no historical prices exist. */
  hasPrices: boolean
  subtotal: string | null
  shipping: string | null
  total: string | null
  payment: { method: string; status: string }
  delivery: { name: string; address: string[]; phone: string } | null
}

type DetailDoc = OrderDoc & {
  customer?: unknown
  subtotal?: number | null
  shipping?: number | null
  paymentMethod?: string | null
  paymentStatus?: string | null
  shippingAddress?: Record<string, string | null | undefined> | null
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

export function orderDetail(order: DetailDoc): OrderDetail {
  const snapshot = Array.isArray(order.itemsSnapshot)
    ? (order.itemsSnapshot as Record<string, unknown>[])
    : []
  // Historical prices come only from the checkout snapshot, never from current catalogue prices.
  const lines: OrderLine[] = snapshot.length
    ? snapshot.map((s) => {
        const product = text(s.title)
        return {
          product,
          variant: variantOnly(product, text(s.variantTitle)),
          quantity: Number(s.quantity) || 0,
          unitPrice: formatOrderAmount(s.unitPrice),
          lineTotal: formatOrderAmount(s.lineTotal),
        }
      })
    : (order.items ?? []).map((it): OrderLine => {
        const product = titleOf(it.product)
        return {
          product,
          variant: variantOnly(product, titleOf(it.variant)),
          quantity: Number(it.quantity) || 0,
          unitPrice: null,
          lineTotal: null,
        }
      })
  const a = order.shippingAddress ?? {}
  const name = [text(a.firstName), text(a.lastName)].filter(Boolean).join(' ')
  const address = [
    text(a.addressLine1),
    text(a.addressLine2),
    [text(a.city), text(a.state)].filter(Boolean).join(', '),
    text(a.country),
  ].filter(Boolean)
  return {
    id: order.id,
    reference: orderReference(order),
    date: dateFormat.format(new Date(order.createdAt)),
    status: statusOf(order.status),
    lines,
    hasPrices: snapshot.length > 0,
    subtotal: formatOrderAmount(order.subtotal),
    shipping: order.shipping === 0 ? 'Free' : formatOrderAmount(order.shipping),
    total: formatOrderAmount(order.amount),
    payment: {
      method: PAYMENT_METHOD[order.paymentMethod ?? ''] ?? 'Not recorded',
      status: paymentStatusLabel(order.paymentMethod, order.paymentStatus),
    },
    delivery: name || address.length ? { name, address, phone: text(a.phone) } : null,
  }
}

const ownerId = (customer: unknown) =>
  customer && typeof customer === 'object' ? (customer as { id?: unknown }).id : customer

/**
 * One of the signed-in customer's own orders, or null. Payload's read access
 * (overrideAccess: false, as this user) decides visibility, so another
 * customer's order, a guest order and a missing id all look the same (null);
 * the owner check below is a second, explicit guard.
 */
export async function getCustomerOrder(
  payload: Payload,
  user: TypedUser,
  id: number,
): Promise<OrderDetail | null> {
  const doc = (await payload.findByID({
    collection: 'orders',
    id,
    depth: 1,
    user,
    overrideAccess: false,
    disableErrors: true,
  })) as unknown as DetailDoc | null
  if (!doc || String(ownerId(doc.customer)) !== String(user.id)) return null
  return orderDetail(doc)
}

/** Route segment `[id]`: a positive integer id, anything else is "not found". */
export function parseOrderId(raw: string): number | null {
  return /^[1-9]\d{0,9}$/.test(raw) ? Number(raw) : null
}

export const ORDERS_PER_PAGE = 10

/** `?page=` from the URL: a positive whole number, anything else is page 1. */
export function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || !/^\d{1,6}$/.test(value)) return 1
  return Math.max(1, Number(value))
}

export type OrderPage = {
  orders: OrderSummary[]
  page: number
  totalPages: number
  totalDocs: number
}

/**
 * One page of the signed-in customer's own orders, newest first (id breaks
 * createdAt ties so pages are stable). Runs as that user with overrideAccess:
 * false, so Payload's orders read access (admin or document owner) decides
 * what is returned; the where clause only narrows it further. Guest orders
 * (no customer) never match.
 */
export async function getCustomerOrders(
  payload: Payload,
  user: TypedUser,
  page = 1,
): Promise<OrderPage> {
  const result = await payload.find({
    collection: 'orders',
    where: { customer: { equals: user.id } },
    sort: ['-createdAt', '-id'],
    limit: ORDERS_PER_PAGE,
    page,
    depth: 1,
    user,
    overrideAccess: false,
    select: {
      orderNumber: true,
      createdAt: true,
      status: true,
      amount: true,
      itemsSnapshot: true,
      items: true,
    },
  })
  return {
    orders: result.docs.map((d) => summarizeOrder(d as unknown as OrderDoc)),
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
  }
}

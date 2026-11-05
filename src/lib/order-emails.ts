import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { CollectionAfterChangeHook, Payload } from 'payload'
import { formatNPR } from '../components/storefront/commerce/Price'
import { siteUrl } from './email'
import { emailLayout } from './email-templates'

export type ConfirmationOrder = {
  orderNumber: string
  paymentMethod: 'cod' | 'esewa_qr'
  subtotal: number
  shipping: number
  total: number
  items: { title: string; variantTitle: string; quantity: number; lineTotal: number }[]
  /** Signed-in customer: link to their account, where orders are listed. */
  hasAccount: boolean
}

// Matches the order's paymentStatus at creation: COD is 'unpaid', eSewa QR is 'awaiting_verification'.
const PAYMENT_TEXT: Record<ConfirmationOrder['paymentMethod'], { label: string; note: string }> = {
  cod: { label: 'Pay on Delivery', note: 'Please have the total ready when your order arrives.' },
  esewa_qr: {
    label: 'eSewa QR (awaiting verification)',
    note: "We'll verify your eSewa payment and confirm once it's checked. Your order isn't marked as paid until then.",
  },
}

export function orderConfirmationEmail(order: ConfirmationOrder, site = siteUrl()) {
  const payment = PAYMENT_TEXT[order.paymentMethod]
  const itemLabel = (it: ConfirmationOrder['items'][number]) =>
    `${it.variantTitle && it.variantTitle !== it.title ? `${it.title} — ${it.variantTitle}` : it.title} × ${it.quantity}`
  return {
    subject: `Your Aura order ${order.orderNumber}`,
    html: emailLayout({
      heading: 'Thanks, we have your order',
      paragraphs: [`Order reference: ${order.orderNumber}`, `Payment: ${payment.label}. ${payment.note}`],
      rows: [
        ...order.items.map((it) => ({ label: itemLabel(it), value: formatNPR(it.lineTotal) })),
        { label: 'Subtotal', value: formatNPR(order.subtotal) },
        { label: 'Shipping', value: order.shipping > 0 ? formatNPR(order.shipping) : 'Free' },
        { label: 'Total', value: formatNPR(order.total), strong: true },
      ],
      action: order.hasAccount && site ? { label: 'View your account', url: `${site}/account` } : undefined,
      footnote: "We'll be in touch when your order status changes. Reply to this email if anything looks wrong.",
    }),
  }
}

/**
 * Best-effort: queued with waitUntil so the request never waits on, or fails
 * because of, the email provider. Never throws. The Aura adapter applies the
 * staging allowlist and logs the delivery outcome (without addresses).
 */
function scheduleEmail(payload: Payload, kind: string, build: () => { to: string; subject: string; html: string }): void {
  try {
    const sending = Promise.resolve()
      .then(() => payload.sendEmail(build()))
      .catch(() => payload.logger.error({ msg: `email: ${kind} could not be sent` }))
    let waitUntil: ((p: Promise<unknown>) => void) | undefined
    try {
      const { ctx } = getCloudflareContext()
      waitUntil = ctx?.waitUntil?.bind(ctx)
    } catch {
      // No Workers request context (local scripts/tests): the promise still runs.
    }
    waitUntil?.(sending)
  } catch {
    payload.logger.error({ msg: `email: ${kind} could not be scheduled` })
  }
}

export function scheduleOrderConfirmation(payload: Payload, to: string, order: ConfirmationOrder): void {
  scheduleEmail(payload, 'order confirmation', () => ({ to, ...orderConfirmationEmail(order) }))
}

type StatusOrder = {
  orderNumber?: string | null
  id: number | string
  amount?: number | null
  itemsSnapshot?: { title?: string | null; variantTitle?: string | null; quantity?: number | null }[] | null
  hasAccount: boolean
}

const STATUS_TEXT = {
  cancelled: {
    heading: 'Your order has been cancelled',
    body: 'This order has been cancelled and will not be fulfilled.',
    note: "If you've already made a payment or think this is a mistake, reply to this email and we'll help.",
  },
  completed: {
    heading: 'Your order has been completed',
    body: 'Your order has been completed. Thank you for ordering from Aura.',
    note: 'Questions about your order? Reply to this email.',
  },
} as const

export type NotifiedStatus = keyof typeof STATUS_TEXT

export function orderStatusEmail(status: NotifiedStatus, order: StatusOrder, site = siteUrl()) {
  const text = STATUS_TEXT[status]
  const reference = order.orderNumber || `#${order.id}`
  const items = order.itemsSnapshot ?? []
  return {
    subject: `Aura order ${reference}: ${status}`,
    html: emailLayout({
      heading: text.heading,
      paragraphs: [`Order reference: ${reference}`, text.body],
      rows: [
        ...items.map((it) => ({
          label: `${it.variantTitle && it.variantTitle !== it.title ? `${it.title} — ${it.variantTitle}` : (it.title ?? 'Item')} × ${it.quantity ?? 1}`,
          value: '',
        })),
        ...(typeof order.amount === 'number' ? [{ label: 'Order total', value: formatNPR(order.amount), strong: true }] : []),
      ],
      action: order.hasAccount && site ? { label: 'View your account', url: `${site}/account` } : undefined,
      footnote: text.note,
    }),
  }
}

/**
 * Orders afterChange: email the customer when an existing order moves into
 * `cancelled` or `completed`. Runs only after Payload's update succeeded (D1
 * has no transactions here, so the row is already written); a failed save or a
 * cancel that lost the race (409 in releaseInventoryOnCancel) never gets here.
 * Re-saves with an unchanged status and order creation send nothing.
 */
export const notifyOrderStatusChange: CollectionAfterChangeHook = ({ doc, previousDoc, operation, req }) => {
  const status = doc?.status as string
  if (operation !== 'update' || previousDoc?.status === status) return doc
  if (status !== 'cancelled' && status !== 'completed') return doc
  const to = typeof doc.customerEmail === 'string' ? doc.customerEmail.trim() : ''
  if (!to) return doc // e.g. an Admin-created order without a customer email
  scheduleEmail(req.payload, `order ${status} notice`, () => ({
    to,
    ...orderStatusEmail(status, { ...doc, hasAccount: Boolean(doc.customer) }),
  }))
  return doc
}

import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { Payload } from 'payload'
import { formatNPR } from '@/components/storefront/commerce/Price'
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
 * Best-effort: queued with waitUntil so checkout never waits on, or fails
 * because of, the email provider. Never throws. The Aura adapter applies the
 * staging allowlist and logs the delivery outcome (without addresses).
 */
export function scheduleOrderConfirmation(payload: Payload, to: string, order: ConfirmationOrder): void {
  try {
    const { subject, html } = orderConfirmationEmail(order)
    const sending = Promise.resolve()
      .then(() => payload.sendEmail({ to, subject, html }))
      .catch(() => payload.logger.error({ msg: 'email: order confirmation could not be sent' }))
    let waitUntil: ((p: Promise<unknown>) => void) | undefined
    try {
      const { ctx } = getCloudflareContext()
      waitUntil = ctx?.waitUntil?.bind(ctx)
    } catch {
      // No Workers request context (local scripts/tests): the promise still runs.
    }
    waitUntil?.(sending)
  } catch {
    payload.logger.error({ msg: 'email: order confirmation could not be scheduled' })
  }
}

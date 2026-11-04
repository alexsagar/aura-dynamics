import { APIError, type CollectionBeforeChangeHook } from 'payload'

/**
 * Order cancellation releases reserved stock exactly once.
 *
 * Checkout decrements `variants.inventory` when it creates an order (and is
 * the only writer of `idempotencyKey`). When an admin moves such an order from
 * `processing` to `cancelled`, the ordered quantities are added back.
 *
 * - Only checkout-created orders release stock: an order without an
 *   idempotencyKey (e.g. created by hand in Admin) never reserved any.
 * - Only `processing -> cancelled` releases, whatever the payment status
 *   (unpaid, awaiting verification, paid before fulfilment). Completed or
 *   refunded orders were fulfilled; their stock is not returned automatically.
 * - `cancelled` is terminal, so cancel -> reopen -> cancel cannot restore twice.
 * - Atomic: one D1 batch (a single transaction) restores each line only while
 *   the order is still `processing`, then flips it to `cancelled`. A concurrent
 *   cancel runs after that commit, changes nothing and gets a 409.
 * Order updates are admin-only (plugin access), so only admins can trigger it.
 */
export const releaseInventoryOnCancel: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (operation !== 'update' || !originalDoc) return data

  const prev = originalDoc.status
  const next = data?.status ?? prev

  if (prev === 'cancelled' && next !== 'cancelled') {
    throw new APIError('Cancelled orders cannot be reopened. Create a new order instead.', 400)
  }
  if (prev !== 'processing' || next !== 'cancelled') return data

  const orderId = originalDoc.id
  const d1 = (req.payload.db as any).binding as D1Database
  const statements: D1PreparedStatement[] = []
  // Only checkout-created orders reserved stock; others just get the guarded status flip.
  for (const item of originalDoc.idempotencyKey ? (originalDoc.items ?? []) : []) {
    const variantId = typeof item?.variant === 'object' ? item.variant?.id : item?.variant
    const qty = Math.floor(Number(item?.quantity))
    if (!variantId || !(qty > 0)) continue
    statements.push(
      d1
        .prepare(
          'UPDATE `variants` SET `inventory` = `inventory` + ? WHERE `id` = ? AND EXISTS (SELECT 1 FROM `orders` WHERE `id` = ? AND `status` = ?)',
        )
        .bind(qty, variantId, orderId, 'processing'),
    )
  }
  statements.push(d1.prepare('UPDATE `orders` SET `status` = ? WHERE `id` = ? AND `status` = ?').bind('cancelled', orderId, 'processing'))
  const results = await d1.batch(statements) // D1 batch = one transaction, executed in order
  // A concurrent request already cancelled it. Stop here: D1 has no transactions,
  // so letting Payload rewrite the order's item rows as well races the winner's
  // rewrite and fails with a duplicate-key 500.
  if (results.at(-1)?.meta?.changes === 0) {
    throw new APIError('This order was already cancelled by another request.', 409)
  }
  return data
}

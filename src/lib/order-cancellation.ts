import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { sql } from '@payloadcms/db-d1-sqlite'

/**
 * Order cancellation releases reserved stock exactly once.
 *
 * Checkout decrements `variants.inventory` when an order is created. When an
 * admin moves an order from `processing` to `cancelled`, the ordered quantities
 * are added back. Guarantees:
 * - Only `processing -> cancelled` releases stock (completed/refunded orders
 *   were fulfilled; their stock is not returned automatically).
 * - `cancelled` is terminal, so cancel -> reopen -> cancel cannot restore twice.
 * - The status flip is a conditional UPDATE, so two concurrent cancel saves
 *   see exactly one row change and only that one releases stock.
 */
export const releaseInventoryOnCancel: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (operation !== 'update' || !originalDoc) return data

  const prev = originalDoc.status
  const next = data?.status ?? prev

  if (prev === 'cancelled' && next !== 'cancelled') {
    throw new APIError('Cancelled orders cannot be reopened. Create a new order instead.', 400)
  }
  if (prev !== 'processing' || next !== 'cancelled') return data

  const db = (req.payload.db as any).drizzle
  const flip: any = await db.run(
    sql`UPDATE \`orders\` SET \`status\` = 'cancelled' WHERE \`id\` = ${originalDoc.id} AND \`status\` = 'processing'`,
  )
  if ((flip?.meta?.changes ?? flip?.changes ?? 0) !== 1) return data // another save already cancelled it

  for (const item of originalDoc.items ?? []) {
    const variantId = typeof item?.variant === 'object' ? item.variant?.id : item?.variant
    const qty = Math.floor(Number(item?.quantity))
    if (!variantId || !(qty > 0)) continue
    await db.run(sql`UPDATE \`variants\` SET \`inventory\` = \`inventory\` + ${qty} WHERE \`id\` = ${variantId}`)
  }
  return data
}

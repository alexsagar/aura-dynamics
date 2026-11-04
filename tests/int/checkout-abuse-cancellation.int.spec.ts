import { describe, it, expect, vi } from 'vitest'

import { CHECKOUT_LIMITS, checkoutLimitsError } from '@/lib/checkout-limits'
import { releaseInventoryOnCancel } from '@/lib/order-cancellation'

describe('checkout input limits (audit lead: COD inventory exhaustion)', () => {
  const item = (quantity: number) => ({ productId: 1, variantId: 1, quantity })

  it('accepts a normal order', () => {
    expect(checkoutLimitsError({ fullName: 'Asha', orderNotes: 'Call first' }, [item(2)])).toBeNull()
  })

  it('caps units per line', () => {
    expect(checkoutLimitsError({}, [item(CHECKOUT_LIMITS.MAX_QTY_PER_LINE)])).toBeNull()
    expect(checkoutLimitsError({}, [item(CHECKOUT_LIMITS.MAX_QTY_PER_LINE + 1)])).toMatch(/Maximum/)
  })

  it('caps line count and stored string length', () => {
    expect(checkoutLimitsError({}, Array.from({ length: CHECKOUT_LIMITS.MAX_LINES + 1 }, () => item(1)))).toMatch(/Too many items/)
    expect(checkoutLimitsError({ orderNotes: 'x'.repeat(1001) }, [item(1)])).toMatch(/orderNotes is too long/)
    expect(checkoutLimitsError({ address: 'x'.repeat(301) }, [item(1)])).toMatch(/address is too long/)
  })
})

describe('order cancellation releases stock exactly once', () => {
  const order = { id: 7, status: 'processing', items: [{ variant: 2, quantity: 3 }, { variant: { id: 5 }, quantity: 1 }] }

  // flipChanges = rows changed by the conditional status UPDATE (1 = this save won the cancel).
  const setup = (flipChanges: number) => {
    const run = vi.fn().mockResolvedValueOnce({ meta: { changes: flipChanges } }).mockResolvedValue({ meta: { changes: 1 } })
    const req = { payload: { db: { drizzle: { run } } } }
    return { run, req }
  }
  const call = (req: any, originalDoc: any, status: string) =>
    (releaseInventoryOnCancel as any)({ data: { status }, originalDoc, operation: 'update', req })

  it('processing -> cancelled flips status once and restores every line', async () => {
    const { run, req } = setup(1)
    await call(req, order, 'cancelled')
    expect(run).toHaveBeenCalledTimes(1 + order.items.length)
  })

  it('a concurrent second cancel (flip changed 0 rows) restores nothing', async () => {
    const { run, req } = setup(0)
    await call(req, order, 'cancelled')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('re-saving an already cancelled order restores nothing', async () => {
    const { run, req } = setup(1)
    await call(req, { ...order, status: 'cancelled' }, 'cancelled')
    expect(run).not.toHaveBeenCalled()
  })

  it('cancelled orders cannot be reopened (prevents cancel/reopen/cancel double restore)', async () => {
    const { req } = setup(1)
    await expect(call(req, { ...order, status: 'cancelled' }, 'processing')).rejects.toThrow(/cannot be reopened/)
  })

  it('completed or refunded orders are not restocked automatically', async () => {
    const { run, req } = setup(1)
    await call(req, { ...order, status: 'completed' }, 'cancelled')
    await call(req, order, 'refunded')
    expect(run).not.toHaveBeenCalled()
  })
})

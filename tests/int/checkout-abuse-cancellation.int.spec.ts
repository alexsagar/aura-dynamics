import { describe, it, expect, vi } from 'vitest'

import { CHECKOUT_LIMITS, checkoutLimitsError } from '@/lib/checkout-limits'
import { releaseInventoryOnCancel } from '@/lib/order-cancellation'

describe('checkout input limits (audit lead: COD inventory exhaustion)', () => {
  const item = (quantity: number) => ({ productId: 1, variantId: 1, quantity })

  it('defaults: 10 per line, 30 per order', () => {
    expect(CHECKOUT_LIMITS.MAX_QTY_PER_LINE).toBe(10)
    expect(CHECKOUT_LIMITS.MAX_UNITS_PER_ORDER).toBe(30)
  })

  it('accepts a normal order', () => {
    expect(checkoutLimitsError({ fullName: 'Asha', orderNotes: 'Call first' }, [item(2)])).toBeNull()
  })

  it('caps units per line', () => {
    expect(checkoutLimitsError({}, [item(10)])).toBeNull()
    expect(checkoutLimitsError({}, [item(11)])).toMatch(/Maximum 10 units per item/)
  })

  it('caps total units per order (20 lines x 10 would otherwise reserve 200)', () => {
    expect(checkoutLimitsError({}, [item(10), item(10), item(10)])).toBeNull()
    expect(checkoutLimitsError({}, [item(10), item(10), item(10), item(1)])).toMatch(/Maximum 30 units per order/)
    expect(checkoutLimitsError({}, Array.from({ length: 20 }, () => item(10)))).toMatch(/Maximum 30 units per order/)
  })

  it('accepts only whole-unit quantities from 1 to the line cap', () => {
    const bad = (quantity: unknown) => checkoutLimitsError({}, [{ productId: 1, variantId: 1, quantity }])
    expect(bad(1)).toBeNull()
    expect(bad(10)).toBeNull()
    expect(bad(11)).toMatch(/Maximum 10 units per item/)
    for (const q of [0, -1, 1.5, '1', 'abc', null, undefined, NaN, Infinity]) {
      expect(bad(q)).toMatch(/whole number of at least 1/)
    }
  })

  it('wholesale limits are configurable', () => {
    expect(checkoutLimitsError({}, [item(50)], { MAX_QTY_PER_LINE: 100, MAX_UNITS_PER_ORDER: 500 })).toBeNull()
  })

  it('caps line count and stored string length', () => {
    expect(checkoutLimitsError({}, Array.from({ length: CHECKOUT_LIMITS.MAX_LINES + 1 }, () => item(1)))).toMatch(/Too many items/)
    expect(checkoutLimitsError({ orderNotes: 'x'.repeat(1001) }, [item(1)])).toMatch(/orderNotes is too long/)
    expect(checkoutLimitsError({ address: 'x'.repeat(301) }, [item(1)])).toMatch(/address is too long/)
  })
})

describe('order cancellation stock release (unit; atomicity is verified end to end on D1)', () => {
  const order = {
    id: 7,
    status: 'processing',
    idempotencyKey: 'checkout-key-1',
    items: [{ variant: 2, quantity: 3 }, { variant: { id: 5 }, quantity: 1 }],
  }
  const setup = () => {
    const prepare = vi.fn((q: string) => ({ bind: (...params: unknown[]) => ({ q, params }) }))
    const batch = vi.fn().mockResolvedValue([])
    return { prepare, batch, req: { payload: { db: { binding: { prepare, batch } } } } }
  }
  const call = (req: any, originalDoc: any, status: string) =>
    (releaseInventoryOnCancel as any)({ data: { status }, originalDoc, operation: 'update', req })

  it('processing -> cancelled issues one atomic batch: each line restore, then the status flip', async () => {
    const { batch, req } = setup()
    await call(req, order, 'cancelled')
    expect(batch).toHaveBeenCalledTimes(1)
    expect(batch.mock.calls[0][0]).toHaveLength(order.items.length + 1)
  })

  it('applies to any payment status while processing', async () => {
    for (const paymentStatus of ['unpaid', 'awaiting_verification', 'paid']) {
      const { batch, req } = setup()
      await call(req, { ...order, paymentStatus }, 'cancelled')
      expect(batch).toHaveBeenCalledTimes(1)
    }
  })

  it('orders that never reserved stock (no checkout idempotencyKey) release nothing', async () => {
    const { batch, req } = setup()
    await call(req, { ...order, idempotencyKey: null }, 'cancelled')
    expect(batch).not.toHaveBeenCalled()
  })

  it('re-saving an already cancelled order releases nothing', async () => {
    const { batch, req } = setup()
    await call(req, { ...order, status: 'cancelled' }, 'cancelled')
    expect(batch).not.toHaveBeenCalled()
  })

  it('cancelled orders cannot be reopened', async () => {
    const { req } = setup()
    await expect(call(req, { ...order, status: 'cancelled' }, 'processing')).rejects.toThrow(/cannot be reopened/)
  })

  it('completed or refunded orders are not restocked automatically', async () => {
    const { batch, req } = setup()
    await call(req, { ...order, status: 'completed' }, 'cancelled')
    await call(req, order, 'refunded')
    expect(batch).not.toHaveBeenCalled()
  })
})

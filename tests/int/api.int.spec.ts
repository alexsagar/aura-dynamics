// @vitest-environment node
// Every test that needs a real Payload on local D1 lives in this one file: separate
// files run in parallel and contend for the same local database.
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, beforeEach, afterAll, afterEach, expect, vi } from 'vitest'

let payload: Payload

beforeAll(async () => {
  const payloadConfig = await config
  payload = await getPayload({ config: payloadConfig })
})

describe('API', () => {
  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})

// Order status emails through the real orders collection and hooks on local D1.
describe('order status notifications', () => {
  let variant: { id: number; inventory: number }
  const created: (number | string)[] = []
  let send: ReturnType<typeof vi.spyOn>
  const settle = () => new Promise((r) => setTimeout(r, 20))
  const update = (id: number | string, data: any) => payload.update({ collection: 'orders', id, data, overrideAccess: true })
  const statusMails = () => send.mock.calls.map((c: any[]) => c[0]).filter((m: any) => /^Aura order /.test(m.subject))

  const makeOrder = async (over: any = {}) => {
    const doc: any = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        orderNumber: `AURA-TEST-${created.length}-${Date.now()}`,
        status: 'processing',
        amount: 2650,
        currency: 'NPR',
        customerEmail: 'buyer@example.invalid',
        items: [{ product: (variant as any).product, variant: variant.id, quantity: 2 }],
        itemsSnapshot: [{ productId: 1, variantId: variant.id, title: 'PLA <b>', variantTitle: 'White', unitPrice: 1250, quantity: 2, lineTotal: 2500 }],
        ...over,
      } as any,
    })
    created.push(doc.id)
    return doc
  }
  const inventory = async () => ((await payload.findByID({ collection: 'variants', id: variant.id, overrideAccess: true, depth: 0 })) as any).inventory

  const fixtures: [string, number | string][] = []
  // Own fixtures: CI starts from an empty, freshly migrated database.
  const fixture = async (collection: any, data: any) => {
    const doc: any = await payload.create({ collection, data, overrideAccess: true, draft: false })
    fixtures.unshift([collection, doc.id])
    return doc
  }
  beforeAll(async () => {
    const tag = Date.now()
    const type = await fixture('variantTypes', { label: 'Status Test Colour', name: `status-test-${tag}` })
    const option = await fixture('variantOptions', { label: 'White', value: `white-${tag}`, variantType: type.id })
    const product = await fixture('products', {
      title: `Status Test ${tag}`,
      productType: 'filament',
      priceInNPR: 1250,
      enableVariants: true,
      variantTypes: [type.id],
      _status: 'published',
    })
    const v = await fixture('variants', { title: 'White', product: product.id, inventory: 20, options: [option.id], _status: 'published' })
    variant = { id: v.id, inventory: v.inventory, product: product.id } as any
  })
  beforeEach(() => {
    send = vi.spyOn(payload, 'sendEmail').mockResolvedValue('sent' as any)
  })
  afterEach(() => send.mockRestore())
  afterAll(async () => {
    for (const id of created) await payload.delete({ collection: 'orders', id, overrideAccess: true })
    for (const [collection, id] of fixtures) await payload.delete({ collection: collection as any, id, overrideAccess: true })
  })

  it('creating an order sends no status email', async () => {
    await makeOrder()
    await settle()
    expect(statusMails()).toHaveLength(0)
  })

  it('processing -> cancelled sends one email and restores stock once; re-saving cancelled sends none', async () => {
    const order = await makeOrder({ idempotencyKey: `test-${crypto.randomUUID()}` })
    const before = await inventory()
    await update(order.id, { status: 'cancelled' })
    await update(order.id, { status: 'cancelled' })
    await update(order.id, { orderNotes: 'edited after cancel' })
    await settle()
    expect(await inventory()).toBe(before + 2)
    const mails = statusMails()
    expect(mails).toHaveLength(1)
    expect(mails[0].to).toBe('buyer@example.invalid')
    expect(mails[0].subject).toBe(`Aura order ${order.orderNumber}: cancelled`)
    expect(mails[0].html).toContain('Your order has been cancelled')
    expect(mails[0].html).toContain('PLA &lt;b&gt; — White × 2')
    expect(mails[0].html).not.toMatch(/refund/i)
    const saved: any = await payload.findByID({ collection: 'orders', id: order.id, overrideAccess: true, depth: 0 })
    expect(saved.items).toHaveLength(1)
  })

  it('a cancel that lost the concurrent race (409) sends nothing and restores nothing', async () => {
    const order = await makeOrder({ idempotencyKey: `test-${crypto.randomUUID()}` })
    const before = await inventory()
    // The local D1 binding is a proxy, so wrap it for this one update. Simulates the
    // winning request committing first: our guarded statements then change nothing.
    const db = payload.db as any
    const d1 = db.binding
    db.binding = {
      prepare: (q: string) => d1.prepare(q),
      batch: async (stmts: any[]) => {
        await d1.prepare('UPDATE `orders` SET `status` = ? WHERE `id` = ?').bind('cancelled', order.id).run()
        return d1.batch(stmts)
      },
    }
    try {
      await expect(update(order.id, { status: 'cancelled' })).rejects.toMatchObject({ status: 409 })
    } finally {
      db.binding = d1
    }
    await settle()
    expect(statusMails()).toHaveLength(0)
    expect(await inventory()).toBe(before)
  })

  it('a failed update (reopening a cancelled order) sends nothing', async () => {
    const order = await makeOrder()
    await update(order.id, { status: 'cancelled' })
    await settle()
    send.mockClear()
    await expect(update(order.id, { status: 'processing' })).rejects.toThrow(/cannot be reopened/)
    await settle()
    expect(statusMails()).toHaveLength(0)
  })

  it('admin-created order (no idempotency key) gets a cancel email but no stock change', async () => {
    const order = await makeOrder()
    const before = await inventory()
    await update(order.id, { status: 'cancelled' })
    await settle()
    expect(statusMails()).toHaveLength(1)
    expect(await inventory()).toBe(before)
  })

  it('no recipient, no email', async () => {
    const order = await makeOrder({ customerEmail: null })
    await update(order.id, { status: 'completed' })
    await settle()
    expect(statusMails()).toHaveLength(0)
  })

  it('processing -> completed sends one; re-save none; completed -> processing -> completed sends again (documented)', async () => {
    const order = await makeOrder()
    await update(order.id, { status: 'completed' })
    await update(order.id, { status: 'completed' })
    await update(order.id, { orderNotes: 'note' })
    await settle()
    expect(statusMails()).toHaveLength(1)
    expect(statusMails()[0].html).toContain('Your order has been completed')
    expect(statusMails()[0].html).not.toMatch(/shipped|delivered|out for delivery/i)
    await update(order.id, { status: 'processing' })
    await update(order.id, { status: 'completed' })
    await settle()
    expect(statusMails()).toHaveLength(2)
  })

  it('refunded and payment-status changes send nothing', async () => {
    const order = await makeOrder()
    await update(order.id, { paymentStatus: 'paid' })
    await update(order.id, { status: 'refunded' })
    await settle()
    expect(statusMails()).toHaveLength(0)
  })

  it('provider failure does not fail the update and is logged without details', async () => {
    send.mockRejectedValue(new Error('provider down buyer@example.invalid'))
    const error = vi.spyOn(payload.logger, 'error')
    const order = await makeOrder()
    await expect(update(order.id, { status: 'completed' })).resolves.toMatchObject({ status: 'completed' })
    await settle()
    expect(error).toHaveBeenCalledWith({ msg: 'email: order completed notice could not be sent' })
    expect(JSON.stringify(error.mock.calls)).not.toContain('buyer@example.invalid')
    error.mockRestore()
  })
})

// Account order history: Payload access control decides what a customer sees.
describe('customer order history', () => {
  const ids: { customers: (number | string)[]; orders: (number | string)[] } = { customers: [], orders: [] }
  let a: any, b: any

  const customer = async (tag: string) => {
    const doc: any = await payload.create({
      collection: 'customers',
      overrideAccess: true,
      data: { email: `history-${tag}-${Date.now()}@example.invalid`, password: `P-${crypto.randomUUID()}`, name: tag } as any,
    })
    ids.customers.push(doc.id)
    return { ...doc, collection: 'customers' }
  }
  const order = async (data: any) => {
    const doc: any = await payload.create({ collection: 'orders', overrideAccess: true, data: { currency: 'NPR', status: 'processing', ...data } })
    ids.orders.push(doc.id)
    return doc
  }

  beforeAll(async () => {
    a = await customer('a')
    b = await customer('b')
    await order({ customer: a.id, orderNumber: 'AURA-ORD-HIST-A1', amount: 2650, idempotencyKey: `k-${crypto.randomUUID()}`, paymentReference: 'secret-ref',
      itemsSnapshot: [{ title: 'Numakers PLA', variantTitle: 'Pure White', quantity: 2 }, { title: 'Numakers PLA', variantTitle: 'Black', quantity: 1 }] })
    await order({ customer: a.id, amount: null, status: 'completed' }) // Admin-created shape: no number, no amount
    await order({ customer: b.id, orderNumber: 'AURA-ORD-HIST-B1', amount: 999 })
    await order({ customer: null, customerEmail: a.email, orderNumber: 'AURA-ORD-HIST-GUEST', amount: 111 }) // guest order, same email as A
  })

  afterAll(async () => {
    for (const id of ids.orders) await payload.delete({ collection: 'orders', id, overrideAccess: true })
    for (const id of ids.customers) await payload.delete({ collection: 'customers', id, overrideAccess: true })
  })

  it('returns only the signed-in customer’s own orders: not other customers’, not guest orders with the same email', async () => {
    const { getCustomerOrders } = await import('@/lib/account-orders')
    const refsA = (await getCustomerOrders(payload, a)).orders.map((o) => o.reference)
    expect(refsA).toHaveLength(2)
    expect(refsA).toContain('AURA-ORD-HIST-A1')
    expect(refsA).not.toContain('AURA-ORD-HIST-B1')
    expect(refsA).not.toContain('AURA-ORD-HIST-GUEST')
    expect((await getCustomerOrders(payload, b)).orders.map((o) => o.reference)).toEqual(['AURA-ORD-HIST-B1'])
  })

  it('paginates 10 per page, newest first, stable, scoped to the customer', async () => {
    const { getCustomerOrders } = await import('@/lib/account-orders')
    const c = await customer('pages')
    // 12 orders sharing one createdAt: the id tie-breaker must keep pages stable and disjoint.
    const createdAt = new Date().toISOString()
    for (let i = 1; i <= 12; i++) await order({ customer: c.id, orderNumber: `AURA-ORD-PAGE-${String(i).padStart(2, '0')}`, amount: i, createdAt })
    const p1 = await getCustomerOrders(payload, c, 1)
    const p2 = await getCustomerOrders(payload, c, 2)
    expect(p1).toMatchObject({ page: 1, totalPages: 2, totalDocs: 12 })
    expect(p1.orders).toHaveLength(10)
    expect(p2.orders).toHaveLength(2)
    const all = [...p1.orders, ...p2.orders].map((o) => o.reference)
    expect(new Set(all).size).toBe(12)
    expect(all[0]).toBe('AURA-ORD-PAGE-12')
    expect(all[11]).toBe('AURA-ORD-PAGE-01')
    expect((await getCustomerOrders(payload, c, 3)).orders).toHaveLength(0)
    expect((await getCustomerOrders(payload, a, 1)).totalDocs).toBe(2)
  })

  it('access control, not the where clause, enforces ownership', async () => {
    const forged = await payload.find({ collection: 'orders', where: { customer: { equals: b.id } }, user: a, overrideAccess: false })
    expect(forged.docs).toHaveLength(0)
  })

  it('summaries use amount, fall back to #id, label status, count items and carry no private fields', async () => {
    const { getCustomerOrders } = await import('@/lib/account-orders')
    const { orders } = await getCustomerOrders(payload, a)
    const checkout = orders.find((o) => o.reference === 'AURA-ORD-HIST-A1')!
    const admin = orders.find((o) => o.reference.startsWith('#'))!
    expect(checkout).toMatchObject({ amount: 'Rs. 2,650', itemCount: 3, firstItem: 'Numakers PLA — Pure White', status: { label: 'Processing' } })
    expect(admin).toMatchObject({ amount: null, status: { label: 'Completed' } })
    expect(admin.reference).toBe(`#${admin.id}`)
    expect(JSON.stringify(orders)).not.toMatch(/secret-ref|idempotency|example\.invalid|k-[0-9a-f]{8}/)
  })
})

// Payload 3.92.1's supported reset flow (no email is sent: local mode).
describe('customer password reset', () => {
  const email = `reset-flow-${Date.now()}@example.invalid`
  const oldPassword = `Old-${crypto.randomUUID()}`
  let id: number | string
  // Payload's minRequestInterval between reset requests for one account.
  const waitForResetInterval = () => new Promise((r) => setTimeout(r, 15_100))

  beforeAll(async () => {
    const doc = await payload.create({ collection: 'customers', data: { email, password: oldPassword, name: 'Reset Flow' } as any })
    id = doc.id
  })

  afterAll(async () => {
    if (id) await payload.delete({ collection: 'customers', id })
  })

  it('forgot-password goes through the Aura adapter without logging the token or address', async () => {
    const spies = (['info', 'warn', 'error'] as const).map((l) => vi.spyOn(payload.logger, l))
    const token = await payload.forgotPassword({ collection: 'customers', data: { email } })
    expect(typeof token).toBe('string')
    const logged = JSON.stringify(spies.map((s) => s.mock.calls))
    expect(logged).not.toContain(token as string)
    expect(logged).not.toContain(email)
    expect(logged).toContain('email: local environment, not sent')
    spies.forEach((s) => s.mockRestore())
  })

  it('unknown email returns the same empty result (no account enumeration)', async () => {
    await expect(payload.forgotPassword({ collection: 'customers', data: { email: 'nobody@example.invalid' } })).resolves.toBeNull()
  })

  it('token resets once, cannot be reused, and ends earlier sessions', async () => {
    const before = await payload.login({ collection: 'customers', data: { email, password: oldPassword } })
    await waitForResetInterval()
    const token = (await payload.forgotPassword({ collection: 'customers', data: { email } })) as string
    const newPassword = `New-${crypto.randomUUID()}`

    await payload.resetPassword({ collection: 'customers', data: { token, password: newPassword }, overrideAccess: true })
    await expect(
      payload.resetPassword({ collection: 'customers', data: { token, password: `Again-${crypto.randomUUID()}` }, overrideAccess: true }),
    ).rejects.toMatchObject({ status: 403 })

    const doc: any = await payload.findByID({ collection: 'customers', id, overrideAccess: true, showHiddenFields: true })
    expect(doc.sessions?.map((s: any) => s.id) ?? []).not.toContain((before.user as any)._sid)
    await expect(payload.login({ collection: 'customers', data: { email, password: oldPassword } })).rejects.toBeTruthy()
    await expect(payload.login({ collection: 'customers', data: { email, password: newPassword } })).resolves.toBeTruthy()
  }, 30_000)

  it('expired token is rejected', async () => {
    await waitForResetInterval()
    const token = (await payload.forgotPassword({ collection: 'customers', data: { email } })) as string
    await payload.update({
      collection: 'customers',
      id,
      data: { resetPasswordExpiration: new Date(Date.now() - 1000).toISOString() } as any,
      overrideAccess: true,
    })
    await expect(
      payload.resetPassword({ collection: 'customers', data: { token, password: `X-${crypto.randomUUID()}` }, overrideAccess: true }),
    ).rejects.toMatchObject({ status: 403 })
  }, 30_000)
})

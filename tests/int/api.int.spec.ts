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

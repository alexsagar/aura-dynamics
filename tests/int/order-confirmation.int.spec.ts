// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Checkout route harness: a fake Payload with one product and two variants. ---
const state = {
  inventory: {} as Record<number, number>,
  existingOrder: null as any,
  createError: null as any,
  replayAfterRace: null as any,
  user: null as any,
  sendEmail: vi.fn(),
  waitUntil: vi.fn(),
  created: [] as any[],
}

const product = { id: 1, title: 'Numakers PLA <b>', _status: 'published', productType: 'filament', priceInNPR: 2500 }
const variants: Record<number, any> = {
  7: { id: 7, title: 'Pure White', product: 1, _status: 'published', inventory: 10, priceInNPREnabled: false },
  8: { id: 8, title: 'Matte Black', product: 1, _status: 'published', inventory: 5, priceInNPREnabled: true, priceInNPR: 3000 },
}

const fakePayload = {
  auth: async () => ({ user: state.user }),
  find: vi.fn(async () => ({ docs: state.replayAfterRace && state.createError ? [state.replayAfterRace] : state.existingOrder ? [state.existingOrder] : [] })),
  findGlobal: async () => ({ shippingSettings: { shippingFee: 150, freeShippingEnabled: false } }),
  findByID: async ({ collection, id }: any) => {
    if (collection === 'products') return product
    const v = variants[id]
    if (!v) throw new Error('not found')
    return { ...v, inventory: state.inventory[id] }
  },
  create: vi.fn(async ({ data }: any) => {
    if (state.createError) throw state.createError
    state.created.push(data)
    return { id: 100 + state.created.length, ...data }
  }),
  sendEmail: (m: any) => state.sendEmail(m),
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  db: {
    drizzle: {
      // The route issues only `inventory - qty WHERE id AND inventory >= qty` and `inventory + qty WHERE id`.
      run: async ({ op, values: [qty, id] }: { op: '-' | '+'; values: number[] }) => {
        if (op === '-') {
          if ((state.inventory[id] ?? 0) < qty) return { meta: { changes: 0 } }
          state.inventory[id] -= qty
        } else {
          state.inventory[id] += qty
        }
        return { meta: { changes: 1 } }
      },
    },
  },
}

vi.mock('payload', async (orig) => ({ ...(await orig<any>()), getPayload: async () => fakePayload }))
vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('@/lib/rate-limit', () => ({ checkoutRateLimited: async () => false }))
vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: () => ({ ctx: { waitUntil: state.waitUntil } }) }))
vi.mock('@payloadcms/db-d1-sqlite', () => ({
  sql: (strings: TemplateStringsArray, ...values: number[]) => ({ op: strings[0].includes(' - ') ? '-' : '+', values }),
}))

const { POST } = await import('@/app/api/checkout/route')
const { orderConfirmationEmail } = await import('@/lib/order-emails')
const { sendSafely } = await import('@/lib/email')

const body = (over: any = {}) => ({
  idempotencyKey: `key-${Math.random().toString(36).slice(2)}`,
  paymentMethod: 'cod',
  customer: { fullName: 'Test <script>', phone: '9800000000', email: 'buyer@example.com', address: 'Somewhere', city: 'Kathmandu' },
  items: [
    { productId: 1, variantId: 7, quantity: 2 },
    { productId: 1, variantId: 8, quantity: 1 },
  ],
  ...over,
})
const post = (b: any) => POST(new Request('http://localhost/api/checkout', { method: 'POST', body: JSON.stringify(b) }))
const flush = () => Promise.all(state.waitUntil.mock.calls.map((c) => c[0]))

beforeEach(() => {
  Object.assign(state, { inventory: { 7: 10, 8: 5 }, existingOrder: null, createError: null, replayAfterRace: null, user: null, created: [] })
  state.sendEmail = vi.fn().mockResolvedValue('sent')
  state.waitUntil = vi.fn()
  fakePayload.create.mockClear()
})

describe('order confirmation email from checkout', () => {
  it('a new order sends exactly one confirmation, via waitUntil, to the checkout email', async () => {
    const res = await post(body())
    expect(res.status).toBe(200)
    await flush()
    expect(state.waitUntil).toHaveBeenCalledTimes(1)
    expect(state.sendEmail).toHaveBeenCalledTimes(1)
    const msg = state.sendEmail.mock.calls[0][0]
    expect(msg.to).toBe('buyer@example.com')
    expect(msg.subject).toMatch(/^Your Aura order AURA-ORD-/)
  })

  it('totals in the email match the order: line totals, subtotal, shipping, NPR total', async () => {
    await post(body())
    await flush()
    const html: string = state.sendEmail.mock.calls[0][0].html
    const order = state.created[0]
    expect(order.subtotal).toBe(2 * 2500 + 3000)
    expect(order.amount).toBe(8000 + 150)
    for (const s of ['Rs. 5,000', 'Rs. 3,000', 'Rs. 8,000', 'Rs. 150', 'Rs. 8,150', 'Pay on Delivery']) expect(html).toContain(s)
    expect(html).toContain(order.orderNumber)
  })

  it('idempotent replay sends nothing', async () => {
    state.existingOrder = { id: 5, customer: null, orderNumber: 'AURA-ORD-OLD' }
    const res = await post(body())
    expect(res.status).toBe(200)
    expect(fakePayload.create).not.toHaveBeenCalled()
    expect(state.sendEmail).not.toHaveBeenCalled()
    expect(state.waitUntil).not.toHaveBeenCalled()
  })

  it('duplicate-key race returns the existing order and sends nothing', async () => {
    state.createError = new Error('UNIQUE constraint failed: orders.idempotency_key')
    state.replayAfterRace = { id: 9, customer: null, orderNumber: 'AURA-ORD-RACE' }
    const res = await post(body())
    expect(res.status).toBe(200)
    expect(state.sendEmail).not.toHaveBeenCalled()
    expect(state.inventory).toEqual({ 7: 10, 8: 5 })
  })

  it('validation failure, stock failure and order-creation failure send nothing', async () => {
    expect((await post(body({ customer: { ...body().customer, email: 'nope' } }))).status).toBe(400)
    expect((await post(body({ items: [{ productId: 1, variantId: 7, quantity: 1.5 }] }))).status).toBe(400)
    state.inventory[8] = 0
    expect((await post(body()))).toHaveProperty('status', 400)
    state.inventory[8] = 5
    state.createError = new Error('D1 unavailable')
    expect((await post(body())).status).toBe(500)
    expect(state.inventory).toEqual({ 7: 10, 8: 5 })
    expect(state.sendEmail).not.toHaveBeenCalled()
    expect(state.waitUntil).not.toHaveBeenCalled()
  })

  it('losing the stock reservation race returns 409, rolls back earlier lines and sends nothing', async () => {
    const realRun = fakePayload.db.drizzle.run
    // Validation saw stock for variant 8, but another checkout took it before our UPDATE.
    fakePayload.db.drizzle.run = async (q) => (q.op === '-' && q.values[1] === 8 ? { meta: { changes: 0 } } : realRun(q))
    const res = await post(body())
    fakePayload.db.drizzle.run = realRun
    expect(res.status).toBe(409)
    expect(state.inventory).toEqual({ 7: 10, 8: 5 })
    expect(fakePayload.create).not.toHaveBeenCalled()
    expect(state.sendEmail).not.toHaveBeenCalled()
  })

  it('provider failure keeps the order and its stock reservation', async () => {
    state.sendEmail = vi.fn().mockRejectedValue(new Error('provider down'))
    const res = await post(body())
    await flush()
    expect(res.status).toBe(200)
    expect(state.created).toHaveLength(1)
    expect(state.inventory).toEqual({ 7: 8, 8: 4 })
    expect(fakePayload.logger.error).toHaveBeenCalledWith({ msg: 'email: order confirmation could not be sent' })
  })

  it('signed-in customers get an account link; guests do not', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.printwithaura.com')
    await post(body())
    state.user = { collection: 'customers', id: 3 }
    await post(body())
    await flush()
    const [guest, member] = state.sendEmail.mock.calls.map((c) => c[0].html as string)
    expect(guest).not.toContain('/account')
    expect(member).toContain('href="https://staging.printwithaura.com/account"')
    vi.unstubAllEnvs()
  })
})

describe('order confirmation content', () => {
  const order = {
    orderNumber: 'AURA-ORD-X',
    paymentMethod: 'esewa_qr' as const,
    subtotal: 2500,
    shipping: 0,
    total: 2500,
    items: [{ title: 'PLA <img src=x onerror=alert(1)>', variantTitle: '"White" & co', quantity: 1, lineTotal: 2500 }],
    hasAccount: false,
  }

  it('eSewa says awaiting verification and never claims payment succeeded', () => {
    const { html } = orderConfirmationEmail(order, 'https://x.test')
    expect(html).toContain('awaiting verification')
    expect(html).not.toMatch(/\bpaid\b(?! until)|payment (received|successful|complete)/i)
    expect(html).toContain('Free')
  })

  it('escapes product and variant names', () => {
    const { html } = orderConfirmationEmail(order, 'https://x.test')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('PLA &lt;img src=x onerror=alert(1)&gt;')
    expect(html).toContain('&quot;White&quot; &amp; co')
  })

  it('contains no address, phone or customer name', async () => {
    await post(body())
    await flush()
    const html: string = state.sendEmail.mock.calls[0][0].html
    for (const s of ['Somewhere', '9800000000', 'Test &lt;script&gt;', 'buyer@example.com']) expect(html).not.toContain(s)
  })

  it('staging allowlist still applies to confirmations', async () => {
    const send = vi.fn()
    const { subject, html } = orderConfirmationEmail(order, 'https://x.test')
    const out = await sendSafely({ to: 'real@customer.com', subject, html }, { kind: 'allowlist', apiKey: 'k', allow: new Set(['qa@example.com']) }, send, {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })
    expect(out).toBe('dropped_recipient')
    expect(send).not.toHaveBeenCalled()
  })
})

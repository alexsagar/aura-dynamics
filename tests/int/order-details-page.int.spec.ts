// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

const state = { user: null as any, doc: null as any, headers: new Headers() }

vi.mock('next/headers', () => ({ headers: async () => state.headers }))
vi.mock('next/navigation', () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`)
  },
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
}))
vi.mock('@/payload.config', () => ({ default: {} }))
const fakePayload = {
  auth: vi.fn(async () => ({ user: state.user })),
  // findByID with access control: a non-owner gets null (disableErrors), like Payload.
  findByID: vi.fn(async ({ id, user, overrideAccess }: any) => {
    expect(overrideAccess).toBe(false)
    const doc = state.doc
    if (!doc || doc.id !== id) return null
    const owner = typeof doc.customer === 'object' ? doc.customer?.id : doc.customer
    return owner === user.id ? doc : null
  }),
  logger: { error: vi.fn() },
}
vi.mock('payload', async (orig) => ({ ...(await orig<any>()), getPayload: async () => fakePayload }))

const { default: Page, dynamic } = await import('@/app/(frontend)/account/orders/[id]/page')
const render = async (id: string) => renderToStaticMarkup(await Page({ params: Promise.resolve({ id }) }))

const customer = { id: 5, collection: 'customers', email: 'buyer@example.com' }
const checkoutOrder = (over: any = {}) => ({
  id: 7,
  customer: 5,
  orderNumber: 'AURA-ORD-D7',
  createdAt: '2026-11-05T09:10:00.000Z',
  status: 'processing',
  amount: 2650,
  subtotal: 2500,
  shipping: 150,
  paymentMethod: 'cod',
  paymentStatus: 'unpaid',
  paymentReference: 'ESEWA-SECRET-REF',
  idempotencyKey: 'idem-secret',
  shippingAddress: { firstName: 'Asha <b>', addressLine1: '<script>alert(1)</script>', city: 'Kathmandu', country: 'Nepal', phone: '9800000001' },
  itemsSnapshot: [{ title: 'Numakers PLA', variantTitle: 'Numakers PLA — Pure White', unitPrice: 2500, quantity: 1, lineTotal: 2500 }],
  ...over,
})

beforeEach(() => {
  state.user = customer
  state.doc = checkoutOrder()
  fakePayload.findByID.mockClear()
})

describe('/account/orders/[id]', () => {
  it('is always dynamic', () => {
    expect(dynamic).toBe('force-dynamic')
  })

  it('signed-out and admin sessions redirect to /login', async () => {
    state.user = null
    await expect(render('7')).rejects.toThrow('REDIRECT:/login')
    state.user = { id: 1, collection: 'users' }
    await expect(render('7')).rejects.toThrow('REDIRECT:/login')
    expect(fakePayload.findByID).not.toHaveBeenCalled()
  })

  it('malformed ids are 404 without querying', async () => {
    for (const id of ['abc', '0', '-1', '1.5', '7x', '00007', '99999999999']) await expect(render(id)).rejects.toThrow('NOT_FOUND')
    expect(fakePayload.findByID).not.toHaveBeenCalled()
  })

  it('another customer’s order, a guest order and a missing id give the same 404', async () => {
    state.doc = checkoutOrder({ customer: 6 })
    await expect(render('7')).rejects.toThrow('NOT_FOUND')
    state.doc = checkoutOrder({ customer: null })
    await expect(render('7')).rejects.toThrow('NOT_FOUND')
    state.doc = null
    await expect(render('7')).rejects.toThrow('NOT_FOUND')
    expect(fakePayload.findByID).toHaveBeenLastCalledWith(expect.objectContaining({ collection: 'orders', id: 7, user: customer, overrideAccess: false }))
  })

  it('shows the order: header, snapshot lines, totals, Pay on Delivery, delivery details and a way back', async () => {
    const html = await render('7')
    for (const s of ['AURA-ORD-D7', '5 Nov 2026', '>Processing<', 'Numakers PLA', '>Pure White<', 'Qty 1 × Rs. 2,500', 'Rs. 150', 'Rs. 2,650', 'Cash on Delivery', 'Pay on Delivery', 'Kathmandu', 'href="/account"'])
      expect(html).toContain(s)
  })

  it('eSewa awaiting verification is never shown as paid', async () => {
    state.doc = checkoutOrder({ paymentMethod: 'esewa_qr', paymentStatus: 'awaiting_verification' })
    const html = await render('7')
    expect(html).toContain('Awaiting verification')
    expect(html).not.toMatch(/>Paid</)
  })

  it('missing amounts and snapshot show unavailable states, never Rs. 0; free shipping is "Free"', async () => {
    state.doc = checkoutOrder({ orderNumber: null, amount: null, subtotal: null, shipping: null, itemsSnapshot: null, items: [{ product: { title: 'Numakers PLA' }, variant: { title: 'Numakers PLA — Black' }, quantity: 2 }] })
    let html = await render('7')
    expect(html).toContain('#7')
    expect(html).toContain('Price unavailable')
    expect(html).toContain('Purchase prices weren&#x27;t recorded')
    expect(html).not.toContain('Rs. 0')
    expect(html).toContain('>Black<')
    state.doc = checkoutOrder({ shipping: 0 })
    html = await render('7')
    expect(html).toContain('>Free<')
  })

  it('escapes customer-supplied strings and leaves out payment reference and idempotency key', async () => {
    const html = await render('7')
    expect(html).not.toContain('<script>alert(1)')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('Asha &lt;b&gt;')
    expect(html).not.toMatch(/ESEWA-SECRET-REF|idem-secret/)
  })
})

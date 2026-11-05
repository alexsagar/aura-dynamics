// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

const state = { user: null as any, orders: [] as any[] | Error, headers: new Headers() }

vi.mock('next/headers', () => ({ headers: async () => state.headers }))
vi.mock('next/navigation', () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`)
  },
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ setUser: vi.fn() }) }))
const logger = { error: vi.fn() }
const fakePayload = {
  auth: vi.fn(async ({ headers }: any) => {
    expect(headers).toBe(state.headers) // the request's own headers, nothing else
    return { user: state.user }
  }),
  find: vi.fn(async (args: any) => {
    if (state.orders instanceof Error) throw state.orders
    return { docs: state.orders, args }
  }),
  logger,
}
vi.mock('payload', async (orig) => ({ ...(await orig<any>()), getPayload: async () => fakePayload }))

const { default: AccountPage, dynamic } = await import('@/app/(frontend)/account/page')
const render = async () => renderToStaticMarkup(await AccountPage())

const customer = { id: 5, collection: 'customers', email: 'buyer@example.com', name: 'Asha' }
const orderDoc = (over: any = {}) => ({
  id: 7,
  orderNumber: 'AURA-ORD-X1',
  createdAt: '2026-11-05T09:10:00.000Z',
  status: 'processing',
  amount: 2650,
  itemsSnapshot: [{ title: 'Numakers PLA', variantTitle: 'Pure White', quantity: 1 }],
  ...over,
})

beforeEach(() => {
  state.user = customer
  state.orders = []
  fakePayload.find.mockClear()
  logger.error.mockClear()
})

describe('/account page', () => {
  it('is always dynamic (per-customer data is never prerendered or shared)', () => {
    expect(dynamic).toBe('force-dynamic')
  })

  it('signed-out and admin sessions redirect to /login', async () => {
    state.user = null
    await expect(render()).rejects.toThrow('REDIRECT:/login')
    state.user = { id: 1, collection: 'users', email: 'admin@example.com' }
    await expect(render()).rejects.toThrow('REDIRECT:/login')
    expect(fakePayload.find).not.toHaveBeenCalled()
  })

  it('queries as the signed-in customer with overrideAccess: false', async () => {
    await render()
    expect(fakePayload.find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'orders', user: customer, overrideAccess: false, where: { customer: { equals: 5 } } }),
    )
  })

  it('renders amount (not total), order number, readable status and first item', async () => {
    state.orders = [orderDoc({ total: 999999 })]
    const html = await render()
    expect(html).toContain('AURA-ORD-X1')
    expect(html).toContain('Rs. 2,650')
    expect(html).not.toContain('999,999')
    expect(html).toContain('Processing')
    expect(html).toContain('Numakers PLA — Pure White')
    expect(html).toContain('5 Nov 2026')
  })

  it('does not repeat the product name when the variant title already includes it', async () => {
    state.orders = [orderDoc({ itemsSnapshot: [{ title: 'Numakers PLA', variantTitle: 'Numakers PLA — Lemon Yellow', quantity: 3 }] })]
    const html = await render()
    expect(html).toContain('>Numakers PLA — Lemon Yellow<')
    expect(html).not.toContain('Numakers PLA — Numakers PLA')
    expect(html).toContain('3 items')
  })

  it('missing amount is "Amount unavailable", never Rs. 0; a stored 0 shows as Rs. 0; missing number falls back to #id', async () => {
    state.orders = [orderDoc({ id: 8, orderNumber: null, amount: null, itemsSnapshot: null, items: [] })]
    let html = await render()
    expect(html).toContain('#8')
    expect(html).toContain('Amount unavailable')
    expect(html).not.toContain('Rs. 0')
    state.orders = [orderDoc({ amount: 0 })]
    html = await render()
    expect(html).toContain('Rs. 0')
  })

  it('labels every stored status distinctly', async () => {
    state.orders = ['processing', 'completed', 'cancelled', 'refunded'].map((status, i) => orderDoc({ id: i + 1, status }))
    const html = await render()
    for (const label of ['Processing', 'Completed', 'Cancelled', 'Refunded']) expect(html).toContain(`>${label}<`)
    expect(html).not.toMatch(/Shipped|Delivered/)
  })

  it('empty state only for a real empty result; a failed fetch shows an error, not "no orders"', async () => {
    expect(await render()).toContain('You haven&#x27;t placed any orders yet.')
    state.orders = new Error('D1 down')
    const html = await render()
    expect(html).toContain('couldn&#x27;t load your orders')
    expect(html).not.toContain('placed any orders yet')
    expect(logger.error).toHaveBeenCalledWith({ msg: 'account: orders could not be loaded' })
  })

  it('does not render private order fields, and has no Edit Details or password mask', async () => {
    state.orders = [orderDoc({ idempotencyKey: 'idem-123', paymentReference: 'esewa-ref-9', shippingAddress: { addressLine1: 'Secret Street' } })]
    const html = await render()
    expect(html).not.toMatch(/idem-123|esewa-ref-9|Secret Street|Edit Details|••••/)
  })
})

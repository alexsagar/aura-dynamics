// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

const state = { user: null as any, orders: [] as any[] | Error, totalDocs: null as number | null, headers: new Headers() }

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
  // Mimics Payload pagination over the owner-filtered result.
  find: vi.fn(async ({ page = 1, limit = 10 }: any) => {
    if (state.orders instanceof Error) throw state.orders
    const totalDocs = state.totalDocs ?? state.orders.length
    return {
      docs: state.orders.slice((page - 1) * limit, page * limit),
      page,
      totalDocs,
      totalPages: Math.max(1, Math.ceil(totalDocs / limit)),
    }
  }),
  logger,
}
vi.mock('payload', async (orig) => ({ ...(await orig<any>()), getPayload: async () => fakePayload }))

const { default: AccountPage, dynamic } = await import('@/app/(frontend)/account/page')
const { parsePage } = await import('@/lib/account-orders')
const render = async (query: Record<string, string | string[]> = {}) =>
  renderToStaticMarkup(await AccountPage({ searchParams: Promise.resolve(query) }))

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
  state.totalDocs = null
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

  it('queries one page as the signed-in customer with overrideAccess: false', async () => {
    await render({ page: '2' })
    expect(fakePayload.find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'orders', user: customer, overrideAccess: false, where: { customer: { equals: 5 } }, page: 2, limit: 10 }),
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
    expect(html).toContain('href="/account/orders/7"')
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

  it('shows Previous/Next only where they lead somewhere', async () => {
    state.orders = Array.from({ length: 25 }, (_, i) => orderDoc({ id: i + 1, orderNumber: `AURA-ORD-P${i + 1}` }))
    let html = await render()
    expect(html).toContain('Page 1 of 3')
    expect(html).toContain('href="/account?page=2"')
    expect(html).not.toContain('Previous')
    html = await render({ page: '2' })
    expect(html).toContain('href="/account?page=1"')
    expect(html).toContain('href="/account?page=3"')
    html = await render({ page: '3' })
    expect(html).toContain('Page 3 of 3')
    expect(html).not.toContain('>Next<')
    state.orders = [orderDoc()]
    expect(await render()).not.toContain('Order history pages')
  })

  it('a page past the end redirects to the last page instead of a false empty state', async () => {
    state.orders = Array.from({ length: 12 }, (_, i) => orderDoc({ id: i + 1 }))
    await expect(render({ page: '9' })).rejects.toThrow('REDIRECT:/account?page=2')
  })

  it('invalid page parameters fall back to page 1', () => {
    for (const raw of [undefined, '', '0', '-1', 'abc', '1.5', '2e3', '9999999', ['x', '3']]) expect(parsePage(raw as any)).toBe(1)
    expect(parsePage('3')).toBe(3)
    expect(parsePage(['4', '1'])).toBe(4)
  })

  it('switching accounts renders only the current customer’s data', async () => {
    state.orders = [orderDoc({ orderNumber: 'AURA-ORD-OF-A' })]
    const first = await render()
    state.user = { id: 6, collection: 'customers', email: 'other@example.com', name: 'Bikash' }
    state.orders = [orderDoc({ orderNumber: 'AURA-ORD-OF-B' })]
    const second = await render()
    expect(first).toContain('Asha')
    expect(second).toContain('Bikash')
    expect(second).not.toMatch(/Asha|buyer@example\.com|AURA-ORD-OF-A/)
    expect(fakePayload.find).toHaveBeenLastCalledWith(expect.objectContaining({ user: state.user, where: { customer: { equals: 6 } } }))
  })
})

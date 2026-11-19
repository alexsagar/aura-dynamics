import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderHook, waitFor, act } from '@testing-library/react'

import { useStoreSettings, type StoreSettings } from '@/providers/useStoreSettings'
import { formatNPR, PendingAmount, Price } from '@/components/storefront/commerce/Price'
import { discountNPR } from '@/lib/catalog/pricing'
import { shippingFor } from '@/lib/shipping'

const settings = (shippingFee: number): StoreSettings => ({
  isEsewaConfigured: false,
  esewaQrImageUrl: null,
  esewaMerchantName: null,
  esewaId: null,
  shippingSettings: { shippingFee, freeShippingThreshold: 0, freeShippingEnabled: shippingFee === 0 },
})
const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))

afterEach(() => vi.unstubAllGlobals())

describe('useStoreSettings (cart + checkout shipping source)', () => {
  it('starts in loading with no fee, never a default Rs. 150', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { result } = renderHook(() => useStoreSettings())
    expect(result.current.status).toBe('loading')
    expect(JSON.stringify(result.current)).not.toContain('150')
  })

  it('free delivery (fee 0) from CMS resolves to Free', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ok(settings(0))))
    const { result } = renderHook(() => useStoreSettings())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    if (result.current.status !== 'ready') throw new Error()
    expect(shippingFor(2000, result.current.settings.shippingSettings)).toBe(0)
  })

  it('respects a changed nonzero CMS fee', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ok(settings(200))))
    const { result } = renderHook(() => useStoreSettings())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    if (result.current.status !== 'ready') throw new Error()
    expect(shippingFor(2000, result.current.settings.shippingSettings)).toBe(200)
  })

  it('request failure gives error, and retry recovers', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve(new Response('{}', { status: 503 })))
      .mockImplementationOnce(() => ok(settings(0)))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useStoreSettings())
    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('PendingAmount', () => {
  const html = (status: 'loading' | 'error' | 'ready') =>
    renderToStaticMarkup(createElement(PendingAmount, { status, children: formatNPR(2150) }))
  it('hides the amount while loading or failed', () => {
    expect(html('loading')).not.toContain('Rs.')
    expect(html('error')).toContain('Unavailable')
    expect(html('error')).not.toContain('Rs.')
    expect(html('ready')).toBe('Rs. 2,150')
  })
})

describe('cart and checkout wiring', () => {
  const cart = readFileSync('src/app/(frontend)/cart/page.tsx', 'utf8')
  const checkout = readFileSync('src/app/(frontend)/checkout/page.tsx', 'utf8')

  it('never seed the UI with the server fallback fee', () => {
    for (const src of [cart, checkout]) {
      expect(src).not.toMatch(/DEFAULT_SHIPPING/)
      expect(src).toMatch(/useStoreSettings\(\)/)
    }
  })

  it('checkout cannot submit with unresolved shipping', () => {
    expect(checkout).toMatch(/disabled=\{isProcessing \|\| finalTotal === null\}/)
    expect(checkout).toMatch(/if \(finalTotal === null\) \{[\s\S]{0,200}?return/)
  })

  it('checkout request carries no client total; the server computes it', () => {
    const body = checkout.slice(checkout.indexOf("fetch('/api/checkout'"), checkout.indexOf('const data: any'))
    expect(body).not.toMatch(/finalTotal|shipping|amount/)
    const route = readFileSync('src/app/api/checkout/route.ts', 'utf8')
    expect(route).toMatch(/shippingFor\(subtotal, resolveShippingSettings\(siteSettings\?\.shippingSettings\)\)/)
  })

  it('settings API fails loudly instead of returning a default fee', () => {
    const api = readFileSync('src/app/api/payment-settings/route.ts', 'utf8')
    expect(api).not.toMatch(/DEFAULT_SHIPPING/)
    expect(api).toMatch(/status: 503/)
  })
})

describe('NPR display format', () => {
  it('whole rupees with grouping, no .00', () => {
    expect(formatNPR(2000)).toBe('Rs. 2,000')
    expect(formatNPR(2299)).toBe('Rs. 2,299')
    expect(formatNPR(299)).toBe('Rs. 299')
    expect(formatNPR(0)).toBe('Rs. 0')
  })

  it('discount stays Rs. 2,299 → Rs. 2,000, Rs. 299 saved, 13% off', () => {
    expect(discountNPR(2000, 2299)).toEqual({ original: 2299, saved: 299, percent: 13 })
    const html = renderToStaticMarkup(createElement(Price, { amount: 2000, compareAt: 2299 }))
    expect(html).toContain('Rs. 2,299')
    expect(html).toContain('Rs. 2,000')
    expect(html).toContain('13% off')
  })

  it('no customer-facing price uses toFixed(2)', () => {
    for (const f of [
      'src/app/(frontend)/cart/page.tsx',
      'src/app/(frontend)/checkout/page.tsx',
      'src/app/(frontend)/checkout/success/page.tsx',
      'src/components/storefront/cart/CartSidebar.tsx',
    ]) {
      expect(readFileSync(f, 'utf8')).not.toMatch(/toFixed\(2\)/)
    }
  })
})

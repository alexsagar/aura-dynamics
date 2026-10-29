import { describe, expect, it } from 'vitest'

import { resolveProductImage } from '@/lib/catalog/product-image'
import { rankRelated } from '@/lib/catalog/related'

const img = (url: string) => ({ id: 1, url }) as any

describe('resolveProductImage', () => {
  it('prefers product image, then selected, in-stock, any variant; skips IDs/null', () => {
    const out = { images: [img('/out.png')], inventory: 0 }
    const inStock = { images: [7, img('/in.png')], inventory: 3 }
    expect(resolveProductImage({ images: [img('/p.png')] }, [out, inStock])).toBe('/p.png')
    expect(resolveProductImage({ images: [5, null] as any }, [out, inStock], out)).toBe('/out.png')
    expect(resolveProductImage({ images: [] }, [out, inStock])).toBe('/in.png')
    expect(resolveProductImage(null, [out])).toBe('/out.png')
    expect(resolveProductImage({ images: [3] as any }, [{ images: [4] as any }])).toBeUndefined()
  })
})

describe('rankRelated', () => {
  const p = (id: number, productType: string, extra = {}) => ({ id, productType, ...extra }) as any
  it('manual picks first, then same type, excludes current and duplicates', () => {
    const current = p(1, 'filament', { relatedProducts: [4] })
    const ranked = rankRelated(current, [p(1, 'filament'), p(2, '3d-print'), p(3, 'filament'), p(4, '3d-print'), p(3, 'filament')])
    expect(ranked.map((x) => x.id)).toEqual([4, 3, 2])
  })
})

describe('filament-only storefront scope', () => {
  it('only published filaments are public', async () => {
    const { isPublicProduct } = await import('@/access/ecommerce')
    expect(isPublicProduct({ _status: 'published', productType: 'filament' })).toBe(true)
    expect(isPublicProduct({ _status: 'published', productType: '3d-print' })).toBe(false)
    expect(isPublicProduct({ _status: 'draft', productType: 'filament' })).toBe(false)
  })
  it('detects retired routes, not look-alikes', async () => {
    const { isRetiredUrl } = await import('@/lib/site/routes')
    expect(['/3d-prints', '/collections/', 'https://x.com/3d-prints?a=1', '/3d-prints/dragon'].every(isRetiredUrl)).toBe(true)
    expect(['/filaments', '/collections-guide', '', null].some(isRetiredUrl)).toBe(false)
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import type { ResolvingMetadata } from 'next'

const cms = vi.hoisted(() => ({ seo: {} as { seoTitle?: string; seoDescription?: string } }))
vi.mock('payload', () => ({ getPayload: async () => ({ findGlobal: async () => cms.seo }) }))
vi.mock('@/payload.config', () => ({ default: {} }))

const OG_IMAGE = [{ url: new URL('https://example.test/api/media/file/og.png'), width: 1200, height: 630 }]
const parent = Promise.resolve({
  title: { absolute: 'Aura Filaments', template: '%s' },
  description: 'Site default description',
  openGraph: { title: { absolute: 'Aura Filaments' }, description: 'Site default description', images: OG_IMAGE },
  twitter: { images: OG_IMAGE },
}) as unknown as ResolvingMetadata

async function load(host: string) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', host)
  return import('@/lib/site/get-page-content')
}

beforeEach(() => (cms.seo = {}))
afterEach(() => vi.unstubAllEnvs())

describe('canonical + og:url per page', () => {
  it.each([
    ['/', 'https://printwithaura.com/'],
    ['/filaments', 'https://printwithaura.com/filaments'],
    ['/materials', 'https://printwithaura.com/materials'],
    ['/about', 'https://printwithaura.com/about'],
    ['/privacy', 'https://printwithaura.com/privacy'],
    ['/terms', 'https://printwithaura.com/terms'],
  ])('%s → %s on production', async (path, url) => {
    const { withCanonical } = await load('https://printwithaura.com')
    const m = await withCanonical(path, parent)
    expect(m.alternates?.canonical).toBe(url)
    expect((m.openGraph as { url: string }).url).toBe(url)
  })

  it('staging builds use the staging host, never production', async () => {
    const { withCanonical } = await load('https://staging.printwithaura.com')
    const m = await withCanonical('/about', parent)
    expect(m.alternates?.canonical).toBe('https://staging.printwithaura.com/about')
    expect(JSON.stringify(m)).not.toContain('://printwithaura.com')
  })

  it('keeps the layout share image, title, description and summary_large_image', async () => {
    const { withCanonical } = await load('https://printwithaura.com')
    const m = await withCanonical('/', parent)
    expect(m.openGraph).toMatchObject({ title: 'Aura Filaments', description: 'Site default description', images: OG_IMAGE })
    expect(m.twitter).toMatchObject({ card: 'summary_large_image', images: OG_IMAGE })
  })

  it('CMS SEO title/description flow into title, og and twitter', async () => {
    cms.seo = { seoTitle: 'About Aura', seoDescription: 'Who we are' }
    const { pageMetadata } = await load('https://printwithaura.com')
    const m = await pageMetadata('about', '/about', parent)
    expect(m.title).toBe('About Aura')
    expect(m.openGraph).toMatchObject({ title: 'About Aura', description: 'Who we are', url: 'https://printwithaura.com/about' })
    expect(m.twitter).toMatchObject({ title: 'About Aura', description: 'Who we are' })
  })
})

describe('layout and route wiring', () => {
  const read = (f: string) => readFileSync(`src/app/(frontend)/${f}`, 'utf8')

  it('root layout no longer hands every page the homepage og:url', () => {
    expect(read('layout.tsx')).not.toMatch(/url: SITE_URL/)
  })

  it.each([
    ['page.tsx', "withCanonical('/', parent)"],
    ['about/page.tsx', "pageMetadata('about', '/about', parent)"],
    ['materials/page.tsx', "pageMetadata('materials', '/materials', parent)"],
    ['privacy/page.tsx', "pageMetadata('privacy', '/privacy', parent)"],
    ['terms/page.tsx', "pageMetadata('terms', '/terms', parent)"],
  ])('%s sets its own canonical', (file, call) => {
    expect(read(file)).toContain(call)
  })

  it('filaments: pagination self-canonical, facets canonical to /filaments + noindex,follow', () => {
    const src = read('filaments/page.tsx')
    expect(src).toContain('page > 1 ? `/filaments?page=${page}` : \'/filaments\'')
    expect(src).toMatch(/faceted\) return pageMetadata\('filaments', '\/filaments', parent, \{ robots: \{ index: false, follow: true \} \}\)/)
  })

  it('product keeps its own canonical and falls back to the layout image', () => {
    const src = read('product/[slug]/page.tsx')
    expect(src).toContain("const url = absoluteUrl(`/product/${product.slug}`)")
    expect(src).toContain('alternates: { canonical: url }')
    expect(src).toContain('(await parent).openGraph?.images')
  })

  it.each(['cart', 'checkout', 'login'])('%s is noindex in page metadata, not only robots.txt', (d) => {
    expect(read(`${d}/layout.tsx`)).toContain('robots: { index: false, follow: false }')
  })
})

describe('robots', () => {
  async function robots(noindex?: string) {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://printwithaura.com')
    if (noindex) vi.stubEnv('NEXT_PUBLIC_NOINDEX', noindex)
    return (await import('@/app/robots')).default()
  }

  it('production allows storefront, blocks private routes, points at its sitemap', async () => {
    const r = await robots()
    expect(r.rules).toMatchObject({ allow: '/', disallow: expect.arrayContaining(['/admin', '/api/', '/cart', '/checkout', '/account']) })
    expect(r.sitemap).toBe('https://printwithaura.com/sitemap.xml')
  })

  it('staging disallows everything and sends X-Robots-Tag noindex', async () => {
    const r = await robots('true')
    expect(r.rules).toEqual({ userAgent: '*', disallow: '/' })
    expect(r.sitemap).toBeUndefined()
    expect(readFileSync('next.config.ts', 'utf8')).toMatch(/NEXT_PUBLIC_NOINDEX !== 'true'\) return \[\][\s\S]*X-Robots-Tag', value: 'noindex, nofollow'/)
  })
})

describe('product structured data', () => {
  it('uses the selling price and an absolute resolved image, no invented fields', () => {
    const src = readFileSync('src/components/storefront/product/ProductJsonLd.tsx', 'utf8')
    expect(src).toContain('variantPriceNPR(product, v)')
    expect(src).not.toMatch(/OriginalPriceNPR|aggregateRating|'Review'/)
    expect(src).toContain('image ? [absoluteUrl(image)] : []')
  })
})

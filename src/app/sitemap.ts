import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Product } from '@/payload-types'
import { SITE_URL } from '@/lib/site/seo'

/**
 * Sitemap: static informational/catalogue routes plus every published product.
 * Excludes admin, API, cart, checkout, success and other internal/transactional
 * routes. Only real published slugs are emitted, so retired slugs (e.g.
 * numakers-pla-plus) never appear.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/filaments',
    '/3d-prints',
    '/materials',
    '/collections',
    '/about',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.6,
  }))

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: false,
    })
    productRoutes = (docs as Product[])
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${SITE_URL}/product/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
  } catch (error) {
    console.error('Failed to build product sitemap entries', error)
  }

  return [...staticRoutes, ...productRoutes]
}

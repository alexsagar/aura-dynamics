import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site/seo'

/**
 * Allow crawling of the storefront, but keep private / transactional / internal
 * routes out of the index. The storefront catalogue and product pages stay
 * fully crawlable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/cart', '/checkout', '/account', '/search'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}

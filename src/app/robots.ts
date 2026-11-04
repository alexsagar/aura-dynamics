import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site/seo'

/**
 * Allow crawling of the storefront, but keep private / transactional / internal
 * routes out of the index. The storefront catalogue and product pages stay
 * fully crawlable.
 */
export default function robots(): MetadataRoute.Robots {
  // Staging builds set NEXT_PUBLIC_NOINDEX=true; production never does.
  if (process.env.NEXT_PUBLIC_NOINDEX === 'true') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
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

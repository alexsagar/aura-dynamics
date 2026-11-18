import { GeistSans } from 'geist/font/sans'
import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import { Footer } from '@/components/storefront/layout/Footer'
import { Header } from '@/components/storefront/navigation/Header'
import { CartSidebar } from '@/components/storefront/cart/CartSidebar'
import { SmoothScroll } from '@/components/storefront/ui/SmoothScroll'
import { getSiteGlobals } from '@/lib/site/get-site-globals'
import { getBranding } from '@/lib/site/get-branding'
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site/seo'
import { mediaUrl } from '@/lib/payload-media'

import './styles.css'
import 'lenis/dist/lenis.css'

import { Providers } from '@/providers/Providers'

// The storefront is entirely CMS/D1-driven: the layout reads Header/Footer
// globals and every page reads Payload (homepage global, catalog, products).
// Without this, Next statically prerenders these routes at build time, so
// Payload Admin edits only appear after a redeploy. Rendering the storefront
// dynamically makes each request read D1 through the Payload Local API, so
// saved content is live on the next refresh. The Payload Admin lives in a
// separate route group and is unaffected. (OpenNext incremental-cache +
// revalidateTag would be the production-perf path, but it needs the R2 cache
// bucket that is not configured here; dynamic is the smallest reliable fix.)
export const dynamic = 'force-dynamic'

const DEFAULT_TITLE = 'Aura — Filaments and 3D prints for makers in Nepal'
const DEFAULT_DESCRIPTION =
  'Numakers filaments and ready-stock 3D prints, shipped across Nepal.'

// Default site metadata, sourced from Site Settings (CMS) when available so the
// store owner controls the default title/description. Per-page generateMetadata
// (products, legal, search) overrides this. metadataBase lets child pages emit
// absolute canonical/OG URLs from relative paths.
export async function generateMetadata(): Promise<Metadata> {
  let title = DEFAULT_TITLE
  let description = DEFAULT_DESCRIPTION
  // Default share image: Site Settings → Default SEO → OG Image, read per
  // request (force-dynamic) so a new upload shows without a redeploy. None set
  // → no image tag; scrapers then show the title/description card.
  let images: { url: string; width?: number; height?: number; alt?: string }[] | undefined
  try {
    const payload = await getPayload({ config: configPromise })
    // depth 1 populates ogImage in the same query.
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
    title = settings?.defaultSeo?.title?.trim() || title
    description = settings?.defaultSeo?.description?.trim() || description
    const og = settings?.defaultSeo?.ogImage
    const url = mediaUrl(og)
    if (url && og && typeof og === 'object') {
      images = [{ url: absoluteUrl(url), width: og.width ?? undefined, height: og.height ?? undefined, alt: og.alt || title }]
    }
  } catch {
    // Fall back to the approved defaults if Site Settings is unavailable.
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s` },
    description,
    applicationName: SITE_NAME,
    icons: { icon: (await getBranding()).favicon ?? '/brand/aura-symbol.svg' },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: SITE_URL,
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const [{ header, footer }, branding] = await Promise.all([getSiteGlobals(), getBranding()])

  return (
    <html className={GeistSans.variable} lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Providers>
          <SmoothScroll />
          <Header data={header} logo={branding.logo} />
          <CartSidebar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer branding={branding} data={footer} />
        </Providers>
      </body>
    </html>
  )
}

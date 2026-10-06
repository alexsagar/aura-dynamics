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
import { SITE_NAME, SITE_URL } from '@/lib/site/seo'

import './styles.css'
import 'lenis/dist/lenis.css'

import { Providers } from '@/providers/Providers'

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
  try {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    title = settings?.defaultSeo?.title?.trim() || title
    description = settings?.defaultSeo?.description?.trim() || description
  } catch {
    // Fall back to the approved defaults if Site Settings is unavailable.
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s` },
    description,
    applicationName: SITE_NAME,
    icons: { icon: '/brand/aura-symbol.svg' },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: SITE_URL,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { header, footer } = await getSiteGlobals()

  return (
    <html className={GeistSans.variable} lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Providers>
          <SmoothScroll />
          <Header data={header} />
          <CartSidebar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer data={footer} />
        </Providers>
      </body>
    </html>
  )
}

import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Footer } from '@/components/storefront/layout/Footer'
import { Header } from '@/components/storefront/navigation/Header'
import { CartSidebar } from '@/components/storefront/cart/CartSidebar'
import { SmoothScroll } from '@/components/storefront/ui/SmoothScroll'
import { getSiteGlobals } from '@/lib/site/get-site-globals'

import './styles.css'
import 'lenis/dist/lenis.css'

import { Providers } from '@/providers/Providers'

export const metadata = {
  description: 'Numakers filaments and ready-stock 3D prints, shipped across Nepal.',
  title: 'Aura',
  icons: {
    icon: '/brand/aura-symbol.svg',
  },
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

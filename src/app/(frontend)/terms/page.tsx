import React from 'react'
import type { Metadata } from 'next'

import { LegalArticle } from '@/components/storefront/layout/LegalArticle'
import { absoluteUrl } from '@/lib/site/seo'

// Baseline terms reflecting how the store actually operates (NPR pricing,
// eSewa QR / COD, guest checkout, delivery within Nepal). No invented company
// registration or governing-entity details beyond jurisdiction. Review with
// counsel before launch.
export const metadata: Metadata = {
  title: 'Terms of Service · Aura',
  description:
    'The terms that apply when you browse Aura and place an order for filaments or 3D prints.',
  alternates: { canonical: absoluteUrl('/terms') },
}

export default function TermsPage() {
  return (
    <LegalArticle
      title="Terms of Service"
      intro="These terms apply when you browse Aura and place an order. By placing an order you agree to them."
    >
      <section>
        <h2>Pricing</h2>
        <p>
          All prices are shown in Nepalese Rupees (NPR). We take care to price products accurately;
          if a pricing error is identified we will contact you before processing the affected order.
        </p>
      </section>
      <section>
        <h2>Orders</h2>
        <p>
          Placing an order is an offer to buy. We confirm the sale when we accept and begin fulfilling
          your order. If an item is unavailable we may decline or cancel that order and will let you
          know.
        </p>
      </section>
      <section>
        <h2>Payment</h2>
        <p>
          You can pay by eSewa QR transfer or Cash on Delivery. Orders paid by eSewa QR are prepared
          once we have verified the payment reference you provided. Cash on Delivery orders are paid in
          full when your order is delivered.
        </p>
      </section>
      <section>
        <h2>Availability and stock</h2>
        <p>
          Stock levels shown are indicative. Where a purchased item becomes unavailable after your
          order, we will contact you to arrange an alternative or a cancellation.
        </p>
      </section>
      <section>
        <h2>Delivery</h2>
        <p>Orders are delivered within Nepal.</p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>Products sold on Aura are intended for lawful use.</p>
      </section>
      <section>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of Nepal.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>For questions about these terms, contact us using the details provided on this website.</p>
      </section>
    </LegalArticle>
  )
}

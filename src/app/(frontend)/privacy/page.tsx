import React from 'react'
import type { Metadata } from 'next'

import { LegalArticle } from '@/components/storefront/layout/LegalArticle'
import { absoluteUrl } from '@/lib/site/seo'
import { getPageContent } from '@/lib/site/get-page-content'

// Baseline privacy notice describing Aura's actual data practices (guest
// checkout, order fulfilment, eSewa QR / COD). It contains no invented company
// registration, address, or contact details. Review with counsel before
// launch and add verified contact details via CMS/site settings.
export async function generateMetadata(): Promise<Metadata> {
  const c = await getPageContent('privacy')
  return {
    title: c.seoTitle,
    description: c.seoDescription,
    alternates: { canonical: absoluteUrl('/privacy') },
  }
}

export default async function PrivacyPage() {
  const c = await getPageContent('privacy')
  return (
    <LegalArticle title={c.heading} intro={c.intro}>
      <section>
        <h2>Information we collect</h2>
        <p>
          When you place an order as a guest, you provide your full name, phone number, email
          address, delivery address, and any optional note you add at checkout. If you pay by eSewa
          QR, you also provide the payment reference ID for that transfer.
        </p>
      </section>
      <section>
        <h2>How we use your information</h2>
        <p>
          We use these details solely to process, fulfil, and deliver your order, to verify payment,
          and to contact you about that order. We do not create marketing profiles from checkout
          information.
        </p>
      </section>
      <section>
        <h2>Payments</h2>
        <p>
          Payments are made by eSewa QR transfer or Cash on Delivery. Aura does not collect or store
          card numbers, and no card payments are processed on this site. For eSewa QR orders we record
          the reference ID you supply so your payment can be verified manually.
        </p>
      </section>
      <section>
        <h2>Guest checkout</h2>
        <p>
          Aura uses guest checkout only. We do not maintain customer login accounts or store
          passwords.
        </p>
      </section>
      <section>
        <h2>Sharing</h2>
        <p>
          We share your details only as needed to deliver your order, such as with a delivery
          provider. We do not sell your personal information.
        </p>
      </section>
      <section>
        <h2>Retention</h2>
        <p>
          Order information is kept for as long as necessary to maintain accurate order and payment
          records.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          For any question about your order or this notice, contact us using the details provided on
          this website.
        </p>
      </section>
    </LegalArticle>
  )
}

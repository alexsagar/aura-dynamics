import React from 'react'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { LegalArticle } from '@/components/storefront/layout/LegalArticle'
import { absoluteUrl } from '@/lib/site/seo'
import { getPageContent, pageMetadata } from '@/lib/site/get-page-content'

// Policy body is CMS-owned (Page Content → Privacy Policy Page). Review with
// counsel before launch and add verified contact details via CMS/site settings.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('privacy', { alternates: { canonical: absoluteUrl('/privacy') } })
}

export default async function PrivacyPage() {
  const c = await getPageContent('privacy')
  return (
    <LegalArticle title={c.heading ?? ''} intro={c.intro ?? undefined}>
      {c.body ? <RichText data={c.body} disableContainer /> : null}
    </LegalArticle>
  )
}

import React from 'react'
import type { Metadata, ResolvingMetadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { LegalArticle } from '@/components/storefront/layout/LegalArticle'
import { absoluteUrl } from '@/lib/site/seo'
import { getPageContent, pageMetadata } from '@/lib/site/get-page-content'

// Terms body is CMS-owned (Page Content → Terms of Service Page). Review with
// counsel before launch.
export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  return pageMetadata('terms', '/terms', parent)
}

export default async function TermsPage() {
  const c = await getPageContent('terms')
  return (
    <LegalArticle title={c.heading ?? ''} intro={c.intro ?? undefined}>
      {c.body ? <RichText data={c.body} disableContainer /> : null}
    </LegalArticle>
  )
}

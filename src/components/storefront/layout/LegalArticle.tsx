import React from 'react'

import { Container } from '@/components/storefront/layout/Container'

/**
 * Shared editorial layout for plain-text legal / informational pages
 * (Privacy, Terms). Children are the CMS rich-text body: a flat run of
 * h2/p/ul nodes, spaced here as heading-led sections.
 */
export function LegalArticle({
  title,
  intro,
  children,
}: {
  title: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-background pt-32 pb-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] md:text-5xl">{title}</h1>
          {intro ? <p className="mt-6 text-lg leading-relaxed text-muted">{intro}</p> : null}
          <div className="mt-10 leading-relaxed [&_h2:not(:first-child)]:mt-8 text-muted [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-[-0.01em] [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2">
            {children}
          </div>
        </div>
      </Container>
    </div>
  )
}

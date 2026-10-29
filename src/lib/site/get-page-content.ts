import type { Metadata } from 'next'
import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { AboutPage, MaterialsPage, PageContent } from '@/payload-types'

type Pages = {
  filaments: NonNullable<PageContent['filaments']>
  prints: NonNullable<PageContent['prints']>
  collections: NonNullable<PageContent['collections']>
  privacy: NonNullable<PageContent['privacy']>
  terms: NonNullable<PageContent['terms']>
  about: AboutPage
  materials: MaterialsPage
}
export type PageKey = keyof Pages

/** About/Materials live in their own globals; the rest are Page Content groups. */
const OWN_GLOBAL = { about: 'about-page', materials: 'materials-page' } as const

/**
 * One page's content from Payload (depth 1, so image slots are populated
 * Media). Payload owns the copy — there is no in-code duplicate. If the CMS is
 * unreachable the page renders an empty, non-crashing shell and metadata falls
 * back to the Site Settings default.
 */
export async function getPageContent<K extends PageKey>(key: K): Promise<Pages[K]> {
  try {
    const payload = await getPayload({ config: configPromise })
    if (key === 'about' || key === 'materials') {
      const slug = OWN_GLOBAL[key as keyof typeof OWN_GLOBAL]
      return (await payload.findGlobal({ slug, depth: 1 })) as Pages[K]
    }
    const doc = await payload.findGlobal({ slug: 'page-content', depth: 1 })
    return (doc?.[key as keyof PageContent] ?? {}) as Pages[K]
  } catch (error) {
    console.error(`Failed to load "${key}" page content from Payload`, error)
    return {} as Pages[K]
  }
}

/** Page SEO from CMS; empty values defer to the layout's Site Settings default. */
export async function pageMetadata(key: PageKey, extra: Metadata = {}): Promise<Metadata> {
  const c: { seoTitle?: string | null; seoDescription?: string | null } = await getPageContent(key)
  return {
    ...(c.seoTitle?.trim() ? { title: c.seoTitle } : {}),
    ...(c.seoDescription?.trim() ? { description: c.seoDescription } : {}),
    ...extra,
  }
}

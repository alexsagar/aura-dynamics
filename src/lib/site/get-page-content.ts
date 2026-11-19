import type { Metadata, ResolvingMetadata } from 'next'
import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import { absoluteUrl, SITE_NAME } from '@/lib/site/seo'
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

/**
 * Canonical + og:url for a site path. A page-level openGraph/twitter replaces
 * the layout's rather than merging, so the layout's title, description and
 * share image are carried over unless the page sets its own.
 */
export async function withCanonical(path: string, parent: ResolvingMetadata, meta: Metadata = {}): Promise<Metadata> {
  const p = await parent
  const url = absoluteUrl(path)
  const title = typeof meta.title === 'string' ? meta.title : (p.openGraph?.title?.absolute ?? p.title?.absolute)
  const description = meta.description ?? p.openGraph?.description ?? p.description ?? undefined
  return {
    ...meta,
    alternates: { ...meta.alternates, canonical: url },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, url, images: p.openGraph?.images },
    twitter: { card: 'summary_large_image', title, description, images: p.twitter?.images },
  }
}

/** Page SEO from CMS (empty values defer to the Site Settings default) plus canonical/og:url for . */
export async function pageMetadata(key: PageKey, path: string, parent: ResolvingMetadata, extra: Metadata = {}): Promise<Metadata> {
  const c: { seoTitle?: string | null; seoDescription?: string | null } = await getPageContent(key)
  return withCanonical(path, parent, {
    ...(c.seoTitle?.trim() ? { title: c.seoTitle } : {}),
    ...(c.seoDescription?.trim() ? { description: c.seoDescription } : {}),
    ...extra,
  })
}

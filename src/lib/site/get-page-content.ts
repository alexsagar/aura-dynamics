import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { PageContent } from '@/payload-types'

/**
 * Approved in-code copy for the fixed landing/legal pages. These are the exact
 * current literals; they double as fallbacks so an empty CMS field never
 * blanks a live page. The CMS value (when set) wins.
 */
export const PAGE_FALLBACKS = {
  filaments: {
    heading: 'Filaments',
    intro: 'Explore our range of 3D printing filaments.',
    seoTitle: 'Filaments — Aura',
    seoDescription:
      'Browse Numakers 3D printing filaments — PLA, PETG and more, shipped across Nepal.',
  },
  prints: {
    heading: '3D Prints',
    intro: 'Explore our collection of ready-made 3D prints.',
    seoTitle: '3D Prints — Aura',
    seoDescription:
      'Browse Aura ready-made 3D prints — figures, miniatures and more, shipped across Nepal.',
  },
  collections: {
    heading: 'The Aura catalogue.',
    intro:
      'Everything we make, in one place — high-performance filaments and ready-stock 3D prints, all in stock and ready to ship across Nepal.',
    seoTitle: 'Shop · Aura',
    seoDescription:
      'Browse the Aura catalogue — Numakers filaments and ready-stock 3D prints, shipped across Nepal.',
  },
  about: {
    heading: '',
    intro:
      "Aura is the premier 3D printing ecosystem in Nepal. We don't just supply filament; we provide the foundation for innovation, rapid prototyping, and digital manufacturing.",
    seoTitle: 'About — Aura',
    seoDescription:
      'Aura is the premier 3D printing ecosystem in Nepal — filament, ready-stock prints and the foundation for digital manufacturing.',
  },
  materials: {
    heading: 'The Library.',
    intro:
      'An index of high-performance polymers. Engineered to rigorous tolerances to ensure perfect bed adhesion, minimal warping, and predictable extrusion.',
    seoTitle: 'Materials — Aura',
    seoDescription:
      'An index of high-performance 3D printing polymers — PLA, PETG, ABS and TPU — engineered to rigorous tolerances.',
  },
  privacy: {
    heading: 'Privacy Policy',
    intro:
      'Aura collects only the information needed to process and deliver your order. This notice explains what we collect, why, and how it is handled.',
    seoTitle: 'Privacy Policy · Aura',
    seoDescription:
      'How Aura collects and uses the limited personal information you provide to place and receive an order.',
  },
  terms: {
    heading: 'Terms of Service',
    intro:
      'These terms apply when you browse Aura and place an order. By placing an order you agree to them.',
    seoTitle: 'Terms of Service · Aura',
    seoDescription:
      'The terms that apply when you browse Aura and place an order for filaments or 3D prints.',
  },
} as const

export type PageKey = keyof typeof PAGE_FALLBACKS
export type ResolvedPage = { heading: string; intro: string; seoTitle: string; seoDescription: string }

/** Fetch one page's resolved content (CMS value or approved fallback). */
export async function getPageContent(key: PageKey): Promise<ResolvedPage> {
  const fb = PAGE_FALLBACKS[key]
  try {
    const payload = await getPayload({ config: configPromise })
    const doc = (await payload.findGlobal({ slug: 'page-content', depth: 0 })) as PageContent
    const cms = (doc?.[key] ?? {}) as Partial<ResolvedPage>
    return {
      heading: cms.heading?.trim() || fb.heading,
      intro: cms.intro?.trim() || fb.intro,
      seoTitle: cms.seoTitle?.trim() || fb.seoTitle,
      seoDescription: cms.seoDescription?.trim() || fb.seoDescription,
    }
  } catch {
    return { ...fb }
  }
}

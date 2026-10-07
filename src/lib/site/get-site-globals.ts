import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Footer, Header } from '@/payload-types'

/** Approved fallback content — used only when a CMS field is empty or Payload is unreachable. */
const HEADER_NAV_FALLBACK = [
  { label: 'Filaments', url: '/filaments' },
  { label: '3D Prints', url: '/3d-prints' },
  { label: 'Collections', url: '/collections' },
  { label: 'Materials', url: '/materials' },
  { label: 'About', url: '/about' },
]

const FOOTER_COLUMNS_FALLBACK = [
  {
    title: 'Shop',
    links: [
      { label: 'Filaments', url: '/filaments' },
      { label: '3D Prints', url: '/3d-prints' },
      { label: 'Collections', url: '/collections' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', url: '/about' },
      // /contact, /shipping and /faq routes don't exist yet — omitted from the
      // outage fallback so it never renders a dead link. Add them here (and in
      // the Footer global) once those pages ship.
    ],
  },
]

const FOOTER_LEGAL_FALLBACK = [
  { label: 'Privacy Policy', url: '/privacy' },
  { label: 'Terms of Service', url: '/terms' },
]

const FOOTER_COPY_FALLBACK = 'Aura Dynamics. All rights reserved.'
const FOOTER_BRAND_HEADING_FALLBACK = 'Engineered perfectly for makers across Nepal.'
const FOOTER_BRAND_COPY_FALLBACK =
  'Numakers filaments and ready-stock 3D prints, shipped directly to your door with unmatched precision and reliability.'
const FOOTER_NEWSLETTER_HEADING_FALLBACK = 'Join our newsletter'

export type HeaderViewModel = ReturnType<typeof normalizeHeader>
export type FooterViewModel = ReturnType<typeof normalizeFooter>

function normalizeHeader(cms: Header) {
  return {
    navLinks: cms.navLinks?.length
      ? cms.navLinks.map((l) => ({ label: l.label, url: l.url }))
      : HEADER_NAV_FALLBACK,
    announcement: {
      enabled: cms.announcement?.enabled ?? false,
      text: cms.announcement?.text || '',
      url: cms.announcement?.url || '',
    },
  }
}

function normalizeFooter(cms: Footer) {
  return {
    brandHeading: cms.brandHeading || FOOTER_BRAND_HEADING_FALLBACK,
    brandCopy: cms.brandCopy || FOOTER_BRAND_COPY_FALLBACK,
    newsletterHeading: cms.newsletterHeading || FOOTER_NEWSLETTER_HEADING_FALLBACK,
    columns: cms.columns?.length
      ? cms.columns.map((c) => ({
          title: c.title,
          links: (c.links ?? []).map((l) => ({ label: l.label, url: l.url })),
        }))
      : FOOTER_COLUMNS_FALLBACK,
    contact: {
      companyName: cms.contact?.companyName || '',
      address: cms.contact?.address || '',
      phone: cms.contact?.phone || '',
      email: cms.contact?.email || '',
    },
    socialLinks: (cms.socialLinks ?? []).map((s) => ({ platform: s.platform, url: s.url })),
    legalLinks: cms.legalLinks?.length
      ? cms.legalLinks.map((l) => ({ label: l.label, url: l.url }))
      : FOOTER_LEGAL_FALLBACK,
    copyright: cms.copyright || FOOTER_COPY_FALLBACK,
  }
}

export async function getSiteGlobals(): Promise<{ header: HeaderViewModel; footer: FooterViewModel }> {
  try {
    const payload = await getPayload({ config: configPromise })
    const [header, footer] = await Promise.all([
      payload.findGlobal({ slug: 'header' }),
      payload.findGlobal({ slug: 'footer' }),
    ])
    return { header: normalizeHeader(header), footer: normalizeFooter(footer) }
  } catch (error) {
    console.error('Failed to load Header/Footer globals from Payload', error)
    return { header: normalizeHeader({} as Header), footer: normalizeFooter({} as Footer) }
  }
}

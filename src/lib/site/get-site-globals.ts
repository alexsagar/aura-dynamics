import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Footer, Header } from '@/payload-types'

export type HeaderViewModel = ReturnType<typeof normalizeHeader>
export type FooterViewModel = ReturnType<typeof normalizeFooter>

/** Header/Footer copy and links are owned by their Payload globals — no in-code duplicate. */
function normalizeHeader(cms: Header) {
  return {
    navLinks: (cms.navLinks ?? []).map((l) => ({ label: l.label, url: l.url })),
    announcement: {
      enabled: cms.announcement?.enabled ?? false,
      text: cms.announcement?.text || '',
      url: cms.announcement?.url || '',
    },
  }
}

function normalizeFooter(cms: Footer) {
  return {
    brandHeading: cms.brandHeading || '',
    brandCopy: cms.brandCopy || '',
    newsletterHeading: cms.newsletterHeading || '',
    columns: (cms.columns ?? []).map((c) => ({
      title: c.title,
      links: (c.links ?? []).map((l) => ({ label: l.label, url: l.url })),
    })),
    contact: {
      companyName: cms.contact?.companyName || '',
      address: cms.contact?.address || '',
      phone: cms.contact?.phone || '',
      email: cms.contact?.email || '',
    },
    socialLinks: (cms.socialLinks ?? []).map((s) => ({ platform: s.platform, url: s.url })),
    legalLinks: (cms.legalLinks ?? []).map((l) => ({ label: l.label, url: l.url })),
    copyright: cms.copyright || '',
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
    // CMS unreachable: render logo/cart/search chrome without editorial links.
    console.error('Failed to load Header/Footer globals from Payload', error)
    return { header: normalizeHeader({} as Header), footer: normalizeFooter({} as Footer) }
  }
}

import { cache } from 'react'
import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Branding } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/payload-media'

export type BrandImage = { url: string; alt: string } | null
export type BrandingViewModel = ReturnType<typeof normalizeBranding>

const img = (m: Branding['logo'], alt: string): BrandImage => {
  const url = mediaUrl(m)
  return url ? { url, alt: mediaAlt(m, alt) } : null
}

/** Empty fields stay null; components fall back to the files in public/brand/. */
function normalizeBranding(cms: Partial<Branding>) {
  const partnerName = cms.partnerName?.trim() || 'Partner'
  return {
    logo: img(cms.logo, 'Aura'),
    logoOnDark: img(cms.logoOnDark, 'Aura'),
    favicon: mediaUrl(cms.favicon) ?? null,
    partner: img(cms.partnerLogo, partnerName),
    partnerUrl: cms.partnerUrl?.trim() || null,
    loginImage: mediaUrl(cms.loginImage) ?? null,
    registerImage: mediaUrl(cms.registerImage) ?? null,
  }
}

/** Once per request: the layout, metadata and pages share one read. */
export const getBranding = cache(async (): Promise<BrandingViewModel> => {
  try {
    const payload = await getPayload({ config: configPromise })
    return normalizeBranding(await payload.findGlobal({ slug: 'branding', depth: 1 }))
  } catch (error) {
    console.error('Failed to load Branding global from Payload', error)
    return normalizeBranding({})
  }
})

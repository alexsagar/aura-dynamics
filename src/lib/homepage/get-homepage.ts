import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Homepage, Product } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/payload-media'
import { isPublicProduct, publicProductWhere } from '@/access/ecommerce'
import { isRetiredUrl } from '@/lib/site/routes'
import { toFilamentCard } from './product-cards'

export type HomepageViewModel = ReturnType<typeof normalizeHomepage>

/**
 * Payload Homepage Global -> UI-safe view model. Payload owns every string and
 * image; this only resolves nullability once instead of in JSX. Only an
 * explicit `enabled: false` hides a section. A missing image renders the
 * section's own background as the placeholder.
 */
function normalizeHomepage(cms: Homepage, popularDocs: Product[] = []) {
  const hero = {
    heading: cms.hero?.heading || '',
    imageAlt: mediaAlt(cms.hero?.image, ''),
    imageUrl: mediaUrl(cms.hero?.image),
    primaryCta: { label: cms.hero?.primaryCta?.label || '', url: cms.hero?.primaryCta?.url || '' },
    secondaryCta: { label: cms.hero?.secondaryCta?.label || '', url: cms.hero?.secondaryCta?.url || '' },
    subheading: cms.hero?.subheading || '',
  }

  const categories = {
    enabled: cms.categories?.enabled ?? true,
    // Cards for retired routes (3D Prints) or with no destination are dropped.
    items: (cms.categories?.items ?? []).filter((item) => item.url && !isRetiredUrl(item.url)).map((item) => ({
      imageUrl: mediaUrl(item.image),
      subtitle: item.subtitle || '',
      title: item.title || '',
      url: item.url || '',
    })),
  }

  // Editor order, public products only (popularDocs is already scoped; isPublicProduct is belt-and-braces).
  const popularProducts = (cms.popular?.products ?? [])
    .map((ref) => popularDocs.find((d) => d.id === (typeof ref === 'number' ? ref : ref?.id)))
    .filter((p): p is Product => Boolean(p) && isPublicProduct(p))
  const popular = {
    cards: popularProducts.flatMap((p) => {
      const card = toFilamentCard(p)
      return card ? [{ card, type: 'filament' as const }] : []
    }),
    enabled: cms.popular?.enabled ?? true,
    heading: cms.popular?.heading || '',
  }

  const materialItems = (cms.materialsSection?.items ?? []).map((item) => {
    const material = item.material && typeof item.material === 'object' ? item.material : null
    // Prefer the editor-set URL; otherwise deep-link into the filament catalog
    // filtered by this material (a real, working destination), falling back to
    // the educational materials page. Never an inert '#'.
    const url = item.url || (material?.slug ? `/filaments?material=${material.slug}` : '/materials')
    return {
      description: item.description || '',
      name: item.displayName || material?.name || '',
      url,
    }
  })
  const materialsSection = {
    enabled: cms.materialsSection?.enabled ?? true,
    heading: cms.materialsSection?.heading || '',
    items: materialItems,
  }

  const useCases = {
    enabled: cms.useCases?.enabled ?? true,
    heading: cms.useCases?.heading || '',
    items: (cms.useCases?.items ?? []).map((item) => ({
      imageUrl: mediaUrl(item.image),
      subtitle: item.subtitle || '',
      title: item.title || '',
      // Editorial "what you can print" cards: route to the filament catalog
      // when no (or a retired) URL is set, never an inert '#'.
      url: item.url && !isRetiredUrl(item.url) ? item.url : '/filaments',
    })),
  }

  // Fresh Prints promoted ready-made 3D prints, which the storefront no longer
  // sells: retired from the page. Its CMS fields stay for possible future use.

  const staffPickProduct = cms.staffPick?.product && typeof cms.staffPick.product === 'object' ? cms.staffPick.product : null
  const staffPick = {
    body: cms.staffPick?.body || '',
    ctaLabel: cms.staffPick?.cta?.label || '',
    ctaUrl: cms.staffPick?.cta?.url || '',
    enabled: cms.staffPick?.enabled ?? true,
    eyebrow: cms.staffPick?.eyebrow || '',
    heading: cms.staffPick?.heading || '',
    imageUrl: mediaUrl(cms.staffPick?.image) || (staffPickProduct ? mediaUrl(staffPickProduct.images?.[0]) : undefined),
  }

  const shadeShowcase = {
    availabilityNote: cms.shadeShowcase?.availabilityNote || '',
    shades: (cms.shadeShowcase?.shades ?? []).map((s, i) => ({
      hex: s.hex || '',
      id: s.id || String(i),
      image: mediaUrl(s.image),
      name: s.name || '',
    })),
    ctaLabel: cms.shadeShowcase?.ctaLabel || '',
    ctaUrl: cms.shadeShowcase?.ctaUrl || '',
    description: cms.shadeShowcase?.description || '',
    enabled: cms.shadeShowcase?.enabled ?? true,
    heading: cms.shadeShowcase?.heading || '',
  }

  const compare = {
    columns: (cms.compare?.columns ?? []).map((c) => ({ bestFor: c.bestFor || '', label: c.label || '' })),
    enabled: cms.compare?.enabled ?? true,
    heading: cms.compare?.heading || '',
    rows: (cms.compare?.rows ?? []).map((r) => ({
      label: r.label || '',
      scores: (r.scores ?? []).map((s) => s.score ?? 0),
    })),
  }

  const testimonials = { enabled: cms.testimonials?.enabled ?? false }

  const whyAura = {
    enabled: cms.whyAura?.enabled ?? true,
    heading: cms.whyAura?.heading || '',
    items: (cms.whyAura?.items ?? []).map((i) => ({ body: i.body || '', title: i.title || '' })),
    subheading: cms.whyAura?.subheading || '',
  }

  const learningHub = {
    enabled: cms.learningHub?.enabled ?? false,
    heading: cms.learningHub?.heading || '',
    items: (cms.learningHub?.items ?? []).map((i) => ({
      imageUrl: mediaUrl(i.image),
      meta: i.meta || '',
      summary: i.summary || '',
      title: i.title || '',
      url: i.url || '',
    })),
    viewAllLabel: cms.learningHub?.viewAll?.label || '',
    viewAllUrl: cms.learningHub?.viewAll?.url || '',
  }

  return { categories, compare, hero, learningHub, materialsSection, popular, shadeShowcase, staffPick, testimonials, useCases, whyAura }
}


export async function getHomepageViewModel(): Promise<HomepageViewModel> {
  try {
    const payload = await getPayload({ config: configPromise })
    const homepage = await payload.findGlobal({ slug: 'homepage', depth: 2, overrideAccess: false })
    // Upload fields inside a join are not populated through a global, at any
    // depth, so card products are loaded directly (variant photos populated),
    // with the public visibility scope applied server-side.
    const ids = (homepage.popular?.products ?? []).map((r) => (typeof r === 'number' ? r : r?.id)).filter(Boolean)
    const popularDocs = ids.length
      ? ((
          await payload.find({
            collection: 'products',
            where: { and: [publicProductWhere, { id: { in: ids } }] },
            depth: 2,
            limit: ids.length,
            pagination: false,
            joins: { variants: { limit: 100, sort: 'createdAt' } },
            overrideAccess: false,
          })
        ).docs as Product[])
      : []
    return normalizeHomepage(homepage, popularDocs)
  } catch (error) {
    // CMS unreachable: render the empty shell (no copy) instead of crashing
    // the storefront; content returns as soon as Payload is reachable.
    console.error('Failed to load Homepage global from Payload', error)
    return normalizeHomepage({} as Homepage)
  }
}

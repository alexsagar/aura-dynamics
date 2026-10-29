import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Homepage } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/payload-media'
import { populatedProducts, toFilamentCard, toPrintCard } from './product-cards'

export type HomepageViewModel = ReturnType<typeof normalizeHomepage>

/**
 * Payload Homepage Global -> UI-safe view model. Payload owns every string and
 * image; this only resolves nullability once instead of in JSX. Only an
 * explicit `enabled: false` hides a section. A missing image renders the
 * section's own background as the placeholder.
 */
function normalizeHomepage(cms: Homepage) {
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
    items: (cms.categories?.items ?? []).map((item) => ({
      imageUrl: mediaUrl(item.image),
      subtitle: item.subtitle || '',
      title: item.title || '',
      url: item.url || '',
    })),
  }

  const popularProducts = populatedProducts(cms.popular?.products)
  type PopularCard =
    | { card: NonNullable<ReturnType<typeof toFilamentCard>>; type: 'filament' }
    | { card: NonNullable<ReturnType<typeof toPrintCard>>; type: 'print' }
  const popular = {
    cards: popularProducts.reduce<PopularCard[]>((acc, p) => {
      if (p.productType === 'filament') {
        const card = toFilamentCard(p)
        if (card) acc.push({ card, type: 'filament' })
      } else {
        const card = toPrintCard(p)
        if (card) acc.push({ card, type: 'print' })
      }
      return acc
    }, []),
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
      // Editorial "what you can print" cards: route to the ready-stock prints
      // catalog when no explicit URL is set, never an inert '#'.
      url: item.url || '/3d-prints',
    })),
  }

  const freshProducts = populatedProducts(cms.freshPrints?.products)
  const freshPrints = {
    enabled: cms.freshPrints?.enabled ?? true,
    heading: cms.freshPrints?.heading || '',
    printCards: freshProducts.map(toPrintCard).filter((c) => c != null),
    viewAllLabel: cms.freshPrints?.viewAll?.label || '',
    viewAllUrl: cms.freshPrints?.viewAll?.url || '/3d-prints',
  }

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

  return { categories, compare, freshPrints, hero, learningHub, materialsSection, popular, shadeShowcase, staffPick, testimonials, useCases, whyAura }
}


export async function getHomepageViewModel(): Promise<HomepageViewModel> {
  try {
    const payload = await getPayload({ config: configPromise })
    const homepage = await payload.findGlobal({
      slug: 'homepage',
      depth: 2,
    })
    return normalizeHomepage(homepage)
  } catch (error) {
    // CMS unreachable: render the empty shell (no copy) instead of crashing
    // the storefront; content returns as soon as Payload is reachable.
    console.error('Failed to load Homepage global from Payload', error)
    return normalizeHomepage({} as Homepage)
  }
}

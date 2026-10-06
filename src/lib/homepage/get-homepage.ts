import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Homepage } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/payload-media'
import { populatedProducts, toFilamentCard, toPrintCard } from './product-cards'
import {
  categoriesFallback,
  compareFallback,
  heroFallback,
  imageFallback,
  shadeShowcaseFallback,
  staffPickFallback,
  useCasesFallback,
  whyAuraFallback,
} from './fallback'

export type HomepageViewModel = ReturnType<typeof normalizeHomepage>

const HERO_IMAGE_FALLBACK_ALT = 'Filament spools in a printing workspace'

/**
 * Payload Homepage Global -> UI-safe view model. Every CMS field is
 * optional, so this is where nullability gets resolved once instead of in
 * JSX. `text || fallback` keeps a section intact if a single field is
 * cleared; only an explicit `enabled: false` (or, pre-launch, `undefined`
 * defaulting true) hides a whole section.
 */
function normalizeHomepage(cms: Homepage) {
  const hero = {
    heading: cms.hero?.heading || heroFallback.heading,
    imageAlt: mediaAlt(cms.hero?.image, HERO_IMAGE_FALLBACK_ALT),
    imageUrl: mediaUrl(cms.hero?.image) || imageFallback.hero,
    primaryCta: {
      label: cms.hero?.primaryCta?.label || heroFallback.primaryCta.label,
      url: cms.hero?.primaryCta?.url || heroFallback.primaryCta.url,
    },
    secondaryCta: {
      label: cms.hero?.secondaryCta?.label || heroFallback.secondaryCta.label,
      url: cms.hero?.secondaryCta?.url || heroFallback.secondaryCta.url,
    },
    subheading: cms.hero?.subheading || heroFallback.subheading,
  }

  const categoryImageFallbacks = [
    imageFallback.categoryFilaments,
    imageFallback.categoryPrints,
    imageFallback.categoryAccessories,
  ]
  const categoryItems = cms.categories?.items?.length
    ? cms.categories.items.map((item, i) => ({
        imageUrl: mediaUrl(item.image) || categoryImageFallbacks[i] || imageFallback.hero,
        subtitle: item.subtitle || categoriesFallback[i]?.subtitle || '',
        title: item.title || categoriesFallback[i]?.title || '',
        url: item.url ?? categoriesFallback[i]?.url ?? '',
      }))
    : categoriesFallback.map((c, i) => ({ imageUrl: categoryImageFallbacks[i], ...c }))
  const categories = { enabled: cms.categories?.enabled ?? true, items: categoryItems }

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
    heading: cms.popular?.heading || 'Popular.',
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
    heading: cms.materialsSection?.heading || 'Explore by Material',
    items: materialItems,
  }

  const useCaseItems = cms.useCases?.items?.length
    ? cms.useCases.items.map((item, i) => ({
        imageUrl:
          mediaUrl(item.image) ||
          [imageFallback.useCaseFunctional, imageFallback.useCaseMiniatures, imageFallback.useCaseCosplay][i] ||
          imageFallback.hero,
        subtitle: item.subtitle || useCasesFallback[i]?.subtitle || '',
        title: item.title || useCasesFallback[i]?.title || '',
        // Editorial "what you can print" cards: route to the ready-stock prints
        // catalog when no explicit URL is set, never an inert '#'.
        url: item.url || useCasesFallback[i]?.url || '/3d-prints',
      }))
    : useCasesFallback.map((u, i) => ({
        imageUrl: [imageFallback.useCaseFunctional, imageFallback.useCaseMiniatures, imageFallback.useCaseCosplay][i],
        ...u,
        url: u.url || '/3d-prints',
      }))
  const useCases = { enabled: cms.useCases?.enabled ?? true, heading: cms.useCases?.heading || 'What are you printing?', items: useCaseItems }

  const freshProducts = populatedProducts(cms.freshPrints?.products)
  const freshPrints = {
    enabled: cms.freshPrints?.enabled ?? true,
    heading: cms.freshPrints?.heading || 'Fresh Prints.',
    printCards: freshProducts.map(toPrintCard).filter((c) => c != null),
    viewAllLabel: cms.freshPrints?.viewAll?.label || 'See all prints',
    viewAllUrl: cms.freshPrints?.viewAll?.url || '/3d-prints',
  }

  const staffPickProduct = cms.staffPick?.product && typeof cms.staffPick.product === 'object' ? cms.staffPick.product : null
  const staffPick = {
    body: cms.staffPick?.body || staffPickFallback.body,
    ctaLabel: cms.staffPick?.cta?.label || staffPickFallback.cta.label,
    ctaUrl: cms.staffPick?.cta?.url || staffPickFallback.cta.url,
    enabled: cms.staffPick?.enabled ?? true,
    eyebrow: cms.staffPick?.eyebrow || staffPickFallback.eyebrow,
    heading: cms.staffPick?.heading || staffPickFallback.heading,
    imageUrl: mediaUrl(cms.staffPick?.image) || (staffPickProduct ? mediaUrl(staffPickProduct.images?.[0]) : undefined) || imageFallback.staffPick,
  }

  const shadeShowcase = {
    ctaLabel: cms.shadeShowcase?.ctaLabel || shadeShowcaseFallback.ctaLabel,
    ctaUrl: cms.shadeShowcase?.ctaUrl || shadeShowcaseFallback.ctaUrl,
    description: cms.shadeShowcase?.description || shadeShowcaseFallback.description,
    enabled: cms.shadeShowcase?.enabled ?? true,
    heading: cms.shadeShowcase?.heading || shadeShowcaseFallback.heading,
  }

  const compareColumns = cms.compare?.columns?.length
    ? cms.compare.columns.map((c) => ({ bestFor: c.bestFor || '', label: c.label || '' }))
    : compareFallback.columns
  const compareRows = cms.compare?.rows?.length
    ? cms.compare.rows.map((r) => ({
        label: r.label || '',
        scores: (r.scores ?? []).map((s) => s.score ?? 0),
      }))
    : compareFallback.rows
  const compare = { columns: compareColumns, enabled: cms.compare?.enabled ?? true, heading: cms.compare?.heading || compareFallback.heading, rows: compareRows }

  const testimonials = { enabled: cms.testimonials?.enabled ?? false }

  const whyAuraItems = cms.whyAura?.items?.length
    ? cms.whyAura.items.map((i) => ({ body: i.body || '', title: i.title || '' }))
    : whyAuraFallback.items
  const whyAura = {
    enabled: cms.whyAura?.enabled ?? true,
    heading: cms.whyAura?.heading || whyAuraFallback.heading,
    items: whyAuraItems,
    subheading: cms.whyAura?.subheading || whyAuraFallback.subheading,
  }

  const learningHub = {
    enabled: cms.learningHub?.enabled ?? false,
    heading: cms.learningHub?.heading || 'Learning Hub',
    items: (cms.learningHub?.items ?? []).map((i) => ({
      imageUrl: mediaUrl(i.image),
      meta: i.meta || '',
      summary: i.summary || '',
      title: i.title || '',
      url: i.url || '',
    })),
    viewAllLabel: cms.learningHub?.viewAll?.label || 'View all guides',
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
    // CMS unreachable: fall back to the fully-static approved homepage so a
    // Payload/DB outage doesn't take the storefront down with it.
    console.error('Failed to load Homepage global from Payload', error)
    return normalizeHomepage({} as Homepage)
  }
}

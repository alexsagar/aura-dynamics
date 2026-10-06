import { getPayload } from 'payload'
import type { Payload } from 'payload'

import configPromise from '../payload.config'
import { findMediaByKey } from './storefront-media'

/**
 * Seeds the current approved storefront copy into the core Globals.
 *
 * Globals are single documents, so this is naturally idempotent — a rerun
 * rewrites the same values rather than duplicating anything.
 *
 * Deliberate omissions, all flagged in the field descriptions too:
 *  - testimonials stay disabled and unattributed (the frontend ones are fabricated)
 *  - collection item counts are not seeded (they were invented numbers)
 *  - "trusted by" printer-brand wordmarks are not seeded (unauthorised marks)
 *  - footer phone/address/email stay empty (unverified placeholders)
 *  - CTA urls pointing at routes that do not exist are left blank
 */

const mediaId = async (payload: Payload, key: string) => {
  const doc = await findMediaByKey(payload, key)
  if (!doc) {
    throw new Error(`Media "${key}" not found. Run the storefront media seed first.`)
  }
  return doc.id
}

const materialIdBySlug = async (payload: Payload, slug: string) => {
  const { docs } = await payload.find({
    collection: 'materials',
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0]?.id ?? null
}

const productIds = async (payload: Payload, productType: string, limit: number) => {
  const { docs } = await payload.find({
    collection: 'products',
    where: { productType: { equals: productType } },
    limit,
    pagination: false,
    depth: 0,
    sort: 'createdAt',
    overrideAccess: true,
  })
  return docs.map((d) => d.id)
}

/**
 * Assigns existing migrated Media to a product's `images` field by slug, so
 * homepage merchandising for it stops falling back to demo cards. Skips
 * products that already have images so a rerun (or a manual admin edit)
 * isn't clobbered.
 */
const assignProductImages = async (payload: Payload, slug: string, mediaIds: number[]) => {
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const product = docs[0]
  if (!product) {
    console.log(`  ! product "${slug}" not found, skipping image assignment`)
    return
  }
  if (product.images?.length) {
    console.log(`  = ${slug} already has images, skipping`)
    return
  }
  await payload.update({
    collection: 'products',
    id: product.id,
    data: { images: mediaIds },
    overrideAccess: true,
  })
  console.log(`  + ${slug} <- images [${mediaIds.join(', ')}]`)
}

export async function seedCmsFoundation() {
  console.log('🧱 CMS foundation seed')
  const payload = await getPayload({ config: configPromise })

  const [hero, catFilaments, catPrints, catAccessories, useFunctional, useMini, useCosplay, staff] =
    await Promise.all([
      mediaId(payload, 'homepage-hero'),
      mediaId(payload, 'homepage-category-filaments'),
      mediaId(payload, 'homepage-category-3d-prints'),
      mediaId(payload, 'homepage-workshop-story'),
      mediaId(payload, 'homepage-workshop-story'),
      mediaId(payload, 'homepage-use-case-miniatures'),
      mediaId(payload, 'homepage-use-case-cosplay'),
      mediaId(payload, 'homepage-staff-pick'),
    ])

  const [pla, petg, abs, tpu] = await Promise.all([
    materialIdBySlug(payload, 'pla'),
    materialIdBySlug(payload, 'petg'),
    materialIdBySlug(payload, 'abs'),
    materialIdBySlug(payload, 'tpu'),
  ])

  const [filamentProducts, printProducts] = await Promise.all([
    productIds(payload, 'filament', 5),
    productIds(payload, '3d-print', 4),
  ])

  await payload.updateGlobal({
    slug: 'homepage',
    overrideAccess: true,
    data: {
      _status: 'published',
      hero: {
        heading: 'Form meets function.',
        subheading:
          'High-performance polymers and ready-stock 3D prints. Engineered perfectly for makers across Nepal.',
        image: hero,
        primaryCta: { label: 'Shop Now', url: '/filaments' },
        // Corrected: the frontend button labelled "Explore Filaments" links to
        // /3d-prints. Destination fixed to match the label.
        secondaryCta: { label: 'Explore Filaments', url: '/filaments' },
      },
      categories: {
        enabled: true,
        items: [
          { title: 'Filaments', subtitle: 'High-performance polymers', url: '/filaments', image: catFilaments },
          { title: '3D Prints', subtitle: 'Ready to ship', url: '/3d-prints', image: catPrints },
          // /accessories does not exist — url left blank on purpose.
          { title: 'Accessories', subtitle: 'Parts & Upgrades', url: '', image: catAccessories },
        ],
      },
      popular: {
        enabled: true,
        heading: 'Popular.',
        products: [...filamentProducts, ...printProducts].slice(0, 5),
      },
      materialsSection: {
        enabled: true,
        heading: 'Explore by Material',
        items: [
          {
            material: pla,
            displayName: 'PLA+',
            description:
              'The undisputed standard. Easy to print, highly rigid, and perfect for rapid prototypes, architectural models, and display pieces.',
            url: '',
          },
          {
            material: petg,
            displayName: 'PETG',
            description:
              'Engineered for durability. Strong, flexible, and temperature resistant. The ideal choice for mechanical parts and outdoor use.',
            url: '',
          },
          {
            material: abs,
            displayName: 'ABS',
            description:
              'Industrial strength. Unmatched impact resistance and heat deflection for demanding, high-stress engineering applications.',
            url: '',
          },
          {
            material: tpu,
            displayName: 'TPU',
            description:
              'Ultimate flexibility. A rubber-like polymer capable of extreme bending and compression without losing its shape.',
            url: '',
          },
        ],
      },
      useCases: {
        enabled: true,
        heading: 'What are you printing?',
        // /collections/[slug] does not exist yet — urls left blank on purpose.
        items: [
          { title: 'Functional Parts', subtitle: 'Strong engineering materials.', url: '', image: useFunctional },
          { title: 'Miniatures', subtitle: 'High detail PLA+ resins.', url: '', image: useMini },
          { title: 'Cosplay Props', subtitle: 'Lightweight & easy to sand.', url: '', image: useCosplay },
        ],
      },
      freshPrints: {
        enabled: true,
        heading: 'Fresh Prints.',
        viewAll: { label: 'See all prints', url: '/3d-prints' },
        products: printProducts,
      },
      staffPick: {
        enabled: true,
        eyebrow: 'Staff Pick',
        heading: 'Matte Black PLA+',
        body: 'Our best-selling filament. Achieves a flawless, zero-glare finish that hides layer lines perfectly. Ideal for photography props, architectural models, and sleek functional enclosures.',
        image: staff,
        cta: { label: 'Shop Matte Black', url: '/filaments' },
      },
      shadeShowcase: {
        enabled: true,
        heading: 'Made in every shade.',
        description:
          'From pure matte black to vibrant neon green, find the perfect high-precision color for your next project.',
        ctaLabel: 'Explore all colors →',
        ctaUrl: '/filaments',
      },
      compare: {
        enabled: true,
        heading: 'Compare.',
        columns: [
          { label: 'PLA+', bestFor: 'Detail' },
          { label: 'PETG', bestFor: 'Mechanical' },
          { label: 'TPU', bestFor: 'Flexible' },
          { label: 'ABS', bestFor: 'High Temp' },
        ],
        rows: [
          { label: 'Strength', scores: [4, 4, 2, 5].map((score) => ({ score })) },
          { label: 'Flexibility', scores: [1, 3, 5, 1].map((score) => ({ score })) },
          { label: 'Durability', scores: [3, 5, 5, 5].map((score) => ({ score })) },
        ],
      },
      testimonials: {
        // Frontend testimonials are fabricated quotes from named people with
        // stock portraits. Not migrated as production content.
        enabled: false,
        heading: 'Community Spotlight',
        items: [],
      },
      whyAura: {
        enabled: true,
        heading: 'Why Aura.',
        subheading: 'Engineered for those who demand precision and reliability.',
        items: [
          {
            title: 'Premium Quality',
            body: 'Numakers filaments are precision extruded to ±0.03mm tolerance for perfectly jam-free printing.',
          },
          {
            title: 'Always In Stock',
            body: 'We maintain a massive local inventory. If you can add it to your cart, it is ready to ship.',
          },
          {
            title: 'Next Day Delivery',
            body: 'Shipped instantly across Nepal so your printing workflow is never unexpectedly interrupted.',
          },
        ],
      },
      learningHub: {
        // /guides and every guide route are missing. Section stays off, no urls seeded.
        enabled: false,
        heading: 'Learning Hub',
        viewAll: { label: 'View all guides', url: '' },
        items: [],
      },
    },
  })

  await payload.updateGlobal({
    slug: 'header',
    overrideAccess: true,
    data: {
      navLinks: [
        { label: 'Filaments', url: '/filaments' },
        { label: '3D Prints', url: '/3d-prints' },
        { label: 'Collections', url: '/collections' },
        { label: 'Materials', url: '/materials' },
        { label: 'About', url: '/about' },
      ],
      announcement: { enabled: false },
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    overrideAccess: true,
    data: {
      brandHeading: 'Engineered perfectly for makers across Nepal.',
      brandCopy:
        'Numakers filaments and ready-stock 3D prints, shipped directly to your door with unmatched precision and reliability.',
      newsletterHeading: 'Join our newsletter',
      columns: [
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
          links: [{ label: 'About Us', url: '/about' }],
        },
      ],
      // contact + socialLinks intentionally empty: unverified placeholders.
      legalLinks: [],
      copyright: 'Aura Dynamics. All rights reserved.',
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    overrideAccess: true,
    data: {
      siteName: 'Aura',
      defaultSeo: {
        title: 'Aura — Filaments and 3D prints for makers in Nepal',
        description:
          'High-performance polymers and ready-stock 3D prints. Engineered perfectly for makers across Nepal.',
      },
    },
  })

  // Gap-fill product photography: existing migrated Media, no downloads.
  console.log('🖼  Product image assignment')
  await assignProductImages(payload, 'numakers-pla', [staff, catFilaments])
  await assignProductImages(payload, 'dragon-figure', [useMini])

  console.log('🧱 Done. Globals: homepage, header, footer, site-settings')
}

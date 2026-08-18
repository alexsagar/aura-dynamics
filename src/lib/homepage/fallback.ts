/**
 * Homepage-only fallback content — the copy/urls that were hardcoded in
 * page.tsx before CMS wiring. Used only when a field is missing from the
 * Homepage Global, so an incomplete CMS edit can't collapse a section.
 * Product-card fallbacks live in `@/data/storefront-demo` instead, since
 * other routes already depend on that file.
 */

/**
 * Original remote placeholders, kept only as a last-resort image fallback if
 * a Homepage Media relationship is ever empty. All of these already have a
 * migrated Media record — this path should not normally be hit.
 */
export const imageFallback = {
  categoryAccessories: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1600&auto=format&fit=crop',
  categoryFilaments: 'https://images.unsplash.com/photo-1617478755490-e21232a5eeaf?q=80&w=800&auto=format&fit=crop',
  categoryPrints: 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=800&auto=format&fit=crop',
  hero: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=1600&auto=format&fit=crop',
  staffPick: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1200&auto=format&fit=crop',
  useCaseCosplay: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop',
  useCaseFunctional: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800&auto=format&fit=crop',
  useCaseMiniatures: 'https://images.unsplash.com/photo-1603984362497-0a878f607b92?q=80&w=800&auto=format&fit=crop',
}

export const heroFallback = {
  heading: 'Form meets function.',
  primaryCta: { label: 'Shop Now', url: '/filaments' },
  secondaryCta: { label: 'Explore Filaments', url: '/filaments' },
  subheading:
    'High-performance polymers and ready-stock 3D prints. Engineered perfectly for makers across Nepal.',
}

export const categoriesFallback = [
  { subtitle: 'High-performance polymers', title: 'Filaments', url: '/filaments' },
  { subtitle: 'Ready to ship', title: '3D Prints', url: '/3d-prints' },
  { subtitle: 'Parts & Upgrades', title: 'Accessories', url: '' },
]

export const useCasesFallback = [
  { subtitle: 'Strong engineering materials.', title: 'Functional Parts', url: '' },
  { subtitle: 'High detail PLA+ resins.', title: 'Miniatures', url: '' },
  { subtitle: 'Lightweight & easy to sand.', title: 'Cosplay Props', url: '' },
]

export const staffPickFallback = {
  body: 'Our best-selling filament. Achieves a flawless, zero-glare finish that hides layer lines perfectly. Ideal for photography props, architectural models, and sleek functional enclosures.',
  cta: { label: 'Shop Matte Black', url: '/filaments' },
  eyebrow: 'Staff Pick',
  heading: 'Matte Black PLA+',
}

export const shadeShowcaseFallback = {
  ctaLabel: 'Explore all colors →',
  ctaUrl: '/filaments',
  description:
    'From pure matte black to vibrant neon green, find the perfect high-precision color for your next project.',
  heading: 'Made in every shade.',
}

export const compareFallback = {
  columns: [
    { bestFor: 'Detail', label: 'PLA+' },
    { bestFor: 'Mechanical', label: 'PETG' },
    { bestFor: 'Flexible', label: 'TPU' },
    { bestFor: 'High Temp', label: 'ABS' },
  ],
  heading: 'Compare.',
  rows: [
    { label: 'Strength', scores: [4, 4, 2, 5] },
    { label: 'Flexibility', scores: [1, 3, 5, 1] },
    { label: 'Durability', scores: [3, 5, 5, 5] },
  ],
}

export const whyAuraFallback = {
  heading: 'Why Aura.',
  items: [
    {
      body: 'Numakers filaments are precision extruded to ±0.03mm tolerance for perfectly jam-free printing.',
      title: 'Premium Quality',
    },
    {
      body: 'We maintain a massive local inventory. If you can add it to your cart, it is ready to ship.',
      title: 'Always In Stock',
    },
    {
      body: 'Shipped instantly across Nepal so your printing workflow is never unexpectedly interrupted.',
      title: 'Next Day Delivery',
    },
  ],
  subheading: 'Engineered for those who demand precision and reliability.',
}

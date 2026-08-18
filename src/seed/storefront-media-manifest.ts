/**
 * Every distinct remote image the storefront currently renders, mapped to the
 * CMS slot it stands in for.
 *
 * These are temporary Unsplash placeholders, not final Aura photography. They
 * are imported so the CMS can own the reference; the images themselves get
 * replaced through Payload Admin later.
 *
 * Deduplication is by Unsplash photo id: the frontend reuses ~10 photos across
 * ~55 slots, and each photo becomes exactly one Media record.
 *
 * Deliberately NOT included: the three portrait photos used by the testimonial
 * carousel (photo-1494790108377, photo-1507003211169, photo-1534528741775).
 * They back fabricated, named customer quotes and must not enter the CMS as
 * production content.
 */
export type MediaManifestEntry = {
  /** Stable dedupe key, stored on the Media record. */
  key: string
  sourceUrl: string
  filename: string
  alt: string
  /** Where this photo currently appears in the storefront. Documentation only. */
  usedBy: string[]
}

const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/${id}?q=80&w=${width}&auto=format&fit=crop`

export const storefrontMediaManifest: MediaManifestEntry[] = [
  {
    key: 'homepage-hero',
    sourceUrl: unsplash('photo-1612825173281-9a193378527e'),
    filename: 'homepage-hero-temp.jpg',
    alt: 'Filament spools in a printing workspace',
    usedBy: ['homepage hero', 'homepage learning hub card 2', 'filament cards'],
  },
  {
    key: 'homepage-category-filaments',
    sourceUrl: unsplash('photo-1617478755490-e21232a5eeaf'),
    filename: 'homepage-category-filaments-temp.jpg',
    alt: 'Close-up of coloured 3D printing filament',
    usedBy: ['homepage categories: Filaments', 'homepage popular carousel'],
  },
  {
    key: 'homepage-category-3d-prints',
    sourceUrl: unsplash('photo-1622737133809-d95047b9e673'),
    filename: 'homepage-category-3d-prints-temp.jpg',
    alt: 'Finished 3D printed objects on a workbench',
    usedBy: ['homepage categories: 3D Prints', 'homepage fresh prints'],
  },
  {
    key: 'homepage-workshop-story',
    sourceUrl: unsplash('photo-1581092580497-e0d23cbdf1dc'),
    filename: 'homepage-workshop-story-temp.jpg',
    alt: 'Engineer inspecting a printed part in a workshop',
    usedBy: ['homepage categories: Accessories', 'homepage use case: Functional Parts'],
  },
  {
    key: 'homepage-use-case-miniatures',
    sourceUrl: unsplash('photo-1603984362497-0a878f607b92'),
    filename: 'homepage-use-case-miniatures-temp.jpg',
    alt: 'Detailed printed miniature figures',
    usedBy: ['homepage use case: Miniatures', 'homepage fresh prints'],
  },
  {
    key: 'homepage-use-case-cosplay',
    sourceUrl: unsplash('photo-1595225476474-87563907a212'),
    filename: 'homepage-use-case-cosplay-temp.jpg',
    alt: 'Printed prop parts ready for finishing',
    usedBy: ['homepage use case: Cosplay Props', 'homepage fresh prints'],
  },
  {
    key: 'homepage-staff-pick',
    sourceUrl: unsplash('photo-1628155930542-3c7a64e2c833'),
    filename: 'homepage-staff-pick-temp.jpg',
    alt: 'Matte black filament spool lit from the side',
    usedBy: ['homepage staff pick', 'product gallery placeholder'],
  },
  {
    key: 'landing-materials-hero',
    sourceUrl: unsplash('photo-1516321165247-4aa89a48be28'),
    filename: 'landing-materials-hero-temp.jpg',
    alt: 'Workbench with printing tools and materials',
    usedBy: ['/materials', '/3d-prints', '/collections'],
  },
  {
    key: 'landing-filaments-hero',
    sourceUrl: unsplash('photo-1581091226825-a6a2a5aee158'),
    filename: 'landing-filaments-hero-temp.jpg',
    alt: 'Maker working at a desk beside a 3D printer',
    usedBy: ['/filaments', '/about', 'product recommendations'],
  },
  // 'photo-1531297172815-1a221f73752e' (product recommendations, second card) is
  // omitted: the URL 404s on Unsplash today — it's a pre-existing broken image in
  // the frontend, not something to migrate. Flagged for the frontend to fix
  // separately; not a CMS content issue.
]

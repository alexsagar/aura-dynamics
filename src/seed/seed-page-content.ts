import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import { PAGE_FALLBACKS } from '../lib/site/get-page-content'

// Seeds the PageContent global from the exact current in-code copy so the CMS
// owns it with zero visible change. Idempotent (global = single doc).
async function run() {
  const payload = await getPayload({ config: configPromise })
  const f = PAGE_FALLBACKS
  const seo = (p: { seoTitle: string; seoDescription: string }) => ({
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
  })
  await payload.updateGlobal({
    slug: 'page-content',
    overrideAccess: true,
    data: {
      filaments: { heading: f.filaments.heading, intro: f.filaments.intro, ...seo(f.filaments) },
      prints: { heading: f.prints.heading, intro: f.prints.intro, ...seo(f.prints) },
      collections: { heading: f.collections.heading, intro: f.collections.intro, ...seo(f.collections) },
      about: { intro: f.about.intro, ...seo(f.about) },
      materials: { heading: f.materials.heading, intro: f.materials.intro, ...seo(f.materials) },
      privacy: { heading: f.privacy.heading, intro: f.privacy.intro, ...seo(f.privacy) },
      terms: { heading: f.terms.heading, intro: f.terms.intro, ...seo(f.terms) },
    } as any,
  })
  console.log('PAGE_CONTENT_SEEDED')
}
run().then(() => process.exit(0)).catch((e) => { console.error('SEED_ERROR', e?.message || e); process.exit(1) })

import 'dotenv/config'
import { getPayload } from 'payload'

import configPromise from '../payload.config'

/**
 * Organises existing Numakers PLA copy into the structured product fields.
 * No new claims: key features restate sentences already in the stored
 * description. The description's "Available colours", "Specifications" and
 * "Ordering & delivery" blocks are dropped from the rich text because the page
 * now renders them from variants, Filament Details and Site Settings (the
 * previous text stays in the product's version history).
 *
 * Idempotent and non-destructive: features only fill an empty list; the
 * description is trimmed only while it still contains those blocks.
 *   tsx src/seed/seed-product-content.ts [--dry-run]
 */
const SLUG = 'numakers-pla'
const STRUCTURED_HEADINGS = ['Available colours', 'Specifications', 'Ordering & delivery']

const keyFeatures = [
  { title: '1.75 mm · 1 kg spool', description: 'A 1 kg spool of 1.75 mm PLA filament for everyday 3D printing.' },
  { title: 'Everyday PLA', description: 'Straightforward to print and well suited to prototypes, models and display pieces.' },
  { title: 'Solid colours', description: 'Each spool is a single, solid colour from the Numakers range.' },
  { title: 'Seven shades', description: 'Match a project end to end or keep a few shades on hand for quick swaps.' },
]

const textOf = (n: any): string => (n?.text ?? '') + (n?.children ?? []).map(textOf).join('')

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: SLUG } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const p: any = docs[0]
  if (!p) throw new Error(`${SLUG} not found`)

  const data: Record<string, unknown> = {}
  if (!p.keyFeatures?.length) data.keyFeatures = keyFeatures

  const children: any[] = p.description?.root?.children ?? []
  const cut = children.findIndex((n) => n.type === 'heading' && STRUCTURED_HEADINGS.includes(textOf(n).trim()))
  if (cut > 0) {
    data.description = { ...p.description, root: { ...p.description.root, children: children.slice(0, cut) } }
  }

  console.log('fill:', Object.keys(data).join(', ') || '(nothing)')
  if (cut > 0) console.log('description keeps:', children.slice(0, cut).map((n) => textOf(n).slice(0, 50)))
  if (dryRun || !Object.keys(data).length) return console.log(dryRun ? 'DRY_RUN' : 'NOTHING_TO_DO')

  await payload.update({ collection: 'products', id: p.id, overrideAccess: true, data })
  console.log('PRODUCT_CONTENT_SEEDED')
}
run().then(() => process.exit(0)).catch((e) => { console.error('SEED_ERROR', e?.message || e); process.exit(1) })

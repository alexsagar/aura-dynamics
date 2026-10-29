import 'dotenv/config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

import configPromise from '../payload.config'
import { homepageFixture, pageContentFixture } from './page-content-fixture'
import { findMediaByKey, seedStorefrontMedia } from './storefront-media'

/**
 * Backfills the Page Content, About Page and Materials Page globals (and the
 * Homepage staff-pick image + shade swatches) from the fixture. Non-destructive and idempotent: only empty CMS values are
 * filled; anything an editor already set is left untouched. Image slots
 * import their Unsplash source once into Media (deduped by migrationKey).
 *
 *   pnpm tsx src/seed/seed-page-content.ts           # apply
 *   pnpm tsx src/seed/seed-page-content.ts --dry-run # report only
 */
type Json = any

const isEmpty = (v: unknown) =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)

const mediaKeys = (fx: Json, out = new Set<string>()): Set<string> => {
  if (typeof fx === 'string' && fx.startsWith('media:')) out.add(fx.slice(6))
  else if (fx && typeof fx === 'object') Object.values(fx).forEach((v) => mediaKeys(v, out))
  return out
}

/** Resolve `media:<key>` placeholders to Media ids (recursively). */
const resolve = (fx: Json, ids: Map<string, number>): Json => {
  if (typeof fx === 'string' && fx.startsWith('media:')) {
    const id = ids.get(fx.slice(6))
    if (id === undefined) throw new Error(`Media ${fx} missing`)
    return id
  }
  if (Array.isArray(fx)) return fx.map((v) => resolve(v, ids))
  if (fx && typeof fx === 'object' && !('root' in fx)) {
    return Object.fromEntries(Object.entries(fx).map(([k, v]) => [k, resolve(v, ids)]))
  }
  return fx
}

/** Fill only empty values in `cms` from `fx`; returns merged copy + filled paths. */
const fill = (cms: Json, fx: Json, ids: Map<string, number>, path: string, filled: string[]): Json => {
  const out = { ...(cms ?? {}) }
  for (const [k, v] of Object.entries(fx)) {
    const p = `${path}.${k}`
    const isGroup = v && typeof v === 'object' && !Array.isArray(v) && !('root' in (v as object))
    if (isGroup) out[k] = fill(out[k], v, ids, p, filled)
    else if (v !== '' && isEmpty(out[k])) {
      out[k] = resolve(v, ids)
      filled.push(p)
    }
  }
  return out
}

async function mediaIds(payload: Payload, keys: Set<string>, dryRun: boolean) {
  if (!dryRun) await seedStorefrontMedia([...keys])
  const ids = new Map<string, number>()
  for (const key of keys) {
    const doc = await findMediaByKey(payload, key)
    ids.set(key, doc ? (doc.id as number) : -1)
  }
  return ids
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const payload = await getPayload({ config: configPromise })
  const keys = mediaKeys([pageContentFixture, homepageFixture])
  const ids = await mediaIds(payload, keys, dryRun)

  const { about, materials, ...pageGroups } = pageContentFixture
  const targets = [
    { slug: 'page-content', fx: pageGroups },
    { slug: 'about-page', fx: about },
    { slug: 'materials-page', fx: materials },
  ] as const
  const writes: Array<{ slug: (typeof targets)[number]['slug']; data: Json }> = []
  for (const { slug, fx } of targets) {
    const doc = await payload.findGlobal({ slug, depth: 0, overrideAccess: true })
    const filled: string[] = []
    const data = fill(doc, fx, ids, slug, filled)
    console.log(`${slug} filled:`, filled.length ? filled.join(', ') : '(nothing)')
    if (filled.length) writes.push({ slug, data })
  }

  const home = await payload.findGlobal({ slug: 'homepage', depth: 0, overrideAccess: true })
  const homeFilled: string[] = []
  const homeData = {
    staffPick: fill((home as Json).staffPick, homepageFixture.staffPick, ids, 'staffPick', homeFilled),
    shadeShowcase: fill((home as Json).shadeShowcase, homepageFixture.shadeShowcase, ids, 'shadeShowcase', homeFilled),
  }
  console.log('homepage filled:', homeFilled.length ? homeFilled.join(', ') : '(nothing)')
  if (dryRun) return console.log('DRY_RUN — no writes')

  for (const { slug, data } of writes) {
    const { id: _id, globalType: _g, createdAt: _c, updatedAt: _u, ...rest } = data
    await payload.updateGlobal({ slug, overrideAccess: true, data: rest })
  }
  if (homeFilled.length) {
    // Homepage has drafts enabled: publish so the live storefront reads it.
    await payload.updateGlobal({
      slug: 'homepage',
      overrideAccess: true,
      data: { ...homeData, _status: 'published' } as Json,
    })
  }
  console.log('PAGE_CONTENT_SEEDED')
}
run().then(() => process.exit(0)).catch((e) => { console.error('SEED_ERROR', e?.message || e); process.exit(1) })

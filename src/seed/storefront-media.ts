import { getPayload } from 'payload'
import type { Payload } from 'payload'

import configPromise from '../payload.config'
import { storefrontMediaManifest } from './storefront-media-manifest'

/**
 * Downloads the storefront's current remote placeholder photography into Payload
 * Media, one record per distinct source image.
 *
 * Idempotent: reruns match on `migrationKey`, so nothing is re-downloaded or
 * duplicated. Node-only script — it does not run inside the Worker runtime.
 */
export async function findMediaByKey(payload: Payload, key: string) {
  const { docs } = await payload.find({
    collection: 'media',
    where: { migrationKey: { equals: key } },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0]
}

export async function seedStorefrontMedia() {
  console.log('🖼  Storefront media migration')
  const payload = await getPayload({ config: configPromise })

  let created = 0
  let skipped = 0

  for (const entry of storefrontMediaManifest) {
    const existing = await findMediaByKey(payload, entry.key)
    if (existing) {
      skipped++
      console.log(`  = ${entry.key} (exists, id ${existing.id})`)
      continue
    }

    const res = await fetch(entry.sourceUrl)
    if (!res.ok) {
      // Fail loudly: a half-migrated media set is worse than none.
      throw new Error(`Download failed for ${entry.key}: ${res.status} ${res.statusText}`)
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    if (!buffer.length) throw new Error(`Empty response for ${entry.key}`)

    const doc = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: {
        alt: entry.alt,
        migrationKey: entry.key,
        sourceUrl: entry.sourceUrl,
        temporaryAsset: true,
      },
      file: {
        name: entry.filename,
        data: buffer,
        mimetype: res.headers.get('content-type') || 'image/jpeg',
        size: buffer.length,
      },
    })
    created++
    console.log(`  + ${entry.key} -> media ${doc.id} (${buffer.length} bytes)`)
  }

  console.log(`🖼  Done. created=${created} reused=${skipped} total=${storefrontMediaManifest.length}`)
  return { created, skipped }
}

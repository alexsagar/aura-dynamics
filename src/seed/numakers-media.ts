import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import { sql } from '@payloadcms/db-d1-sqlite'

import configPromise from '../payload.config'

type VariantImageDef = {
  filename: string
  alt: string
  key: string
  sku: string
}

const VARIANT_IMAGES: VariantImageDef[] = [
  {
    filename: 'numakers-pla-pure-white.png',
    alt: 'Numakers PLA Pure White filament spool',
    key: 'numakers-pla-pure-white',
    sku: 'AURA-NUM-PLA-WHT',
  },
  {
    filename: 'numakers-pla-pitch-black.png',
    alt: 'Numakers PLA Pitch Black filament spool',
    key: 'numakers-pla-pitch-black',
    sku: 'AURA-NUM-PLA-BLK',
  },
  {
    filename: 'numakers-pla-forest-green.png',
    alt: 'Numakers PLA Forest Green filament spool',
    key: 'numakers-pla-forest-green',
    sku: 'AURA-NUM-PLA-GRN',
  },
  {
    filename: 'numakers-pla-nuclear-red.png',
    alt: 'Numakers PLA Nuclear Red filament spool',
    key: 'numakers-pla-nuclear-red',
    sku: 'AURA-NUM-PLA-RED',
  },
  {
    filename: 'numakers-pla-royal-blue.png',
    alt: 'Numakers PLA Royal Blue filament spool',
    key: 'numakers-pla-royal-blue',
    sku: 'AURA-NUM-PLA-BLU',
  },
  {
    filename: 'numakers-pla-lemon-yellow.png',
    alt: 'Numakers PLA Lemon Yellow filament spool',
    key: 'numakers-pla-lemon-yellow',
    sku: 'AURA-NUM-PLA-YLW',
  },
  {
    filename: 'numakers-pla-transparent.png',
    alt: 'Numakers PLA Transparent filament spool',
    key: 'numakers-pla-transparent',
    sku: 'AURA-NUM-PLA-CLR',
  },
]

const HERO_IMAGE = {
  filename: 'homepage-hero-numakers-pla.png',
  alt: 'Numakers PLA filament color collection',
  key: 'homepage-hero-numakers-pla',
}

function findIncomingDir(): string | null {
  const dir = path.resolve(process.cwd(), 'seed-assets', 'numakers')
  return fs.existsSync(dir) ? dir : null
}

async function findMediaByKey(payload: Payload, key: string) {
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

export async function seedNumakersMedia() {
  console.log('🎨 Starting Numakers PLA Variant Media seed...')
  const incomingDir = findIncomingDir()
  if (!incomingDir) {
    throw new Error('Numakers seed assets directory not found at seed-assets/numakers')
  }
  console.log(`📂 Using incoming media directory: ${incomingDir}`)

  const payload = await getPayload({ config: configPromise })
  const db = (payload.db as any).drizzle

  const uploadedMediaMap: Record<string, number> = {}
  const uploadedMediaIds: number[] = []

  for (const def of VARIANT_IMAGES) {
    const filePath = path.join(incomingDir, def.filename)
    if (!fs.existsSync(filePath)) {
      throw new Error(`Variant image file not found: ${filePath}`)
    }

    let mediaDoc = await findMediaByKey(payload, def.key)
    if (!mediaDoc) {
      const buffer = fs.readFileSync(filePath)
      console.log(`  + Uploading ${def.filename} (${buffer.length} bytes)...`)
      mediaDoc = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: {
          alt: def.alt,
          migrationKey: def.key,
          temporaryAsset: true,
        },
        file: {
          name: def.filename,
          data: buffer,
          mimetype: 'image/png',
          size: buffer.length,
        },
      })
      console.log(`    Created media ID ${mediaDoc.id} for ${def.key}`)
    } else {
      console.log(`  = Reusing existing media ID ${mediaDoc.id} for ${def.key}`)
    }

    const mediaId = Number(mediaDoc.id)
    uploadedMediaMap[def.sku] = mediaId
    uploadedMediaIds.push(mediaId)

    // Find matching variant by SKU
    const { docs: variants } = await payload.find({
      collection: 'variants',
      where: { sku: { equals: def.sku } },
      limit: 1,
      overrideAccess: true,
      depth: 0,
    })

    if (variants.length > 0) {
      const variant = variants[0]
      const variantId = Number(variant.id)

      // Direct SQL update to variants_rels
      await db.run(sql`DELETE FROM \`variants_rels\` WHERE \`parent_id\` = ${variantId} AND \`path\` = 'images'`)
      await db.run(
        sql`INSERT INTO \`variants_rels\` (\`order\`, \`parent_id\`, \`path\`, \`media_id\`) VALUES (1, ${variantId}, 'images', ${mediaId})`
      )
      console.log(`    Linked media ${mediaId} to variant ${variantId} (${variant.sku}) in variants_rels`)

      // Also update _variants_v_rels for latest versions if present
      const versionsResult = await db.all(
        sql`SELECT \`id\` FROM \`_variants_v\` WHERE \`parent_id\` = ${variantId}`
      )
      for (const row of (versionsResult || [])) {
        const vId = row.id
        await db.run(sql`DELETE FROM \`_variants_v_rels\` WHERE \`parent_id\` = ${vId} AND \`path\` = 'images'`)
        await db.run(
          sql`INSERT INTO \`_variants_v_rels\` (\`order\`, \`parent_id\`, \`path\`, \`media_id\`) VALUES (1, ${vId}, 'images', ${mediaId})`
        )
      }
    } else {
      console.warn(`    WARNING: Variant with SKU ${def.sku} not found!`)
    }
  }

  // Check for homepage hero image
  const heroPath = path.join(incomingDir, HERO_IMAGE.filename)
  if (fs.existsSync(heroPath)) {
    console.log(`🌟 Found homepage hero image: ${heroPath}`)
    let heroDoc = await findMediaByKey(payload, HERO_IMAGE.key)
    if (!heroDoc) {
      const heroBuffer = fs.readFileSync(heroPath)
      heroDoc = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: {
          alt: HERO_IMAGE.alt,
          migrationKey: HERO_IMAGE.key,
          temporaryAsset: true,
        },
        file: {
          name: HERO_IMAGE.filename,
          data: heroBuffer,
          mimetype: 'image/png',
          size: heroBuffer.length,
        },
      })
      console.log(`  + Uploaded homepage hero media ID ${heroDoc.id}`)
    }

    try {
      const homepage = await payload.findGlobal({
        slug: 'homepage',
        overrideAccess: true,
      })
      await payload.updateGlobal({
        slug: 'homepage',
        overrideAccess: true,
        data: {
          ...homepage,
          hero: {
            ...(homepage as any)?.hero,
            image: heroDoc.id,
          },
        },
      })
      console.log(`  ✓ Updated Homepage hero image to media ${heroDoc.id}`)
    } catch (err) {
      console.warn('  Failed to update homepage hero global:', err)
    }
  } else {
    console.log(`ℹ Homepage hero file ${HERO_IMAGE.filename} not found in incoming media. Preserving existing hero.`)
  }

  // Parent Product Gallery Cleanup & Fallback Configuration:
  // Product ID 3 (Numakers PLA)
  const { docs: products } = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'numakers-pla' } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })

  if (products.length > 0) {
    const product = products[0]
    const productId = Number(product.id)
    console.log(`📦 Updating parent product ${productId} (${product.slug})...`)

    // Detach obsolete placeholder media (IDs 2, 7) and attach all 7 variant images as gallery fallback
    await db.run(sql`DELETE FROM \`products_rels\` WHERE \`parent_id\` = ${productId} AND \`path\` = 'images'`)
    for (let i = 0; i < uploadedMediaIds.length; i++) {
      await db.run(
        sql`INSERT INTO \`products_rels\` (\`order\`, \`parent_id\`, \`path\`, \`media_id\`) VALUES (${i + 1}, ${productId}, 'images', ${uploadedMediaIds[i]})`
      )
    }
    console.log(`  ✓ Parent product ${productId} images updated to [${uploadedMediaIds.join(', ')}] (placeholders detached)`)

    // Also update _products_v_rels for latest versions of product 3
    const productVersions = await db.all(
      sql`SELECT \`id\` FROM \`_products_v\` WHERE \`parent_id\` = ${productId}`
    )
    for (const pRow of (productVersions || [])) {
      const pvId = pRow.id
      await db.run(sql`DELETE FROM \`_products_v_rels\` WHERE \`parent_id\` = ${pvId} AND \`path\` = 'images'`)
      for (let i = 0; i < uploadedMediaIds.length; i++) {
        await db.run(
          sql`INSERT INTO \`_products_v_rels\` (\`order\`, \`parent_id\`, \`path\`, \`media_id\`) VALUES (${i + 1}, ${pvId}, 'images', ${uploadedMediaIds[i]})`
        )
      }
    }
  }

  console.log('🎉 Done seeding Numakers variant media!')
}

if (process.argv[1]?.endsWith('numakers-media.ts')) {
  seedNumakersMedia()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during seed:', err)
      process.exit(1)
    })
}

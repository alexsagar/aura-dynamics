import 'dotenv/config'
import { seedCatalogTest } from './catalog-test'
import { seedStorefrontMedia } from './storefront-media'
import { seedCmsFoundation } from './cms-foundation'

import { seedNumakersMedia } from './numakers-media'

async function run() {
  const target = process.argv[2]
  if (target === 'media') {
    await seedStorefrontMedia()
    return seedNumakersMedia()
  }
  if (target === 'cms') return seedCmsFoundation()
  if (target === 'all') {
    await seedCatalogTest()
    await seedStorefrontMedia()
    await seedNumakersMedia()
    return seedCmsFoundation()
  }
  await seedCatalogTest()
  return seedNumakersMedia()
}

run()
  .then(() => {
    console.log('Done seeding.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Seed execution error:', err)
    process.exit(1)
  })

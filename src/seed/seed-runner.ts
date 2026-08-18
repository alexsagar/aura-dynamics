import 'dotenv/config'
import { seedCatalogTest } from './catalog-test'
import { seedStorefrontMedia } from './storefront-media'
import { seedCmsFoundation } from './cms-foundation'

async function run() {
  const target = process.argv[2]
  if (target === 'media') return seedStorefrontMedia()
  if (target === 'cms') return seedCmsFoundation()
  if (target === 'all') {
    await seedCatalogTest()
    await seedStorefrontMedia()
    return seedCmsFoundation()
  }
  return seedCatalogTest()
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

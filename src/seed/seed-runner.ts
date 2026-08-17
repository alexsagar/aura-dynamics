import 'dotenv/config'
import { seedCatalogTest } from './catalog-test'

seedCatalogTest()
  .then(() => {
    console.log('Done seeding.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Seed execution error:', err)
    process.exit(1)
  })

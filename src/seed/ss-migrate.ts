import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  const before = await payload.db.migrate ? 'has-migrate' : 'no-migrate'
  console.log('adapter.migrate:', before)
  await payload.db.migrate()
  console.log('MIGRATE_DONE')
}
run().then(() => process.exit(0)).catch((e) => { console.error('MIGRATE_ERROR', e?.message || e); process.exit(1) })

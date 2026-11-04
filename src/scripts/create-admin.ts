import 'dotenv/config'
import { getPayload } from 'payload'

import configPromise from '../payload.config'

/**
 * Bootstrap an admin on a fresh database. Public first-register is blocked
 * (see Users beforeOperation hook), so this Local API script is the only way
 * to create the first admin. Credentials come from env, never argv/history:
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... PAYLOAD_SECRET=... \
 *     WRANGLER_CONFIG_PATH=<repo>/wrangler.aura-staging.jsonc tsx src/scripts/create-admin.ts
 */
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
if (!email || !password || password.length < 12) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters).')
  process.exit(1)
}

const payload = await getPayload({ config: configPromise })
const user = await payload.create({ collection: 'users', data: { email, password } })
console.log(`Created admin ${user.email} (id ${user.id}).`)
process.exit(0)

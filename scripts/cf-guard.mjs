#!/usr/bin/env node
// Fail-closed Cloudflare target check. Run before any remote deploy/migration:
//   node scripts/cf-guard.mjs staging
//   AURA_CONFIRM_PRODUCTION=aura-dynamics node scripts/cf-guard.mjs production
// Verifies the Wrangler config names the expected account, Worker and D1
// database, then asks Cloudflare (read-only) whether the chosen profile's
// credentials can see that exact database. Any mismatch exits non-zero.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// Old aura-personal database id, kept in wrangler.jsonc only as a local-dev placeholder.
const RETIRED_D1 = 'ca5f1a51-2974-4a83-99a1-6392ac4e2379'

const TARGETS = {
  staging: {
    config: 'wrangler.aura-staging.jsonc',
    profile: 'aura-official',
    accountId: 'f388d9461c4f6f9f1efa0145c1f6eb47',
    worker: 'aura-dynamics-staging',
    d1: 'a7add72b-61ac-424e-8e92-72000733839b',
  },
  // Same account as staging (it owns the printwithaura.com zone); every
  // resource must differ from staging's, checked below.
  production: {
    config: 'wrangler.jsonc',
    profile: 'aura-official',
    accountId: 'f388d9461c4f6f9f1efa0145c1f6eb47',
    worker: 'aura-dynamics',
    d1: process.env.AURA_PRODUCTION_D1_ID,
    r2: 'aura-media-production',
  },
}

const fail = (msg) => {
  console.error(`cf-guard: REFUSING — ${msg}`)
  process.exit(1)
}

const name = process.argv[2]
const t = TARGETS[name]
if (!t) fail(`unknown target "${name}" (use: ${Object.keys(TARGETS).join(' | ')})`)
if (name === 'production' && process.env.AURA_CONFIRM_PRODUCTION !== 'aura-dynamics') {
  fail('production needs explicit approval: set AURA_CONFIRM_PRODUCTION=aura-dynamics')
}

// Top-level config only (no named env); strip // comments and trailing commas.
const raw = readFileSync(t.config, 'utf8')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/,(\s*[}\]])/g, '$1')
const cfg = JSON.parse(raw)
if (cfg.account_id !== t.accountId) fail(`${t.config} account_id ${cfg.account_id} != ${t.accountId}`)
if (cfg.name !== t.worker) fail(`${t.config} name ${cfg.name} != ${t.worker}`)
if (name === 'production') {
  // The production D1 id is not known until it is created; the operator passes
  // it explicitly so a stale or placeholder id in the config cannot slip through.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(t.d1 ?? '') || t.d1 === RETIRED_D1)
    fail('set AURA_PRODUCTION_D1_ID to the id printed by `wrangler d1 create aura-production`')
  const s = TARGETS.staging
  const r2 = (cfg.r2_buckets ?? []).find((b) => b.binding === 'R2')?.bucket_name
  if (r2 !== t.r2) fail(`${t.config} R2 bucket ${r2} != ${t.r2}`)
  if (t.d1 === s.d1 || cfg.name === s.worker || r2 === 'aura-media-staging')
    fail(`${t.config} points at a staging resource`)
  const ns = (cfg.ratelimits ?? []).map((r) => r.namespace_id)
  if (ns.length !== 2 || ns.some((id) => ['1001', '1002'].includes(id)))
    fail(`${t.config} needs its own CHECKOUT/LOGIN rate-limit namespaces (not staging's 1001/1002)`)
  if (cfg.vars?.CLOUDFLARE_ENV !== 'production' || cfg.vars?.NEXT_PUBLIC_SITE_URL !== 'https://printwithaura.com')
    fail(`${t.config} vars must be CLOUDFLARE_ENV=production, NEXT_PUBLIC_SITE_URL=https://printwithaura.com`)
}
const d1 = (cfg.d1_databases ?? []).find((d) => d.binding === 'D1')
if (d1?.database_id !== t.d1) fail(`${t.config} D1 ${d1?.database_id} != ${t.d1}`)
if (cfg.workers_dev !== false) fail(`${t.config} must set workers_dev: false`)

// Credentials check: the profile must reach this exact database in this account.
try {
  const out = execFileSync(
    'pnpm',
    ['exec', 'wrangler', 'd1', 'info', 'D1', '--config', t.config, '--profile', t.profile, '--json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  )
  const info = JSON.parse(out.slice(out.indexOf('{')))
  if (info.uuid !== t.d1) fail(`profile ${t.profile} resolved D1 ${info.uuid}, expected ${t.d1}`)
} catch (err) {
  fail(`profile ${t.profile} cannot read D1 ${t.d1} in account ${t.accountId} (${String(err.message).split('\n')[0]})`)
}

console.log(`cf-guard: OK ${name} → account ${t.accountId}, Worker ${t.worker}, D1 ${t.d1}, profile ${t.profile}`)

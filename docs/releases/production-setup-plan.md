# Production setup plan (aura-official account)

Status: **proposed, nothing provisioned.** Every live step below needs explicit approval.

## Decision

Production and staging share Cloudflare account `f388d9461c4f6f9f1efa0145c1f6eb47` (the `aura-official` profile). That account owns the `printwithaura.com` zone. The two environments share no resources:

| Resource | Staging (unchanged) | Production (new) |
|---|---|---|
| Worker | `aura-dynamics-staging` | `aura-dynamics` |
| Config | `wrangler.aura-staging.jsonc` | `wrangler.jsonc` |
| D1 | `aura-staging` `a7add72b…` | `aura-production` (to create) |
| R2 | `aura-media-staging` | `aura-media-production` (to create) |
| Rate-limit namespaces | 1001 / 1002 | 2001 / 2002 |
| Secrets | staging values | new values (never copied from staging) |
| Hostname | `staging.printwithaura.com` | `launch-check.printwithaura.com`, then `printwithaura.com` + `www` |
| Build | `NEXT_PUBLIC_NOINDEX=true` | `NEXT_PUBLIC_NOINDEX=false` |

The old `aura-personal` account (`5c6bd…`) is no longer used. Nothing there is deleted by this plan. Its empty D1 `ca5f1a51…` is now only `preview_database_id`, which keeps existing local dev data (local state is keyed on that id). It is never contacted remotely.

`scripts/cf-guard.mjs production` refuses to proceed in any of these cases:
- `AURA_CONFIRM_PRODUCTION=aura-dynamics` is not set;
- `AURA_PRODUCTION_D1_ID` is missing, is the placeholder, or does not match the config;
- the config names the staging D1, Worker or R2 bucket;
- the config uses staging's rate-limit namespaces;
- the config's vars are wrong;
- `workers_dev` is enabled;
- the `aura-official` profile cannot read that exact D1.

## Procedure

### 0. Prerequisites (owner)
- **Production `PAYLOAD_SECRET`:** a new random value of at least 32 bytes. You generate it and set it; never paste it in chat.
- **Production `RESEND_API_KEY`:** ideally a new key restricted to sending from `printwithaura.com`.
- **Email allowlist:** decide whether production sets `EMAIL_ALLOWLIST`. If it is set, real customers receive nothing. Recommendation: do not set it in production.
- **Admin account:** the email address for the first production Admin. It is created in the production Admin UI, not copied from staging.

### 1. Merge this PR (config only; it changes nothing live)

### 2. Provision (needs approval; creates billable resources)
```sh
wrangler d1 create aura-production --profile aura-official      # note the database_id
wrangler r2 bucket create aura-media-production --profile aura-official
```
Then a follow-up PR puts the real `database_id` into `wrangler.jsonc`.

### 3. Secrets (owner runs; values never committed or logged)
```sh
wrangler secret put PAYLOAD_SECRET  --config wrangler.jsonc --profile aura-official
wrangler secret put RESEND_API_KEY  --config wrangler.jsonc --profile aura-official
```
If the Worker does not exist yet, `secret put` creates an empty Worker with that name. That Worker has no route, so it serves nothing.

### 4. Migrate (needs approval)
```sh
export AURA_CONFIRM_PRODUCTION=aura-dynamics AURA_PRODUCTION_D1_ID=<id>
pnpm run production:deploy:database
```
This applies every migration to the empty D1. Verify the result with:
```sh
wrangler d1 execute D1 --config wrangler.jsonc --profile aura-official --remote \
  --command "SELECT count(*) FROM payload_migrations"
```
The count must equal the number of files in `src/migrations/`. Note: `payload migrate` uses Wrangler's active login, not `--profile`, so make sure `aura-official` is the active login before running it.

### 5. Deploy to the check hostname (needs approval)
```sh
pnpm run production:deploy:app
```
The Worker is served only on `launch-check.printwithaura.com`; Cloudflare creates the DNS record and certificate. The apex domain still serves Coming Soon.

### 6. Content and smoke test on `launch-check`
- Create the first Admin.
- Upload media to production R2.
- Enter the real catalog, prices, stock, shipping settings and policy pages. Nothing is copied from staging.
- Test: browsing, cart, a COD checkout with a test order (cancel it afterwards), sign-up, login, account settings, password reset email, and the order emails.

### 7. Cutover (separate reviewed PR, needs approval)
1. Note the Coming Soon Worker `shrill-tree-d4d5`'s current domains in the dashboard (Workers → shrill-tree-d4d5 → Settings → Domains & Routes).
2. Change `routes` to `printwithaura.com` and `www.printwithaura.com` (both `custom_domain: true`). Remove `launch-check`, or keep it.
3. Detach `printwithaura.com` from `shrill-tree-d4d5` in the dashboard. Do not delete the Worker.
4. Run `pnpm run production:deploy:app` straight away. The Worker attaches the apex and `www`.
5. Verify HTTPS for the apex and `www`, `robots.txt` (`Allow: /`, sitemap), `/admin`, and a COD order.

Expect up to about a minute of downtime between steps 3 and 4. It can be avoided if Wrangler can override the existing custom domain directly; test that on `launch-check` first.

### 8. Rollback
- **App regression:** run `wrangler rollback <previous-version-id> --config wrangler.jsonc --profile aura-official`. Record each deployed version ID.
- **Full rollback to Coming Soon:** detach the apex and `www` from `aura-dynamics`, then re-attach the apex to `shrill-tree-d4d5`. That Worker stays deployed and untouched throughout.
- **Data:** D1 Time Travel (30 days on Workers Paid) can restore to a point in time:
  ```sh
  wrangler d1 time-travel restore aura-production --timestamp <iso>
  ```
  Before the cutover, take `wrangler d1 export aura-production --remote --output pre-cutover.sql`.
- **Migrations:** they are only additive. A rollback restores the database from Time Travel; it does not run `migrate:down` in production.

## Costs

Production runs in the same account, so it uses the existing Workers Paid plan ($5/month). It is not a second subscription. The figures below are Cloudflare's published included allowances; check them on the billing page.

| Item | Included | Expected at launch | Extra cost |
|---|---|---|---|
| Workers requests | 10M/month | far below | $0 |
| Workers CPU time | 30M ms/month | far below | $0 |
| D1 | 25B rows read, 50M rows written, 5 GB | far below | $0 |
| R2 | 10 GB storage, 1M Class A ops, 10M Class B ops, free egress | product images ≪ 10 GB | $0 |
| Rate limiting bindings | included | — | $0 |
| Custom domains and certificates | included | — | $0 |
| Resend | free tier: 3,000 emails/month, 100/day | likely enough at launch | $0, or $20/month if exceeded |

Expected total: **$5/month**, shared with staging. Staging and production together use more of the same allowances; both stay far below them.

Not included:
- FoneBiz automation (Browser Run or a runner) is not designed yet, so it has no cost estimate.
- The Coming Soon Worker keeps running after cutover unless it is removed. It costs nothing extra.

## Not covered by this plan
- **FoneBiz Dynamic QR:** still required. COD is not a replacement for it. It stays a launch decision for the owner.
- **Content:** catalog, policies (shipping, returns, cancellation), contact information and legal review.
- **Error monitoring:** not configured. Workers Logs and observability can be enabled in a later config change.

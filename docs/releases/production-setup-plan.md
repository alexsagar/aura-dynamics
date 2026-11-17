# Production setup plan (aura-official account)

Status: **proposed. Nothing is provisioned.** Every live step needs explicit approval and is run only after that approval.

## Decision

Production and staging share Cloudflare account `f388d9461c4f6f9f1efa0145c1f6eb47` (the `aura-official` profile). That account owns the `printwithaura.com` zone. The two environments share no resources.

| Resource | Staging (unchanged) | Production (new) |
|---|---|---|
| Worker | `aura-dynamics-staging` | `aura-dynamics` |
| Config | `wrangler.aura-staging.jsonc` | `wrangler.jsonc` |
| D1 | `aura-staging` `a7add72b…` | `aura-production` (to create) |
| R2 | `aura-media-staging` | `aura-media-production` (to create) |
| Rate-limit namespaces | 1001 / 1002 | 2001 / 2002 (IDs are account-wide) |
| Secrets | staging values | new values, never copied from staging |
| Hostname | `staging.printwithaura.com` | pre-launch: `launch-check.printwithaura.com`; after cutover: `printwithaura.com` + `www` |

The Coming Soon Worker `shrill-tree-d4d5` keeps the `printwithaura.com` custom domain, unchanged, until the cutover (step 8). The old `aura-personal` account (`5c6bd…`) is no longer used, and nothing there is deleted.

## Phases

The guard (`scripts/cf-guard.mjs production`) reads `wrangler.jsonc` and `package.json` and refuses to run unless all three settings below agree on the phase:

| | Pre-launch (this PR) | Live (cutover PR) |
|---|---|---|
| `routes` | exactly `launch-check.printwithaura.com` | `printwithaura.com`, `www.printwithaura.com` |
| `vars.NEXT_PUBLIC_SITE_URL` and build env | `https://launch-check.printwithaura.com` | `https://printwithaura.com` |
| Build `NEXT_PUBLIC_NOINDEX` | `true` | `false` |
| Extra approval | — | `AURA_CONFIRM_CUTOVER=printwithaura.com` |

**Pre-launch protection**
- **Indexing:**
  - `NEXT_PUBLIC_NOINDEX=true` makes `robots.txt` return `Disallow: /`.
  - It also adds `X-Robots-Tag: noindex, nofollow` to every response. This is the same mechanism staging uses, and it was verified live on staging.
- **Email:** `src/lib/email.ts` sends without filtering only when all three hold: `CLOUDFLARE_ENV=production`, site URL `https://printwithaura.com`, and **no `EMAIL_ALLOWLIST` set**.
  - Pre-launch fails both of the last two conditions, so only allowlisted recipients get mail, with `[PRE-LAUNCH]` in the subject. An empty or blank allowlist sends nothing.
  - Password-reset and order links use `launch-check`, because they are built from `NEXT_PUBLIC_SITE_URL`.
  - Staging is unchanged: allowlist mode with a `[STAGING]` subject prefix.
- **Access (recommended; a dashboard step, needs approval):** create a Cloudflare Access self-hosted application for `launch-check.printwithaura.com`.
  - Policy: allow only the named tester emails, signed in with a one-time PIN.
  - Cost: free for up to 50 users.
  - Do it **before** step 5, so the hostname is never reachable without the PIN.
  - Our own tests still work: testers sign in once per browser.

## Guard summary

`pnpm run production:guard` (and every production script) refuses to proceed in any of these cases:
- approval `AURA_CONFIRM_PRODUCTION=aura-dynamics` is not set;
- `AURA_PRODUCTION_D1_ID` is missing, is the retired placeholder, or does not match the config;
- the config names the staging D1 id, Worker or R2 bucket;
- the config uses staging's rate-limit namespaces;
- the phase settings above are inconsistent, or the apex is routed without `AURA_CONFIRM_CUTOVER`;
- `workers_dev` is enabled;
- the **`aura-official` profile** cannot read that exact D1 (used by `wrangler deploy` and `d1 execute`);
- the **default Wrangler login** cannot read that exact D1. `payload migrate` reaches D1 through the default login, because it has no `--profile`.

**Database id placeholder.** `wrangler.jsonc` currently holds `ca5f1a51…`, the old, empty `aura-personal` database id.
- It stays only because local dev and CI keep their local SQLite state under that id.
- The guard refuses it, so nothing remote can run until a follow-up PR replaces it with the real id.
- Because the D1 binding is selected only by that guarded id in account `f388…`, a migration or deploy can only reach `aura-production` or fail. It can never reach staging.
- After the id is replaced, local dev gets a new, empty local database: run `pnpm payload migrate` locally.

## Procedure

### 0. Prerequisites (owner)
- A new production `PAYLOAD_SECRET`: random, at least 32 bytes.
- A production `RESEND_API_KEY`: ideally a new key that can send only from `printwithaura.com`.
- `EMAIL_ALLOWLIST`: comma-separated pre-launch tester addresses.
- The email address for the first production Admin. It is created in the production Admin UI; staging accounts are not copied.

### 1. Merge this PR
Config only. CI on `dev` never deploys and never touches Cloudflare, so merging changes nothing live.

### 2. Provision (approval; creates resources)
```sh
pnpm exec wrangler d1 create aura-production --profile aura-official          # prints database_id
pnpm exec wrangler r2 bucket create aura-media-production --profile aura-official
```
Then, in a follow-up PR:
- put the real `database_id` into `wrangler.jsonc`;
- run `AURA_CONFIRM_PRODUCTION=aura-dynamics AURA_PRODUCTION_D1_ID=<id> pnpm run production:guard`, which must print `OK`.

### 3. Migrate (approval)
First make sure `pnpm exec wrangler whoami` (the default login) shows account `f388…`; the guard also checks this.
```sh
export AURA_CONFIRM_PRODUCTION=aura-dynamics AURA_PRODUCTION_D1_ID=<id>
pnpm run production:deploy:database
pnpm exec wrangler d1 execute D1 --config wrangler.jsonc --profile aura-official --remote \
  --command "SELECT count(*) FROM payload_migrations"   # must equal the number of files in src/migrations/
```

### 4. Cloudflare Access for launch-check (approval; dashboard)
Set this up before the hostname exists (see "Pre-launch protection" above).

### 5. First deploy, with secrets in the same upload (approval)
The owner creates a secrets file **outside the repository**, readable only by the owner (`chmod 600`):
```
PAYLOAD_SECRET=<new value>
RESEND_API_KEY=<production key>
EMAIL_ALLOWLIST=<tester addresses>
```
```sh
pnpm run production:deploy:app -- --secrets-file /path/outside/repo/aura-production.secrets
```
- The guard runs first. The Worker code, bindings and these secrets go up in **one** deployment, so no version ever runs without its secrets.
- Nobody types the secrets into chat or the terminal, and they are never committed.
- Delete the file afterwards.
- Later deploys omit `--secrets-file`; existing secrets persist, which is the same method staging uses.
- The Worker is then served only on `launch-check.printwithaura.com`. Cloudflare creates the DNS record and certificate for that subdomain. Coming Soon is untouched.

### 6. Content and smoke test on launch-check
- Create the first Admin.
- Upload media to production R2.
- Enter the real catalog, prices, stock, shipping settings and policy content.
- Test: browsing, cart, a COD order (then cancel it), sign-up and login, account settings, password reset and order emails to an allowlisted address. Links must point to `launch-check`.
- Check `robots.txt` shows `Disallow: /` and responses carry `X-Robots-Tag: noindex`.

### 7. Pre-cutover backup
```sh
pnpm exec wrangler d1 export aura-production --remote --profile aura-official --output pre-cutover.sql
```
Record the current production Worker version id.

### 8. Cutover (separate reviewed PR plus explicit approval)
The PR changes:
- `routes` to `printwithaura.com` and `www.printwithaura.com` (both `custom_domain: true`);
- `vars.NEXT_PUBLIC_SITE_URL` to `https://printwithaura.com`;
- the `production:deploy:app` build env to `NEXT_PUBLIC_SITE_URL=https://printwithaura.com NEXT_PUBLIC_NOINDEX=false`.

After approval:
1. Remove the `EMAIL_ALLOWLIST` secret: `wrangler secret delete EMAIL_ALLOWLIST --config wrangler.jsonc --profile aura-official`. Real customers then receive email.
2. In the dashboard, detach `printwithaura.com` from `shrill-tree-d4d5` (Settings → Domains & Routes). **Do not delete the Worker.**
3. Run `AURA_CONFIRM_CUTOVER=printwithaura.com pnpm run production:deploy:app` straight away.
4. Verify:
   - HTTPS on the apex and `www`;
   - `robots.txt` shows `Allow: /` and the sitemap;
   - no `X-Robots-Tag` header;
   - `/admin` works;
   - a COD order, and its email reaching a real address.

Expect up to about a minute of downtime between steps 2 and 3.

### 9. Rollback
- **App regression:**
  ```sh
  pnpm exec wrangler rollback <previous-version-id> --config wrangler.jsonc --profile aura-official
  ```
- **Back to Coming Soon:**
  1. Detach the apex and `www` from `aura-dynamics`.
  2. Re-attach `printwithaura.com` to `shrill-tree-d4d5` as a custom domain.
  3. If customer email should stop again, re-add `EMAIL_ALLOWLIST`.

  `shrill-tree-d4d5` stays deployed and unmodified throughout.
- **Data:** restore with D1 Time Travel (30 days on Workers Paid):
  ```sh
  wrangler d1 time-travel restore aura-production --timestamp <iso>
  ```
  The step 7 export is a second copy. Migrations are only additive; rollback restores data and does not run `migrate:down`.

## Costs

The existing Workers Paid plan covers both environments: **$5/month in total**, with no second subscription. Figures below are published allowances; confirm them on the billing page.

| Item | Included | Expected at launch | Extra cost |
|---|---|---|---|
| Workers requests / CPU | 10M requests, 30M CPU-ms per month | far below | $0 |
| D1 | 25B rows read, 50M rows written, 5 GB | far below | $0 |
| R2 | 10 GB, 1M Class A, 10M Class B, free egress | images ≪ 10 GB | $0 |
| Rate limiting, custom domains, certificates | included | — | $0 |
| Cloudflare Access | free up to 50 users | a few testers | $0 |
| Resend | free: 3,000/month, 100/day | likely enough at launch | $0, or $20/month above that |

## Not covered by this plan
- **FoneBiz Dynamic QR:** still required. COD is not treated as a replacement for it. Feasibility and design have not started.
- **Content:** catalog, shipping, returns and cancellation policies, contact information and legal review.
- **Error monitoring:** not configured.

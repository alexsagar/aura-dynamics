# Phase 1 — Staging Security Hardening (2026-11-05)

**Status:** COMPLETE for **staging only**. This sign-off does not cover production.
Nothing in this release has been deployed to production.

| Item | Value |
|---|---|
| Final `dev` commit | `addb6e0312b1c3720370f00990796af7ccc00557` |
| Staging Worker | `aura-dynamics-staging` on `staging.printwithaura.com` |
| Staging version | `282c6fdf-ba85-4d5a-8688-4d110854685c` (deployed 2026-11-05) |
| Previous version (rollback target) | `18047a39-37b3-4280-9e8e-a2903d828d4d` (git `810214a`) |
| Payload | 3.92.1 with a temporary local patch (see below) |

## 1. Objectives and completed work

Phase 1 hardened the storefront and CMS against abuse and account attacks
before any public launch. All PRs below are merged into `dev`.

| PR | Change |
|---|---|
| #12 | Checkout abuse limits; idempotent stock release on cancellation |
| #13 | Audit hardening: CSRF/CORS, JSON-LD escaping, test signing key, production `workers.dev` disabled |
| #14 | Payload upgraded to 3.92.1 (security fixes) |
| #15 | Password hashing kept within the Workers PBKDF2 iteration limit |
| #16 | Fractional and non-numeric checkout quantities rejected |
| #17 | A cancellation that loses a concurrent race returns 409 |
| #18 | Login lockout pinned; per-IP login / forgot-password / reset-password throttle |
| #19 | Fail-closed Cloudflare target guard (`scripts/cf-guard.mjs`) for deploy and migrate scripts |

## 2. Payload 3.92.1 and the temporary PBKDF2 patch

Payload 3.92.1 hashes passwords with PBKDF2 at 600,000 iterations. Cloudflare
Workers rejects PBKDF2 above 100,000 iterations, so login fails on Workers.

`patches/payload@3.92.1.patch` (applied via `pnpm.patchedDependencies`)
backports payloadcms/payload#19074:

- New hashes use 100,000 iterations with prefix `pbkdf2-sha256-100k-v1:`.
- Existing upstream 600k hashes (`pbkdf2-sha256-v1:`) remain readable.
- The prefix matches upstream, so hashes stay valid once the official option ships.

**Follow-up:** remove the patch once an official Payload release provides
configurable password-hash iterations. Do not modify the patch otherwise.

## 3. Staging D1 migrations

Phase 1 added one migration, `20261104_141915_payload_3_92_security`
(required by Payload 3.92.1):

- `users.reset_password_requested_at` (text)
- `customers.reset_password_requested_at` (text)
- `media._objectkey` (text)

Applied to staging D1 (`aura-staging`); it is the latest entry in
`payload_migrations`. PRs #16–#19 added no migrations. Production D1 has not
been migrated.

## 4. Authentication, authorization and sessions — verified on staging

| Test | Result |
|---|---|
| Customer registration and login | PASS |
| Customer cannot read `users`; sees only own orders | PASS |
| Unauthenticated `users`, `orders`, `customers`, `transactions`, `carts` return 403 | PASS |
| CORS: foreign origin receives no `Access-Control-Allow-Origin` | PASS |
| Password change via session B keeps session B and revokes separate session A | PASS |
| Old password rejected (401), new password accepted (200) after change | PASS |
| Account lockout configured: 5 attempts, 10 minutes (customers and admin users) | PASS (config; not triggered live by design) |
| Admin login on the current version | **PENDING** (passed on the previous staging release) |

Session behavior relies on Payload's default `auth.useSessions: true`: on a
password update, Payload 3.92.1 keeps only the session that made the change
(`collections/operations/utilities/update.js`).

## 5. Rate limiting

Workers Rate Limiting bindings, keyed on `cf-connecting-ip` (cannot be set by
clients; requests without it share one bucket rather than bypassing):

| Binding | Namespace | Limit | Covers |
|---|---|---|---|
| `CHECKOUT_RATE_LIMITER` | 1001 | 5 / 60 s | `POST /api/checkout` |
| `LOGIN_RATE_LIMITER` | 1002 | 20 / 60 s | login, forgot-password, reset-password (REST and GraphQL, customers and users) |

Verified: a login burst against a nonexistent account returned HTTP 429 from
roughly the 41st request. Cloudflare rate limits are approximate, counted per
location and eventually consistent; they are not strict global limits. Account
lockout remains the per-account defence. The login limit is intentionally
generous because many Nepali mobile users share one CGNAT address.

## 6. Checkout, cancellation and inventory — verified on staging

| Test | Result |
|---|---|
| Fractional (`1.5`), string, zero and negative quantities rejected (400) | PASS |
| Quantity above the per-line cap (10) rejected | PASS |
| Whole-number quantity accepted; stock reduced by exactly the ordered amount | PASS |
| Stock unchanged after rejected requests | PASS |
| Admin cancellation of two test orders restored stock exactly once per order | PASS |
| Cancelled order items preserved | PASS |
| Concurrent cancel returns 409; repeated sequential cancel is a harmless 200 | PASS (automated tests) |
| Cancelled orders cannot reopen; admin-created orders restore nothing | PASS (automated tests) |
| Live concurrent cancellation on staging | **PENDING** |
| HTTP 500 errors during testing | None observed |

## 7. HTTPS and indexing

- A Cloudflare Redirect Rule scoped to `staging.printwithaura.com` sends
  HTTP to HTTPS with 301, preserving path and query string. Verified for `/`,
  `/admin`, `/api/users/me` and a query-string URL. HTTPS returns 200 with
  no redirect loop.
- The TLS certificate covers `staging.printwithaura.com`.
- Staging sends `X-Robots-Tag: noindex, nofollow` and `robots.txt` returns
  `Disallow: /`.
- HSTS is not enabled (pending decision).
- Cloudflare Zero Trust was intentionally removed from staging. Do not recreate
  it without a new decision.

## 8. Automated tests

| Suite | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | PASS |
| Integration (Vitest) | 114/114 PASS |
| GitHub CI on `addb6e0` | PASS |
| Playwright E2E | **NOT RUN** for this release |

`tests/int/api.int.spec.ts` needs a `PAYLOAD_SECRET` to start. Locally, use a
disposable random value, never a real staging or production secret.

## 9. Outstanding follow-ups and known limitations

- **Pending tests:** Admin login retest on the latest deployment; live
  concurrent-cancellation test; Playwright E2E suite.
- **Known limitation:** a narrow race remains when overlapping Payload saves
  edit the same order on D1 (PR #17 handles the common case with 409).
- **HSTS:** evaluate scope (staging host only vs zone) and max-age before enabling.
- **PBKDF2 patch:** replace with the official Payload release when available.

## 10. Production release prerequisites

Before any production rollout:

1. Add `LOGIN_RATE_LIMITER` and `CHECKOUT_RATE_LIMITER` bindings to
   `wrangler.jsonc` with production-only namespace IDs. Without them the
   limiter code lets every request through.
2. Confirm production environment variables and secrets (`PAYLOAD_SECRET`,
   `NEXT_PUBLIC_SITE_URL`, `CLOUDFLARE_ENV`) and that noindex is not set.
3. Apply `20261104_141915_payload_3_92_security` to production D1 through the
   guarded `production:deploy:database` script.
4. Enforce HTTPS on the production hostname and decide on HSTS.
5. Complete the pending tests above against production-equivalent config.
6. Deploy only through the guarded scripts (`AURA_CONFIRM_PRODUCTION=aura-dynamics`).

At the time of writing, the production Worker `aura-dynamics` does not yet
exist on the production account.

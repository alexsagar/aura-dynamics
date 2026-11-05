# Phase 2 — Staging Transactional Email (2026-11-05)

**Status:** COMPLETE for **staging only**. Production has not been deployed and
is not approved by this sign-off.

| Item | Value |
|---|---|
| Final `dev` commit | `276ea5d43b0f558e3c8247dbf8c72bfd33710401` |
| Staging Worker | `aura-dynamics-staging` on `staging.printwithaura.com` |
| Staging version | `1745fac0-da3c-4333-a4e4-82b9ea0d62da` (deployed 2026-11-05 09:06 UTC) |
| Previous version (rollback target) | `282c6fdf-ba85-4d5a-8688-4d110854685c` (Phase 1) |
| Email provider | Resend, domain `printwithaura.com` (verified; receiving disabled) |
| Sender / Reply-To | `Aura <notifications@printwithaura.com>` / `support@printwithaura.com` |

## 1. Scope

| PR | Change |
|---|---|
| #21 | `@payloadcms/email-resend@3.92.1` behind an environment safety wrapper (`src/lib/email.ts`); customer forgot/reset pages; admin reset emails |
| #22 | Order confirmation email after checkout creates a new order |
| #23 | Order `cancelled` / `completed` notifications (orders `afterChange` hook) |

No database migrations. Payload stays at 3.92.1 with the PBKDF2 patch. Phase 1
protections (rate limits, lockout, CSRF/CORS, deploy guard) unchanged.

## 2. Email safety model

Delivery mode comes only from deploy-time configuration, never the request:

| Mode | Condition | Behaviour |
|---|---|---|
| production | `CLOUDFLARE_ENV=production` **and** site URL `https://printwithaura.com` | unfiltered |
| allowlist | any other deployed environment (staging) | every to/cc/bcc must be in `EMAIL_ALLOWLIST`, otherwise the message is dropped; empty list sends nothing; subject prefixed `[STAGING]` |
| local | local dev / tests | nothing sent |
| unconfigured | deployed without `RESEND_API_KEY` or site URL | nothing sent, error logged |

The wrapper never throws (forgot-password responses stay identical whether or
not an account exists or delivery fails) and logs only the outcome and provider
status code, never addresses, subjects, bodies, tokens or provider error text.

## 3. Staging configuration

| Name | Kind | Value |
|---|---|---|
| `RESEND_API_KEY` | secret | staging key |
| `EMAIL_ALLOWLIST` | secret | approved test inbox (kept out of Git) |
| `PAYLOAD_SECRET` | secret | unchanged |
| `CLOUDFLARE_ENV` | var | `staging` |
| `NEXT_PUBLIC_SITE_URL` | var + build env | `https://staging.printwithaura.com` |

Deployed with the guarded `staging:aura:deploy` script and Wrangler
`--secrets-file` (additive; existing secrets kept). The private secrets file
lived outside the repository and was shredded after the deploy. Bindings after
deploy: D1 `aura-staging`, R2 `aura-media-staging`, `CHECKOUT_RATE_LIMITER`
(5/60 s), `LOGIN_RATE_LIMITER` (20/60 s). Noindex and the HTTP→HTTPS redirect
were re-verified.

## 4. Verified on staging

All delivery went to one approved test inbox. Resend shows exactly four sends,
all Delivered, no duplicates.

| Test | Result |
|---|---|
| Customer password-reset email arrives, `[STAGING]` subject, staging link | PASS |
| Reset succeeds; earlier sessions cleared; new hash uses the patched 100k scheme | PASS |
| Used reset link shows "invalid or has expired" | PASS |
| Old password rejected (401) after reset | PASS |
| Existing non-allowlisted account: nothing sent, generic 200 | PASS |
| Unknown email: same generic 200 | PASS |
| COD order confirmation: correct items, subtotal, shipping, NPR total, "Pay on Delivery" | PASS |
| Idempotent checkout replay sends no second confirmation | PASS |
| Admin cancellation sends one cancellation email; stock restored exactly once | PASS |
| Admin-created order → completed sends one completion email; no stock change | PASS |
| No duplicate notifications (Resend shows 4 sends for 4 events) | PASS |
| Worker logs: no exceptions or 5xx; no addresses, keys, tokens or reset links | PASS (first log session; the second tail session captured nothing) |
| Admin password-reset delivery | **BLOCKED** (Admin mailbox is not an approved test inbox) |
| Account link in confirmation for a signed-in customer | **NOT TESTED live** (automated tests only) |

Automated: TypeScript clean; 156/156 integration tests, including real Payload
flows on local D1 for reset, cancellation and completion.

## 5. Known limitations

- Delivery is best-effort via `waitUntil`; there is no outbox, queue or retry,
  and no exactly-once guarantee. A Resend outage loses that email (logged).
- A partially failed D1 write (no transactions) can leave a status change
  without its notification.
- Two overlapping Admin saves that both complete an order can each send.
- completed → processing → completed sends a second completion email (accepted policy).
- Orders without `customerEmail` get no status emails.
- The Payload Resend adapter cannot send Resend's `Idempotency-Key` header.
- Payload expires a used reset token but leaves it stored.
- The Admin reset link carries the token in the URL path; Cloudflare request
  logs (if enabled) could record it. Redact `/admin/reset/*` or keep retention short.

## 6. Production prerequisites

1. Separate production Resend API key as a production Worker secret.
2. Runtime vars `CLOUDFLARE_ENV=production` and
   `NEXT_PUBLIC_SITE_URL=https://printwithaura.com` (without both, production
   sends nothing).
3. Production `LOGIN_RATE_LIMITER` and `CHECKOUT_RATE_LIMITER` bindings (Phase 1 prerequisite).
4. Decide on persistent notification deduplication / outbox before relying on email at scale.
5. Confirm Resend free-tier limits (3,000/month, 100/day) against expected volume.
6. Deploy only through the guarded scripts.

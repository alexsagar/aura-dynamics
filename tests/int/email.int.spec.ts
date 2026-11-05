import { describe, it, expect, vi } from 'vitest'
import type { SendEmailOptions } from 'payload'
import { emailMode, recipientsOf, sendSafely, textFromHtml, EMAIL_REPLY_TO, type EmailMode } from '@/lib/email'
import { escapeHtml, passwordResetEmailHTML } from '@/lib/email-templates'
import { Customers } from '@/collections/Customers'
import { Users } from '@/collections/Users'

const STAGING = { CLOUDFLARE_ENV: 'staging', NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://staging.printwithaura.com', RESEND_API_KEY: 're_test' }
const PROD = { CLOUDFLARE_ENV: 'production', NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://printwithaura.com', RESEND_API_KEY: 're_test' }
const allow = (...a: string[]): EmailMode => ({ kind: 'allowlist', apiKey: 're_test', allow: new Set(a) })
const logger = () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() })
const msg = (m: Partial<SendEmailOptions>): SendEmailOptions => ({ subject: 'Hello', html: '<p>Hi</p>', ...m })

describe('email environment policy', () => {
  it('sends unfiltered only when both CLOUDFLARE_ENV and the site URL are production', () => {
    expect(emailMode(PROD).kind).toBe('production')
    expect(emailMode({ ...PROD, NEXT_PUBLIC_SITE_URL: 'https://staging.printwithaura.com' }).kind).toBe('allowlist')
    expect(emailMode({ ...STAGING, CLOUDFLARE_ENV: 'production' }).kind).toBe('allowlist')
    expect(emailMode({ ...PROD, CLOUDFLARE_ENV: undefined }).kind).toBe('allowlist')
  })

  it('fails closed: empty allowlist allows nobody; missing key or site URL is unconfigured', () => {
    const m = emailMode(STAGING)
    expect(m.kind === 'allowlist' && m.allow.size).toBe(0)
    expect(emailMode({ ...STAGING, RESEND_API_KEY: '' }).kind).toBe('unconfigured')
    expect(emailMode({ ...PROD, RESEND_API_KEY: undefined }).kind).toBe('unconfigured')
    expect(emailMode({ ...STAGING, NEXT_PUBLIC_SITE_URL: undefined }).kind).toBe('unconfigured')
    expect(emailMode({ NODE_ENV: 'test' }).kind).toBe('local')
  })

  it('parses the allowlist case-insensitively', () => {
    const m = emailMode({ ...STAGING, EMAIL_ALLOWLIST: ' QA@Example.com , ops@example.com,' })
    expect(m.kind === 'allowlist' && [...m.allow]).toEqual(['qa@example.com', 'ops@example.com'])
  })
})

describe('recipient parsing', () => {
  it('collects to, cc and bcc in every Payload address shape', () => {
    expect(
      recipientsOf({
        to: 'A@x.com, Name <b@y.com>',
        cc: [{ name: 'C', address: 'c@z.com' }, 'd@z.com'],
        bcc: { name: 'E', address: 'e@z.com' },
      }),
    ).toEqual(['a@x.com', 'b@y.com', 'c@z.com', 'd@z.com', 'e@z.com'])
  })

  it('returns null for anything ambiguous', () => {
    expect(recipientsOf({ to: '"Doe, Jane" <j@x.com>' })).toBeNull()
    expect(recipientsOf({ to: 'not-an-address' })).toBeNull()
    expect(recipientsOf({ to: 'a@x.com; b@y.com' })).toBeNull()
    expect(recipientsOf({ to: [{ name: 'X' } as any] })).toBeNull()
  })
})

describe('sendSafely', () => {
  it('staging: sends to allowlisted recipients with [STAGING] subject, Reply-To and a text part', async () => {
    const send = vi.fn().mockResolvedValue({ id: '1' })
    const out = await sendSafely(msg({ to: 'qa@example.com', html: '<p>Hi <a href="https://x.test/r">reset</a></p>' }), allow('qa@example.com'), send, logger())
    expect(out).toBe('sent')
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ subject: '[STAGING] Hello', replyTo: EMAIL_REPLY_TO, text: 'Hi reset: https://x.test/r' }),
    )
  })

  it('staging: drops the whole message if any to/cc/bcc recipient is outside the allowlist', async () => {
    const send = vi.fn()
    for (const m of [{ to: 'real@customer.com' }, { to: 'qa@example.com', cc: 'real@customer.com' }, { to: 'qa@example.com', bcc: ['real@customer.com'] }]) {
      expect(await sendSafely(msg(m), allow('qa@example.com'), send, logger())).toBe('dropped_recipient')
    }
    expect(await sendSafely(msg({ to: 'qa@example.com' }), allow(), send, logger())).toBe('dropped_recipient')
    expect(send).not.toHaveBeenCalled()
  })

  it('production: no filter and no subject prefix', async () => {
    const send = vi.fn().mockResolvedValue({ id: '1' })
    await sendSafely(msg({ to: 'anyone@customer.com' }), { kind: 'production', apiKey: 'k' }, send, logger())
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Hello' }))
  })

  it('never calls the provider when local or unconfigured', async () => {
    const send = vi.fn()
    expect(await sendSafely(msg({ to: 'a@x.com' }), { kind: 'local' }, send, logger())).toBe('local')
    expect(await sendSafely(msg({ to: 'a@x.com' }), { kind: 'unconfigured' }, send, logger())).toBe('unconfigured')
    expect(send).not.toHaveBeenCalled()
  })

  it('provider failure resolves as failed and logs only the status code', async () => {
    const log = logger()
    const send = vi.fn().mockRejectedValue(Object.assign(new Error('Error sending email: 422 echo secret-token qa@example.com'), { status: 422 }))
    const out = await sendSafely(msg({ to: 'qa@example.com', subject: 'secret-token', html: 'secret-token' }), allow('qa@example.com'), send, log)
    expect(out).toBe('failed')
    expect(log.error).toHaveBeenCalledWith({ msg: 'email: provider send failed', status: 422 })
  })

  it('no log line ever contains an address, subject or body', async () => {
    const log = logger()
    const m = msg({ to: 'qa@example.com', subject: 'tok123', html: 'tok123' })
    await sendSafely(m, allow('qa@example.com'), vi.fn().mockResolvedValue({}), log)
    await sendSafely(m, allow(), vi.fn(), log)
    await sendSafely(m, { kind: 'unconfigured' }, vi.fn(), log)
    await sendSafely(m, { kind: 'local' }, vi.fn(), log)
    const logged = JSON.stringify([log.info.mock.calls, log.warn.mock.calls, log.error.mock.calls])
    expect(logged).not.toMatch(/qa@example\.com|tok123/)
  })
})

describe('password reset email content', () => {
  it('customer link goes to the storefront page with the token in the fragment', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.printwithaura.com/')
    const html = await (Customers.auth as any).forgotPassword.generateEmailHTML({ token: 'abc123' })
    expect(html).toContain('href="https://staging.printwithaura.com/reset-password#token=abc123"')
    vi.unstubAllEnvs()
  })

  it('admin link goes to the built-in Payload reset screen on the configured origin', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.printwithaura.com')
    const req = { payload: { config: { routes: { admin: '/admin' }, admin: { routes: { reset: '/reset' } } } } }
    const html = await (Users.auth as any).forgotPassword.generateEmailHTML({ token: 'abc123', req })
    expect(html).toContain('href="https://staging.printwithaura.com/admin/reset/abc123"')
    expect(html).not.toContain('/reset-password')
    vi.unstubAllEnvs()
  })

  it('escapes interpolated values', () => {
    expect(escapeHtml(`<script>"x"&'y'`)).toBe('&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;')
    expect(passwordResetEmailHTML('https://x.test/"><script>')).not.toContain('"><script>')
  })

  it('plain-text version keeps the link', () => {
    expect(textFromHtml(passwordResetEmailHTML('https://x.test/r#token=t'))).toContain('Choose a new password: https://x.test/r#token=t')
  })
})

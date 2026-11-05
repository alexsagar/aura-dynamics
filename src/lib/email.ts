import { resendAdapter } from '@payloadcms/email-resend'
import type { EmailAdapter, SendEmailOptions } from 'payload'

export const EMAIL_FROM_ADDRESS = 'notifications@printwithaura.com'
export const EMAIL_FROM_NAME = 'Aura'
export const EMAIL_REPLY_TO = 'support@printwithaura.com'
const PRODUCTION_SITE_URL = 'https://printwithaura.com'

type Env = Record<string, string | undefined>

/** Public site origin used in email links (build-time, same value as CORS/CSRF trusted origins). */
export const siteUrl = (env: Env = process.env) => env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''

/**
 * Where email may go, decided only from deploy-time configuration (Wrangler vars,
 * secrets, build env), never from the request.
 *  - production: CLOUDFLARE_ENV=production AND the site URL is the production
 *    origin. Both must match, so a staging Worker with a mistyped var stays filtered.
 *  - allowlist: every other deployed environment. Only EMAIL_ALLOWLIST recipients;
 *    an empty or missing allowlist sends nothing.
 *  - local: plain local dev/tests (no CLOUDFLARE_ENV, not a production build). Nothing is sent.
 *  - unconfigured: a deployed environment missing RESEND_API_KEY or the site URL.
 */
export type EmailMode =
  | { kind: 'production'; apiKey: string }
  | { kind: 'allowlist'; apiKey: string; allow: Set<string> }
  | { kind: 'local' }
  | { kind: 'unconfigured' }

export function emailMode(env: Env = process.env): EmailMode {
  const deployed = Boolean(env.CLOUDFLARE_ENV) || env.NODE_ENV === 'production'
  if (!deployed) return { kind: 'local' }
  const apiKey = env.RESEND_API_KEY?.trim()
  if (!apiKey || !siteUrl(env)) return { kind: 'unconfigured' }
  if (env.CLOUDFLARE_ENV === 'production' && siteUrl(env) === PRODUCTION_SITE_URL) {
    return { kind: 'production', apiKey }
  }
  const allow = new Set(
    (env.EMAIL_ALLOWLIST ?? '')
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean),
  )
  return { kind: 'allowlist', apiKey, allow }
}

type Recipients = { to?: unknown; cc?: unknown; bcc?: unknown }
const ADDRESS = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/

/**
 * Every to/cc/bcc address, lower-cased. Accepts strings (including
 * "a@x.com, Name <b@y.com>"), { name, address } objects and arrays of either.
 * Returns null for anything it cannot parse with certainty, which callers treat as "do not send".
 */
export function recipientsOf(message: Recipients): string[] | null {
  const out: string[] = []
  for (const field of [message.to, message.cc, message.bcc]) {
    if (field == null || field === '') continue
    for (const entry of (Array.isArray(field) ? field : [field]) as unknown[]) {
      const raw = typeof entry === 'string' ? entry : (entry as { address?: unknown })?.address
      if (typeof raw !== 'string') return null
      // A quoted display name containing a comma splits into an unparseable part: dropped, not guessed.
      for (const part of raw.split(',')) {
        const addr = (part.match(/<([^<>]*)>\s*$/)?.[1] ?? part).trim().toLowerCase()
        if (!ADDRESS.test(addr)) return null
        out.push(addr)
      }
    }
  }
  return out
}

/** Minimal plain-text alternative for HTML-only messages (Payload's auth emails only pass html). */
export function textFromHtml(html: string): string {
  return html
    .replace(/<(style|head)[\s\S]*?<\/\1>/gi, '')
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `${label.replace(/<[^>]+>/g, '').trim()}: ${href}`)
    .replace(/<br\s*\/?>|<\/(p|div|h[1-6]|tr|li)>/gi, '\n')
    .replace(/<\/td>/gi, '  ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export type EmailOutcome = 'sent' | 'dropped_recipient' | 'unconfigured' | 'local' | 'failed'
type Logger = { info: (o: object) => void; warn: (o: object) => void; error: (o: object) => void }
type Send = (message: SendEmailOptions) => Promise<unknown>

/**
 * Applies the environment policy, then sends. Never throws: a thrown send would
 * surface only for accounts that exist (forgot-password) or fail an order save,
 * so failures are logged and reported as an outcome instead. Logs carry the
 * outcome and provider status code only, never addresses, subjects, bodies or
 * provider error text (which can echo the request).
 */
export async function sendSafely(
  message: SendEmailOptions,
  mode: EmailMode,
  send: Send,
  log: Logger,
): Promise<EmailOutcome> {
  if (mode.kind === 'local') {
    log.info({ msg: 'email: local environment, not sent' })
    return 'local'
  }
  if (mode.kind === 'unconfigured') {
    log.error({ msg: 'email: RESEND_API_KEY or NEXT_PUBLIC_SITE_URL missing, not sent' })
    return 'unconfigured'
  }
  const recipients = recipientsOf(message as Recipients)
  if (!recipients || recipients.length === 0) {
    log.warn({ msg: 'email: unparseable or empty recipients, not sent' })
    return 'dropped_recipient'
  }
  let outgoing: SendEmailOptions = {
    ...message,
    replyTo: message.replyTo || EMAIL_REPLY_TO,
    text: message.text || (typeof message.html === 'string' ? textFromHtml(message.html) : undefined),
  }
  if (mode.kind === 'allowlist') {
    if (!recipients.every((r) => mode.allow.has(r))) {
      log.warn({ msg: 'email: recipient outside staging allowlist, not sent' })
      return 'dropped_recipient'
    }
    const subject = outgoing.subject ?? ''
    outgoing = { ...outgoing, subject: subject.startsWith('[STAGING]') ? subject : `[STAGING] ${subject}` }
  }
  try {
    await send(outgoing)
    log.info({ msg: 'email: sent' })
    return 'sent'
  } catch (err) {
    const status = (err as { status?: number })?.status
    log.error({ msg: 'email: provider send failed', status: typeof status === 'number' ? status : 'unknown' })
    return 'failed'
  }
}

/** Payload email adapter: the Resend REST adapter behind the environment policy above. */
export const auraEmailAdapter: EmailAdapter<EmailOutcome> = ({ payload }) => ({
  name: 'aura-resend',
  defaultFromAddress: EMAIL_FROM_ADDRESS,
  defaultFromName: EMAIL_FROM_NAME,
  sendEmail: async (message) => {
    // Read per send: Worker vars and secrets are bound at request time.
    const mode = emailMode()
    const send: Send = (m) =>
      mode.kind === 'production' || mode.kind === 'allowlist'
        ? resendAdapter({ apiKey: mode.apiKey, defaultFromAddress: EMAIL_FROM_ADDRESS, defaultFromName: EMAIL_FROM_NAME })({
            payload,
          }).sendEmail(m)
        : Promise.reject(new Error('no provider'))
    return sendSafely(message, mode, send, payload.logger)
  },
})

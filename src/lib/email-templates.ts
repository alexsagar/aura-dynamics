/**
 * Transactional email markup: one inline-styled, table-based column (what
 * mail clients render reliably), a text wordmark, no images, tracking or
 * external assets. Every interpolated value goes through escapeHtml.
 */

export const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

type Layout = {
  heading: string
  paragraphs: string[]
  /** A summary table: values are escaped here; `strong` marks the total row. */
  rows?: { label: string; value: string; strong?: boolean }[]
  action?: { label: string; url: string }
  footnote?: string
}

export function emailLayout({ heading, paragraphs, rows, action, footnote }: Layout): string {
  const p = (text: string) =>
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46">${escapeHtml(text)}</p>`
  const button = action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:999px;background:#0a0a0a">` +
      `<a href="${escapeHtml(action.url)}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px">${escapeHtml(action.label)}</a>` +
      `</td></tr></table>` +
      `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#71717a">If the button doesn't work, copy this link into your browser:<br><a href="${escapeHtml(action.url)}" style="color:#0a0a0a;word-break:break-all">${escapeHtml(action.url)}</a></p>`
    : ''
  const table = rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-top:1px solid #e4e4e7">` +
      rows
        .map(
          (r) =>
            `<tr><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;font-size:14px;line-height:1.5;color:${r.strong ? '#0a0a0a' : '#3f3f46'};font-weight:${r.strong ? 600 : 400}">${escapeHtml(r.label)}</td>` +
            `<td align="right" style="padding:10px 0 10px 16px;border-bottom:1px solid #e4e4e7;font-size:14px;line-height:1.5;white-space:nowrap;color:#0a0a0a;font-weight:${r.strong ? 600 : 400}">${escapeHtml(r.value)}</td></tr>`,
        )
        .join('') +
      `</table>`
    : ''
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px">
<tr><td style="padding:32px 32px 0;font-size:20px;font-weight:600;letter-spacing:-0.02em;color:#0a0a0a">Aura</td></tr>
<tr><td style="padding:24px 32px 16px">
<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#0a0a0a">${escapeHtml(heading)}</h1>
${paragraphs.map(p).join('\n')}
${table}
${button}
${footnote ? `<p style="margin:0;font-size:13px;line-height:1.6;color:#71717a">${escapeHtml(footnote)}</p>` : ''}
</td></tr>
<tr><td style="padding:16px 32px 32px;font-size:12px;line-height:1.6;color:#a1a1aa;border-top:1px solid #f4f4f5">Aura · printwithaura.com<br>Questions? Reply to this email.</td></tr>
</table></td></tr></table></body></html>`
}

export function passwordResetEmailHTML(url: string): string {
  return emailLayout({
    heading: 'Reset your password',
    paragraphs: ['We received a request to reset the password for your Aura account.'],
    action: { label: 'Choose a new password', url },
    footnote:
      "This link expires in one hour and can be used once. If you didn't request a reset, you can ignore this email; your password won't change.",
  })
}

export const PASSWORD_RESET_SUBJECT = 'Reset your Aura password'

// @vitest-environment node
// Every test that needs a real Payload on local D1 lives in this one file: separate
// files run in parallel and contend for the same local database.
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest'

let payload: Payload

beforeAll(async () => {
  const payloadConfig = await config
  payload = await getPayload({ config: payloadConfig })
})

describe('API', () => {
  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})

// Payload 3.92.1's supported reset flow (no email is sent: local mode).
describe('customer password reset', () => {
  const email = `reset-flow-${Date.now()}@example.invalid`
  const oldPassword = `Old-${crypto.randomUUID()}`
  let id: number | string
  // Payload's minRequestInterval between reset requests for one account.
  const waitForResetInterval = () => new Promise((r) => setTimeout(r, 15_100))

  beforeAll(async () => {
    const doc = await payload.create({ collection: 'customers', data: { email, password: oldPassword, name: 'Reset Flow' } as any })
    id = doc.id
  })

  afterAll(async () => {
    if (id) await payload.delete({ collection: 'customers', id })
  })

  it('forgot-password goes through the Aura adapter without logging the token or address', async () => {
    const spies = (['info', 'warn', 'error'] as const).map((l) => vi.spyOn(payload.logger, l))
    const token = await payload.forgotPassword({ collection: 'customers', data: { email } })
    expect(typeof token).toBe('string')
    const logged = JSON.stringify(spies.map((s) => s.mock.calls))
    expect(logged).not.toContain(token as string)
    expect(logged).not.toContain(email)
    expect(logged).toContain('email: local environment, not sent')
    spies.forEach((s) => s.mockRestore())
  })

  it('unknown email returns the same empty result (no account enumeration)', async () => {
    await expect(payload.forgotPassword({ collection: 'customers', data: { email: 'nobody@example.invalid' } })).resolves.toBeNull()
  })

  it('token resets once, cannot be reused, and ends earlier sessions', async () => {
    const before = await payload.login({ collection: 'customers', data: { email, password: oldPassword } })
    await waitForResetInterval()
    const token = (await payload.forgotPassword({ collection: 'customers', data: { email } })) as string
    const newPassword = `New-${crypto.randomUUID()}`

    await payload.resetPassword({ collection: 'customers', data: { token, password: newPassword }, overrideAccess: true })
    await expect(
      payload.resetPassword({ collection: 'customers', data: { token, password: `Again-${crypto.randomUUID()}` }, overrideAccess: true }),
    ).rejects.toMatchObject({ status: 403 })

    const doc: any = await payload.findByID({ collection: 'customers', id, overrideAccess: true, showHiddenFields: true })
    expect(doc.sessions?.map((s: any) => s.id) ?? []).not.toContain((before.user as any)._sid)
    await expect(payload.login({ collection: 'customers', data: { email, password: oldPassword } })).rejects.toBeTruthy()
    await expect(payload.login({ collection: 'customers', data: { email, password: newPassword } })).resolves.toBeTruthy()
  }, 30_000)

  it('expired token is rejected', async () => {
    await waitForResetInterval()
    const token = (await payload.forgotPassword({ collection: 'customers', data: { email } })) as string
    await payload.update({
      collection: 'customers',
      id,
      data: { resetPasswordExpiration: new Date(Date.now() - 1000).toISOString() } as any,
      overrideAccess: true,
    })
    await expect(
      payload.resetPassword({ collection: 'customers', data: { token, password: `X-${crypto.randomUUID()}` }, overrideAccess: true }),
    ).rejects.toMatchObject({ status: 403 })
  }, 30_000)
})

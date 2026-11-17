// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const state = { user: null as any, limited: false, loginFails: false }
const fakePayload = {
  auth: vi.fn(async () => ({ user: state.user })),
  login: vi.fn(async () => {
    if (state.loginFails) throw new Error('AuthenticationError')
    return { token: 't' }
  }),
  update: vi.fn(async () => ({})),
  logger: { error: vi.fn() },
}
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('@/lib/rate-limit', () => ({ passwordCheckRateLimited: async () => state.limited }))
vi.mock('payload', async (orig) => ({ ...(await orig<any>()), getPayload: async () => fakePayload }))

const { changePassword, updateProfile } = await import('@/app/(frontend)/account/settings/actions')
const { guardCustomerCredentials } = await import('@/lib/customer-credentials-guard')
const { parseProfile, passwordProblem } = await import('@/lib/account-settings')

const customer = { id: 5, collection: 'customers', email: 'buyer@example.com', _sid: 'sid-1' }
const form = (o: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(o)) f.set(k, v)
  return f
}
const pw = (o: Partial<Record<'currentPassword' | 'newPassword' | 'confirmPassword', string>> = {}) =>
  form({ currentPassword: 'old-password', newPassword: 'new-password-1', confirmPassword: 'new-password-1', ...o })

beforeEach(() => {
  Object.assign(state, { user: customer, limited: false, loginFails: false })
  fakePayload.login.mockClear()
  fakePayload.update.mockClear()
})

describe('changePassword', () => {
  it('verifies the current password via Payload login, then updates as the same customer', async () => {
    const res = await changePassword(null, pw())
    expect(res.ok).toBe(true)
    expect(fakePayload.login).toHaveBeenCalledWith({
      collection: 'customers',
      data: { email: 'buyer@example.com', password: 'old-password' },
    })
    // user (with _sid) is passed so Payload keeps this session and revokes the others.
    expect(fakePayload.update).toHaveBeenCalledWith({
      collection: 'customers',
      id: 5,
      data: { password: 'new-password-1' },
      user: customer,
      overrideAccess: false,
    })
  })

  it('rejects a wrong current password without updating', async () => {
    state.loginFails = true
    expect(await changePassword(null, pw())).toEqual({ ok: false, message: 'Current password is incorrect.' })
    expect(fakePayload.update).not.toHaveBeenCalled()
  })

  it.each([
    [{ confirmPassword: 'different-1' }, 'New passwords do not match.'],
    [{ newPassword: 'short', confirmPassword: 'short' }, 'Use at least 8 characters.'],
    [{ currentPassword: '' }, 'Enter your current password.'],
    [{ newPassword: 'old-password', confirmPassword: 'old-password' }, 'Choose a password different from your current one.'],
  ])('validates before checking the password: %o', async (over, message) => {
    expect(await changePassword(null, pw(over))).toEqual({ ok: false, message })
    expect(fakePayload.login).not.toHaveBeenCalled()
  })

  it('is rate limited before the password check', async () => {
    state.limited = true
    expect((await changePassword(null, pw())).ok).toBe(false)
    expect(fakePayload.login).not.toHaveBeenCalled()
  })

  it.each([null, { id: 1, collection: 'users', email: 'admin@example.com' }])('refuses non-customers: %o', async (user) => {
    state.user = user
    expect((await changePassword(null, pw())).ok).toBe(false)
    expect(fakePayload.login).not.toHaveBeenCalled()
  })
})

describe('updateProfile', () => {
  it('writes only trimmed name and phone', async () => {
    const res = await updateProfile(null, form({ name: '  Asha ', phone: '+977 9800000000', email: 'x@evil.test', password: 'p' }))
    expect(res.ok).toBe(true)
    expect(fakePayload.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 5, data: { name: 'Asha', phone: '+977 9800000000' }, overrideAccess: false }),
    )
  })

  it('rejects invalid input', async () => {
    expect((await updateProfile(null, form({ name: ' ' }))).ok).toBe(false)
    expect((await updateProfile(null, form({ name: 'A', phone: 'call me' }))).ok).toBe(false)
    expect(fakePayload.update).not.toHaveBeenCalled()
  })
})

describe('guardCustomerCredentials (REST/GraphQL)', () => {
  const run = (data: any, user: any, operation = 'update', payloadAPI = 'REST') =>
    guardCustomerCredentials({ data, operation, originalDoc: { email: 'buyer@example.com' }, req: { user, payloadAPI } } as any)

  it('blocks a customer changing password or email with a plain update', () => {
    expect(() => run({ password: 'new-password-1' }, customer)).toThrow(/Account settings/)
    expect(() => run({ email: 'other@example.com' }, customer)).toThrow(/not supported/)
  })

  it('allows a customer updating name, or resending the same email', () => {
    expect(run({ name: 'Asha', email: 'buyer@example.com' }, customer)).toEqual({ name: 'Asha', email: 'buyer@example.com' })
  })

  it('lets admins and the local API change credentials', () => {
    expect(() => run({ password: 'new-password-1', email: 'x@example.com' }, { id: 1, collection: 'users' })).not.toThrow()
    expect(() => run({ password: 'new-password-1' }, customer, 'update', 'local')).not.toThrow()
  })

  it('enforces the password rules on registration', () => {
    expect(() => run({ email: 'n@example.com', password: 'short' }, null, 'create')).toThrow(/at least 8/)
    expect(() => run({ email: 'n@example.com', password: 'long-enough' }, null, 'create')).not.toThrow()
  })
})

describe('validators', () => {
  it('passwordProblem', () => {
    expect(passwordProblem('12345678')).toBeNull()
    expect(passwordProblem('x'.repeat(129))).toMatch(/at most/)
    expect(passwordProblem(undefined)).toBe('Enter a password.')
  })
  it('parseProfile allows an empty phone', () => {
    expect(parseProfile({ name: 'Asha', phone: '' })).toEqual({ ok: true, data: { name: 'Asha', phone: '' } })
  })
})

import { describe, it, expect, vi } from 'vitest'

const limit = vi.fn()
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: async () => ({ env: { LOGIN_RATE_LIMITER: { limit } } }),
}))

const { authRateLimit, AUTH_LOCKOUT } = await import('@/lib/rate-limit')
const { Users } = await import('@/collections/Users')
const { Customers } = await import('@/collections/Customers')

const run = (operation: string, req: any = { payloadAPI: 'REST', headers: new Headers({ 'cf-connecting-ip': '203.0.113.7' }) }) =>
  (authRateLimit as any)({ args: { ok: true }, operation, req })

describe('login brute-force / lockout protection', () => {
  it('pins lockout at 5 attempts / 10 minutes for admins and customers', () => {
    expect(AUTH_LOCKOUT).toEqual({ maxLoginAttempts: 5, lockTime: 600000 })
    expect(Users.auth).toMatchObject(AUTH_LOCKOUT)
    expect(Customers.auth).toMatchObject(AUTH_LOCKOUT)
    expect(Users.hooks?.beforeOperation).toContain(authRateLimit)
    expect(Customers.hooks?.beforeOperation).toContain(authRateLimit)
  })

  it('throttles login and forgot-password per client IP with 429', async () => {
    limit.mockResolvedValueOnce({ success: true })
    await expect(run('login')).resolves.toEqual({ ok: true })
    expect(limit).toHaveBeenLastCalledWith({ key: '203.0.113.7' })
    limit.mockResolvedValueOnce({ success: false })
    await expect(run('login')).rejects.toMatchObject({ status: 429 })
    limit.mockResolvedValueOnce({ success: false })
    await expect(run('forgotPassword')).rejects.toMatchObject({ status: 429 })
  })

  it('ignores other operations and server-side Local API calls', async () => {
    limit.mockClear()
    await run('create')
    await run('login', { payloadAPI: 'local', headers: new Headers() })
    expect(limit).not.toHaveBeenCalled()
  })
})

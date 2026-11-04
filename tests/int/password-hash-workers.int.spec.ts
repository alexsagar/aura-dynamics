import crypto from 'crypto'
import { describe, it, expect } from 'vitest'

import { generatePasswordSaltHash } from '../../node_modules/payload/dist/auth/strategies/local/generatePasswordSaltHash.js'
import { authenticateLocalStrategy } from '../../node_modules/payload/dist/auth/strategies/local/authenticate.js'

// patches/payload@3.92.1.patch: Cloudflare Workers rejects PBKDF2 above 100000
// iterations, which broke registration and password changes on staging.
describe('password hashing stays within the Workers PBKDF2 limit', () => {
  const password = 'Correct-horse-9!'

  it('new hashes use 100000 iterations with the upstream 100k prefix and verify', async () => {
    const used: number[] = []
    const orig = crypto.pbkdf2
    ;(crypto as any).pbkdf2 = (...a: any[]) => (used.push(a[2]), (orig as any)(...a))
    try {
      const { hash, salt } = await generatePasswordSaltHash({ isPasswordAuthenticated: true, password } as any)
      expect(hash.startsWith('pbkdf2-sha256-100k-v1:')).toBe(true)
      const ok = await authenticateLocalStrategy({ doc: { id: 1, hash, salt }, password } as any)
      expect(ok?.shouldUpdatePasswordHash).toBe(false)
      expect(await authenticateLocalStrategy({ doc: { id: 1, hash, salt }, password: 'wrong' } as any)).toBeNull()
    } finally {
      ;(crypto as any).pbkdf2 = orig
    }
    expect(Math.max(...used)).toBeLessThanOrEqual(100000)
  })

  it('legacy 25000-iteration hashes still verify and are flagged for rehash', async () => {
    const salt = 'a'.repeat(64)
    const hash = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256').toString('hex')
    const ok = await authenticateLocalStrategy({ doc: { id: 1, hash, salt }, password } as any)
    expect(ok?.shouldUpdatePasswordHash).toBe(true)
  })
})

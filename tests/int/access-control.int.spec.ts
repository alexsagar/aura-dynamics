import { describe, it, expect } from 'vitest'
import type { CollectionConfig } from 'payload'

import { Users } from '@/collections/Users'
import { Categories } from '@/collections/Categories'
import { Materials } from '@/collections/Materials'
import { Media } from '@/collections/Media'
import { canReplayOrder, isVariantOfProduct } from '@/access/ecommerce'
import { readFileSync } from 'node:fs'

// Regression tests for staging QA findings (2026-11-04): Payload's default
// access lets any logged-in user (including storefront customers) write.

const admin = { id: 1, collection: 'users' }
const customer = { id: 1, collection: 'customers' }
const run = (fn: any, user: unknown, extra: object = {}) => fn({ req: { user, payloadAPI: 'REST', t: (k: string) => k }, ...extra })

describe('admin-only writes', () => {
  const cases: [string, CollectionConfig, string[]][] = [
    ['users', Users, ['admin', 'read', 'create', 'update', 'delete', 'unlock']],
    ['categories', Categories, ['create', 'update', 'delete']],
    ['materials', Materials, ['create', 'update', 'delete']],
    ['media', Media, ['create', 'update', 'delete']],
  ]

  for (const [slug, collection, ops] of cases) {
    for (const op of ops) {
      it(`${slug}.${op}: admin allowed, customer and anonymous denied`, () => {
        const fn = (collection.access as any)?.[op]
        expect(fn, `${slug}.${op} must be defined, not Payload's default`).toBeTypeOf('function')
        expect(run(fn, admin)).toBe(true)
        expect(run(fn, customer)).toBe(false)
        expect(run(fn, null)).toBe(false)
      })
    }
  }
})

describe('first-admin registration', () => {
  const hook = Users.hooks!.beforeOperation![0] as any
  const call = (user: unknown, payloadAPI: string, operation = 'create') =>
    hook({ operation, req: { user, payloadAPI, t: (k: string) => k } })

  it('rejects anonymous REST/GraphQL user creation (first-register on empty DB)', () => {
    expect(() => call(null, 'REST')).toThrow()
    expect(() => call(null, 'GraphQL')).toThrow()
  })

  it('allows signed-in admins and server-side Local API', () => {
    expect(() => call(admin, 'REST')).not.toThrow()
    expect(() => call(null, 'local')).not.toThrow()
  })

  it('does not affect login or other operations', () => {
    expect(() => call(null, 'REST', 'login')).not.toThrow()
    expect(() => call(null, 'REST', 'forgotPassword')).not.toThrow()
  })
})

describe('checkout variant ownership', () => {
  it('accepts a published variant of the same product', () => {
    expect(isVariantOfProduct({ product: 1, _status: 'published' }, 1)).toBe(true)
    expect(isVariantOfProduct({ product: { id: 1 }, _status: 'published' }, 1)).toBe(true)
  })

  it('rejects a variant from another product', () => {
    expect(isVariantOfProduct({ product: { id: 2 }, _status: 'published' }, 1)).toBe(false)
  })

  it('rejects draft or ownerless variants', () => {
    expect(isVariantOfProduct({ product: 1, _status: 'draft' }, 1)).toBe(false)
    expect(isVariantOfProduct({ product: null, _status: 'published' }, 1)).toBe(false)
    expect(isVariantOfProduct(null, 1)).toBe(false)
  })
})

describe('checkout idempotent replay ownership', () => {
  it('replays to the same customer or guest-to-guest', () => {
    expect(canReplayOrder({ customer: 2 }, 2)).toBe(true)
    expect(canReplayOrder({ customer: { id: 2 } }, 2)).toBe(true)
    expect(canReplayOrder({ customer: null }, null)).toBe(true)
  })

  it('withholds order metadata from anyone else holding the key', () => {
    expect(canReplayOrder({ customer: 2 }, 3)).toBe(false)
    expect(canReplayOrder({ customer: 2 }, null)).toBe(false)
    expect(canReplayOrder({ customer: null }, 3)).toBe(false)
  })
})

describe('payload-locked-documents', () => {
  it('is restricted to admins after config sanitisation', () => {
    const config = readFileSync('src/payload.config.ts', 'utf8')
    expect(config).toMatch(/slug === 'payload-locked-documents'[\s\S]{0,200}create: isAdmin, read: isAdmin, update: isAdmin, delete: isAdmin/)
  })
})

describe('version history is admin-only (audit run-1 readVersions lead)', () => {
  it('versioned globals restrict readVersions to admins', async () => {
    const globals = await Promise.all([
      import('@/globals/Footer').then((m) => m.Footer),
      import('@/globals/Header').then((m) => m.Header),
      import('@/globals/Homepage').then((m) => m.Homepage),
      import('@/globals/PageContent').then((m) => m.PageContent),
      import('@/globals/SiteSettings').then((m) => m.SiteSettings),
    ])
    for (const g of globals) {
      const fn = (g.access as any)?.readVersions
      expect(fn, `${g.slug}.readVersions`).toBeTypeOf('function')
      expect(run(fn, admin)).toBe(true)
      expect(run(fn, customer)).toBe(false)
      expect(run(fn, null)).toBe(false)
    }
  })

  it('products and variants restrict readVersions to admins', () => {
    const config = readFileSync('src/payload.config.ts', 'utf8')
    expect(config).toMatch(/read: productReadAccess, readVersions: isAdmin/)
    expect(config).toMatch(/read: variantReadAccess, readVersions: isAdmin/)
  })
})

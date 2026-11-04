import type { CollectionConfig } from 'payload'
import { AUTH_LOCKOUT, authRateLimit } from '../lib/rate-limit'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: { ...AUTH_LOCKOUT },
  hooks: { beforeOperation: [authRateLimit] },
  admin: {
    useAsTitle: 'email',
    group: 'Store',
    defaultColumns: ['name', 'email', 'phone', 'createdAt'],
  },
  access: {
    // Anyone can create/register a customer
    create: () => true,

    // Aura admins from `users` collection can read/update/delete customers
    // Logged-in customers can only read/update their own account
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users') return true
      if (user.collection === 'customers') {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users') return true
      if (user.collection === 'customers') {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },

    // Customers cannot delete themselves through normal API access
    delete: ({ req: { user } }) => {
      if (user && user.collection === 'users') {
        return true
      }
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
  ],
}

import type { CollectionConfig } from 'payload'
import { AUTH_LOCKOUT, authRateLimit } from '../lib/rate-limit'
import { siteUrl } from '../lib/email'
import { PASSWORD_RESET_SUBJECT, passwordResetEmailHTML } from '../lib/email-templates'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    ...AUTH_LOCKOUT,
    forgotPassword: {
      // Storefront reset page, not the admin UI. The token travels in the URL
      // fragment, which browsers never send to the server or in Referer headers.
      generateEmailHTML: (args) => passwordResetEmailHTML(`${siteUrl()}/reset-password#token=${args?.token ?? ''}`),
      generateEmailSubject: () => PASSWORD_RESET_SUBJECT,
    },
  },
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

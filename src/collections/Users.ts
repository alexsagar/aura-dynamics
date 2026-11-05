import { Forbidden, type CollectionConfig } from 'payload'
import { isAdmin } from '../access/ecommerce'
import { AUTH_LOCKOUT, authRateLimit } from '../lib/rate-limit'
import { siteUrl } from '../lib/email'
import { PASSWORD_RESET_SUBJECT, passwordResetEmailHTML } from '../lib/email-templates'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
    defaultColumns: ['email', 'createdAt'],
  },
  // Payload's default access is "any logged-in user", which includes
  // storefront customers. Admin accounts are managed by admins only.
  access: {
    admin: ({ req: { user } }) => user?.collection === 'users',
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    unlock: isAdmin,
  },
  hooks: {
    // Payload's first-register flow creates an admin with overrideAccess when
    // the users table is empty, so on a fresh or reset database any visitor
    // could claim it. Only signed-in admins or the Local API (server scripts,
    // see src/scripts/create-admin.ts) may create admin users.
    beforeOperation: [
      ({ operation, req }) => {
        if (operation === 'create' && !req.user && req.payloadAPI !== 'local') {
          throw new Forbidden(req.t)
        }
      },
      authRateLimit,
    ],
  },
  auth: {
    ...AUTH_LOCKOUT,
    forgotPassword: {
      // Payload's built-in admin reset screen, on the configured site origin
      // rather than the request Host.
      generateEmailHTML: (args) => {
        const { routes, admin } = args!.req!.payload.config
        return passwordResetEmailHTML(`${siteUrl()}${routes.admin}${admin.routes.reset}/${args?.token ?? ''}`)
      },
      generateEmailSubject: () => PASSWORD_RESET_SUBJECT,
    },
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}

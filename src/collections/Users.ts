import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/ecommerce'

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
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}

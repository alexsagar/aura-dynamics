import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/ecommerce'

/**
 * Header content only. Search, account, cart, mobile menu mechanics, the
 * official logo and every breakpoint stay code-controlled.
 */
export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  admin: { group: 'Content' },
  access: { read: () => true, update: isAdmin },
  versions: { max: 10 },
  fields: [
    {
      name: 'navLinks',
      type: 'array',
      label: 'Primary Navigation',
      dbName: 'hdr_nav',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      type: 'group',
      name: 'announcement',
      label: 'Announcement Bar',
      admin: {
        description: 'Not rendered yet — the current header has no announcement bar.',
      },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'text', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}

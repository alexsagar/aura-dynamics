import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/ecommerce'

/** ponytail: minimal SEO defaults. Per-page SEO lands with the pages that need it. */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: { group: 'Content' },
  access: { read: () => true, update: isAdmin },
  versions: { max: 10 },
  fields: [
    { name: 'siteName', type: 'text' },
    {
      type: 'group',
      name: 'defaultSeo',
      label: 'Default SEO',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}

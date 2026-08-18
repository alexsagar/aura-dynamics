import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/ecommerce'

/** Footer content only. Logo, watermark and newsletter mechanics stay in code. */
export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: 'Content' },
  access: { read: () => true, update: isAdmin },
  versions: { max: 10 },
  fields: [
    { name: 'brandHeading', type: 'text' },
    { name: 'brandCopy', type: 'textarea' },
    { name: 'newsletterHeading', type: 'text' },
    {
      name: 'columns',
      type: 'array',
      label: 'Link Columns',
      dbName: 'ftr_cols',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          dbName: 'ftr_col_links',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'contact',
      label: 'Contact',
      admin: {
        description:
          'Left empty on purpose. The values currently hardcoded in the footer are unverified placeholders — fill these in with real, confirmed details.',
      },
      fields: [
        { name: 'companyName', type: 'text' },
        { name: 'address', type: 'textarea' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      dbName: 'ftr_social',
      admin: { description: 'Only add profiles Aura actually owns.' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          dbName: 'ftr_soc_plat',
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
          ],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      dbName: 'ftr_legal',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      admin: { description: 'Year is prepended by the frontend.' },
    },
  ],
}

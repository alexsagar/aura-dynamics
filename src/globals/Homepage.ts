import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/ecommerce'
import { enabledField, imageField, linkGroup } from './fields'

/**
 * Homepage content, section by section, mirroring the fixed layout in
 * the frontend homepage route. Content only — every layout, spacing and
 * type decision stays in React/Tailwind.
 *
 * ponytail: no blocks / page builder. Sections are fixed in code, so the
 * fields are fixed too. Add a block layer only if editors need to reorder.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: { group: 'Content' },
  access: { read: () => true, update: isAdmin },
  versions: { drafts: true, max: 20 },
  fields: [
    {
      type: 'group',
      name: 'hero',
      label: '1. Hero',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'subheading', type: 'textarea' },
        imageField(),
        linkGroup('primaryCta', 'Primary CTA'),
        linkGroup('secondaryCta', 'Secondary CTA'),
      ],
    },
    {
      type: 'group',
      name: 'categories',
      label: '2. Shop Categories',
      fields: [
        enabledField,
        {
          name: 'items',
          type: 'array',
          dbName: 'hp_cat_items',
          maxRows: 3,
          fields: [
            { name: 'title', type: 'text' },
            { name: 'subtitle', type: 'text' },
            { name: 'url', type: 'text' },
            imageField(),
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'popular',
      label: '3. Popular Products',
      fields: [
        enabledField,
        { name: 'heading', type: 'text' },
        {
          name: 'products',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          admin: {
            description: 'Product records stay the source of truth for title, image, price.',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'materialsSection',
      label: '4. Explore by Material',
      fields: [
        enabledField,
        { name: 'heading', type: 'text' },
        {
          name: 'items',
          type: 'array',
          dbName: 'hp_mat_items',
          fields: [
            { name: 'material', type: 'relationship', relationTo: 'materials' },
            {
              name: 'displayName',
              type: 'text',
              admin: { description: 'Optional override. Falls back to the linked material name.' },
            },
            { name: 'description', type: 'textarea' },
            { name: 'url', type: 'text' },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'useCases',
      label: '5. What Are You Printing',
      fields: [
        enabledField,
        { name: 'heading', type: 'text' },
        {
          name: 'items',
          type: 'array',
          dbName: 'hp_uc_items',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'subtitle', type: 'text' },
            { name: 'url', type: 'text' },
            imageField(),
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'freshPrints',
      label: '6. Fresh From the Printer',
      fields: [
        enabledField,
        { name: 'heading', type: 'text' },
        linkGroup('viewAll', 'View All Link'),
        { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true },
      ],
    },
    {
      type: 'group',
      name: 'staffPick',
      label: '7. Staff Pick',
      fields: [
        enabledField,
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
        imageField(),
        { name: 'product', type: 'relationship', relationTo: 'products' },
        linkGroup('cta', 'CTA'),
      ],
    },
    {
      type: 'group',
      name: 'compare',
      label: '9. Material Comparison',
      admin: { description: 'Section 8 (colour explorer) is code-driven and has no CMS content.' },
      fields: [
        enabledField,
        { name: 'heading', type: 'text' },
        {
          name: 'columns',
          type: 'array',
          dbName: 'hp_cmp_cols',
          maxRows: 4,
          admin: { description: 'One column per material, in display order.' },
          fields: [
            { name: 'label', type: 'text' },
            { name: 'bestFor', type: 'text' },
          ],
        },
        {
          name: 'rows',
          type: 'array',
          dbName: 'hp_cmp_rows',
          fields: [
            { name: 'label', type: 'text' },
            {
              name: 'scores',
              type: 'array',
              dbName: 'hp_cmp_scores',
              maxRows: 4,
              admin: { description: 'Score 1-5, one per column above, same order.' },
              fields: [{ name: 'score', type: 'number', min: 1, max: 5 }],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'testimonials',
      label: '10. Community Spotlight',
      admin: {
        description:
          'Placeholder only. Do not publish attributed customer quotes until they are real and approved.',
      },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'heading', type: 'text' },
        {
          name: 'items',
          type: 'array',
          dbName: 'hp_testi_items',
          fields: [
            { name: 'quote', type: 'textarea' },
            { name: 'attribution', type: 'text' },
            { name: 'role', type: 'text' },
            imageField('avatar'),
            {
              name: 'isPlaceholder',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Uncheck only for a real, approved, permissioned testimonial.',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'whyAura',
      label: '11. Why Aura',
      fields: [
        enabledField,
        { name: 'heading', type: 'text' },
        { name: 'subheading', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          dbName: 'hp_why_items',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'body', type: 'textarea' },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'learningHub',
      label: '12. Learning Hub',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Off by default: /guides does not exist yet.' },
        },
        { name: 'heading', type: 'text' },
        linkGroup('viewAll', 'View All Link'),
        {
          name: 'items',
          type: 'array',
          dbName: 'hp_learn_items',
          fields: [
            { name: 'meta', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'summary', type: 'textarea' },
            { name: 'url', type: 'text' },
            imageField(),
          ],
        },
      ],
    },
  ],
}

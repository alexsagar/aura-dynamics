import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/ecommerce'
import { enabledField, imageField, linkGroup } from './fields'

/**
 * Homepage content, section by section, mirroring the fixed layout in
 * the frontend homepage route. Content only — every layout, spacing and
 * type decision stays in React/Tailwind.
 *
 * Sections are organised with collapsible admin controls so editors can
 * focus on one section at a time without endless scrolling.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: { group: 'Content' },
  access: { read: () => true, update: isAdmin },
  versions: { drafts: true, max: 20 },
  fields: [
    {
      type: 'collapsible',
      label: '1. Hero Section',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          type: 'group',
          name: 'hero',
          admin: { hideGutter: true },
          fields: [
            { name: 'heading', type: 'text', label: 'Headline' },
            { name: 'subheading', type: 'textarea', label: 'Sub-headline' },
            imageField(),
            linkGroup('primaryCta', 'Primary CTA'),
            linkGroup('secondaryCta', 'Secondary CTA'),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '2. Shop Categories',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'categories',
          admin: { hideGutter: true },
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
      ],
    },
    {
      type: 'collapsible',
      label: '3. Popular Products',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'popular',
          admin: { hideGutter: true },
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
      ],
    },
    {
      type: 'collapsible',
      label: '4. Explore by Material',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'materialsSection',
          admin: { hideGutter: true },
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
      ],
    },
    {
      type: 'collapsible',
      label: '5. What Are You Printing (Use Cases)',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'useCases',
          admin: { hideGutter: true },
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
      ],
    },
    {
      type: 'collapsible',
      label: '6. Fresh From the Printer',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'freshPrints',
          admin: { hideGutter: true },
          fields: [
            enabledField,
            { name: 'heading', type: 'text' },
            linkGroup('viewAll', 'View All Link'),
            { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '7. Staff Pick',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'staffPick',
          admin: { hideGutter: true },
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
      ],
    },
    {
      type: 'collapsible',
      label: '8. Made in Every Shade',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'shadeShowcase',
          admin: {
            hideGutter: true,
            description: 'Copy only. The colour swatches, images, and interaction stay code-driven.',
          },
          fields: [
            enabledField,
            { name: 'heading', type: 'text' },
            { name: 'description', type: 'textarea' },
            { name: 'ctaLabel', type: 'text' },
            { name: 'ctaUrl', type: 'text' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '9. Material Comparison',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'compare',
          admin: { hideGutter: true },
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
      ],
    },
    {
      type: 'collapsible',
      label: '10. Community Spotlight',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'testimonials',
          admin: {
            hideGutter: true,
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
      ],
    },
    {
      type: 'collapsible',
      label: '11. Why Aura',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'whyAura',
          admin: { hideGutter: true },
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
      ],
    },
    {
      type: 'collapsible',
      label: '12. Learning Hub',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'group',
          name: 'learningHub',
          admin: { hideGutter: true },
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
    },
  ],
}

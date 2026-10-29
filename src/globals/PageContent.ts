import type { Field, GlobalConfig } from 'payload'

import { isAdmin } from '../access/ecommerce'
import { imageField, linkGroup } from './fields'

/**
 * Editable marketing copy for the fixed storefront landing/informational
 * pages, modelled on each page's actual fixed design — NOT a generic page
 * builder. Product data, catalogue results and functional UI stay in code.
 *
 * About and Materials are their own globals: D1 caps a query at 100 bound
 * parameters, and one global's main-table upsert binds every scalar column
 * twice, so all pages in one table would make Admin saves fail.
 */
const seoFields: Field[] = [
  {
    name: 'seoTitle',
    label: 'SEO Title',
    type: 'text',
    admin: { description: 'Browser tab / search-result title. Falls back to the site default.' },
  },
  {
    name: 'seoDescription',
    label: 'SEO Description',
    type: 'textarea',
    admin: { description: 'Search-result and social description.' },
  },
]

const heading: Field = { name: 'heading', type: 'text', admin: { description: 'Main page heading' } }
const intro: Field = {
  name: 'intro',
  type: 'textarea',
  admin: { description: 'Short introductory line shown under the heading' },
}
const text = (name: string, label?: string): Field => ({ name, label, type: 'text' })
const textarea = (name: string, label?: string): Field => ({ name, label, type: 'textarea' })
const group = (name: string, label: string, fields: Field[]): Field => ({ type: 'group', name, label, fields })

const contentGlobal = (slug: string, label: string, description: string, fields: Field[]): GlobalConfig => ({
  slug,
  label,
  admin: { group: 'Content', description },
  access: { read: () => true, update: isAdmin },
  versions: { max: 10 },
  fields,
})

export const PageContent = contentGlobal(
  'page-content',
  'Page Content',
  'Headings, copy, imagery and SEO for the catalogue landing and legal pages.',
  [
    group('filaments', 'Filaments Page', [heading, intro, ...seoFields]),
    group('prints', '3D Prints Page', [heading, intro, ...seoFields]),
    group('collections', 'Collections Page', [
      text('eyebrow'),
      heading,
      intro,
      {
        name: 'cards',
        label: 'Catalogue Cards',
        type: 'array',
        dbName: 'pc_coll_cards',
        fields: [text('title'), text('subtitle'), text('url'), imageField()],
      },
      text('categoriesHeading', 'Categories Heading'),
      ...seoFields,
    ]),
    group('privacy', 'Privacy Policy Page', [heading, intro, { name: 'body', type: 'richText' }, ...seoFields]),
    group('terms', 'Terms of Service Page', [heading, intro, { name: 'body', type: 'richText' }, ...seoFields]),
  ],
)

export const AboutPage = contentGlobal('about-page', 'About Page', 'Copy, imagery and SEO for /about.', [
  text('headingLine1', 'Heading Line 1'),
  text('headingLine2', 'Heading Line 2'),
  intro,
  imageField('heroImage'),
  group('mission', 'Mission', [
    text('eyebrow'),
    text('heading'),
    {
      name: 'paragraphs',
      label: 'Paragraphs (before image)',
      type: 'array',
      dbName: 'pc_about_mission_p',
      fields: [{ name: 'text', type: 'textarea' }],
    },
    imageField(),
    textarea('closing', 'Paragraph (after image)'),
  ]),
  group('studio', 'Studio', [
    text('heading'),
    text('subheading'),
    imageField('imageLarge'),
    imageField('imageTop'),
    imageField('imageBottom'),
  ]),
  group('local', 'Made in Nepal', [text('heading'), textarea('body')]),
  group('contact', 'Get in Touch', [
    text('heading'),
    textarea('body'),
    text('locationLabel'),
    text('location'),
    text('locationNote'),
    text('contactLabel'),
    text('email'),
    text('phone'),
    text('socialLabel'),
    {
      name: 'socialLinks',
      type: 'array',
      dbName: 'pc_about_social',
      admin: { description: 'Leave URL empty to show the label without a link.' },
      fields: [text('label'), text('url')],
    },
  ]),
  ...seoFields,
])

export const MaterialsPage = contentGlobal('materials-page', 'Materials Page', 'Copy, imagery and SEO for /materials.', [
  text('eyebrow'),
  heading,
  intro,
  linkGroup('primaryCta', 'Primary CTA'),
  linkGroup('secondaryCta', 'Secondary CTA'),
  imageField('heroImage'),
  group('matrix', 'Matrix', [
    text('heading'),
    text('subheading'),
    {
      name: 'rows',
      type: 'array',
      dbName: 'pc_mat_matrix',
      fields: [
        text('material'),
        ...(['strength', 'flex', 'heat', 'ease'] as const).map(
          (name): Field => ({ name, type: 'number', min: 0, max: 5 }),
        ),
      ],
    },
  ]),
  {
    name: 'deepDives',
    label: 'Deep Dives',
    type: 'array',
    dbName: 'pc_mat_dives',
    fields: [
      text('eyebrow'),
      text('heading'),
      textarea('body'),
      { name: 'points', type: 'array', dbName: 'pc_mat_dive_pts', fields: [text('text')] },
      linkGroup('cta', 'CTA'),
      text('watermark'),
      imageField(),
    ],
  },
  group('quality', 'Quality Assurance', [text('heading'), { name: 'body', type: 'richText' }, imageField()]),
  group('cta', 'Closing CTA', [
    text('heading'),
    textarea('body'),
    linkGroup('button', 'Button'),
    text('cardTitle'),
    text('cardUrl'),
    imageField(),
  ]),
  ...seoFields,
])

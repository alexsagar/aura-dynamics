import type { Field, GlobalConfig } from 'payload'

import { isAdmin } from '../access/ecommerce'

/**
 * Editable marketing copy for the fixed storefront landing/informational
 * pages. One grouped section per page — NOT a generic page builder. Only the
 * heading / intro / SEO that each current page actually shows is editable;
 * product data, catalogue results and functional UI stay in code. Every field
 * is optional: an empty value falls back to the approved copy in code, so
 * clearing a field never blanks a live page.
 */
const pageGroup = (
  name: string,
  label: string,
  opts: { heading?: boolean; intro?: boolean } = { heading: true, intro: true },
): Field => ({
  type: 'group',
  name,
  label,
  fields: [
    ...(opts.heading === false
      ? []
      : [{ name: 'heading', type: 'text', admin: { description: 'Main page heading' } } as Field]),
    ...(opts.intro === false
      ? []
      : [
          {
            name: 'intro',
            type: 'textarea',
            admin: { description: 'Short introductory line shown under the heading' },
          } as Field,
        ]),
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
  ],
})

export const PageContent: GlobalConfig = {
  slug: 'page-content',
  label: 'Page Content',
  admin: {
    group: 'Content',
    description: 'Headings, intros and SEO for the storefront landing and legal pages.',
  },
  access: { read: () => true, update: isAdmin },
  versions: { max: 10 },
  fields: [
    pageGroup('filaments', 'Filaments Page'),
    pageGroup('prints', '3D Prints Page'),
    pageGroup('collections', 'Collections Page'),
    // About/Materials hero headings keep their in-code styling (line breaks,
    // scale); only their intro + SEO are editable here.
    pageGroup('about', 'About Page', { heading: false, intro: true }),
    pageGroup('materials', 'Materials Page'),
    pageGroup('privacy', 'Privacy Policy Page'),
    pageGroup('terms', 'Terms of Service Page'),
  ],
}

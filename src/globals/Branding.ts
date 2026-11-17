import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/ecommerce'

const image = (name: string, label: string, description: string) =>
  ({ name, label, type: 'upload', relationTo: 'media', admin: { description } }) as const

/**
 * One place for brand imagery. Every field is optional: an empty field falls
 * back to the official Aura files shipped in public/brand/ (or the built-in
 * login photography), so the site never shows a broken logo.
 */
export const Branding: GlobalConfig = {
  slug: 'branding',
  label: 'Branding & Images',
  admin: {
    group: 'Settings',
    description: 'Logos, favicon and sign-in imagery. Leave a field empty to use the built-in default.',
  },
  access: { read: () => true, update: isAdmin, readVersions: isAdmin },
  versions: { max: 10 },
  fields: [
    {
      type: 'collapsible',
      label: 'Aura logo',
      fields: [
        image('logo', 'Logo for light backgrounds', 'Shown in the header. SVG or PNG with a transparent background, trimmed to the artwork.'),
        image('logoOnDark', 'Logo for dark backgrounds', 'Shown in the black footer. Use a white / off-white version.'),
        image('favicon', 'Favicon', 'Browser tab icon. Square SVG or PNG, at least 64×64.'),
      ],
    },
    {
      type: 'collapsible',
      label: 'Partner logo (footer)',
      fields: [
        image('partnerLogo', 'Partner logo', 'Shown beside the Aura logo in the black footer, e.g. Numakers. Use a version that reads on black.'),
        { name: 'partnerName', type: 'text', label: 'Partner name', admin: { description: 'Used as the logo’s text alternative, e.g. "Numakers".' } },
        { name: 'partnerUrl', type: 'text', label: 'Partner link (optional)' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Sign-in page images',
      fields: [
        image('loginImage', 'Sign-in image', 'Large photo beside the sign-in form (desktop). Portrait works best.'),
        image('registerImage', 'Create-account image', 'Large photo beside the create-account form (desktop).'),
      ],
    },
  ],
}

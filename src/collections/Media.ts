import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'filesize', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'filesize',
      type: 'number',
      admin: {
        readOnly: true,
        components: {
          Cell: '@/components/admin/FileSizeCell#FileSizeCell',
        },
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: 'Alternative Text (Alt)',
      required: true,
      admin: {
        description: 'Descriptive text for accessibility, SEO, and screen readers.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Optional image caption for editorial displays.',
      },
    },
    {
      // Stable dedupe key for the storefront media migration. Filenames are not
      // reliable enough on their own.
      name: 'migrationKey',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set by the media seed. Identifies a migrated asset.',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Original remote URL this asset was imported from.',
      },
    },
    {
      name: 'temporaryAsset',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Placeholder photography. Replace before launch.',
      },
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
  },
}

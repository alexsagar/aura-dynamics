import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

import { Users } from './collections/Users'
import { Customers } from './collections/Customers'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Materials } from './collections/Materials'
import { Homepage } from './globals/Homepage'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'
import {
  adminOnlyFieldAccess,
  adminOrPublishedStatus,
  isAdmin,
  isAuthenticated,
  isCustomer,
  isDocumentOwner,
} from './access/ecommerce'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => {
  try {
    return fs.existsSync(value) ? fs.realpathSync(value) : undefined
  } catch {
    return undefined
  }
}

const isCLI = process.argv.some((value) => {
  const resolved = realpath(value)
  if (!resolved) return false
  return (
    resolved.endsWith(path.join('payload', 'bin.js')) ||
    resolved.endsWith(path.join('next', 'dist', 'bin', 'next'))
  )
})
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Aura Admin',
      icons: [{ rel: 'icon', url: '/brand/aura-symbol.svg' }],
      openGraph: {
        images: '/brand/aura-logo.svg',
      },
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#Logo',
        Icon: '@/components/admin/Icon#Icon',
      },
      beforeDashboard: ['@/components/admin/BeforeDashboard#BeforeDashboard'],
    },
  },
  collections: [Users, Customers, Media, Categories, Materials],
  globals: [Homepage, Header, Footer, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    push: false,
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    ecommercePlugin({
      access: {
        adminOnlyFieldAccess,
        adminOrPublishedStatus,
        isAdmin,
        isAuthenticated,
        isCustomer,
        isDocumentOwner,
      },
      customers: {
        slug: Customers.slug,
      },
      currencies: {
        defaultCurrency: 'NPR',
        supportedCurrencies: [
          {
            code: 'NPR',
            decimals: 2,
            label: 'Nepalese Rupee',
            symbol: 'Rs.',
          },
        ],
      },
      inventory: true,
      carts: {
        allowGuestCarts: true,
        cartsCollectionOverride: ({ defaultCollection }: { defaultCollection: any }) => ({
          ...defaultCollection,
          admin: {
            ...defaultCollection.admin,
            group: 'Store',
            defaultColumns: ['id', 'customer', 'subtotal', 'currency', 'updatedAt'],
          },
        }),
      },
      orders: {
        ordersCollectionOverride: ({ defaultCollection }: { defaultCollection: any }) => ({
          ...defaultCollection,
          admin: {
            ...defaultCollection.admin,
            group: 'Store',
            defaultColumns: ['orderNumber', 'paymentMethod', 'paymentStatus', 'amount', 'status', 'createdAt'],
          },
          fields: [
            ...defaultCollection.fields,
            {
              name: 'orderNumber',
              type: 'text',
              index: true,
              admin: {
                position: 'sidebar',
                readOnly: true,
              },
            },
            {
              name: 'idempotencyKey',
              type: 'text',
              index: true,
              unique: true,
              admin: {
                position: 'sidebar',
                readOnly: true,
                description: 'Unique client idempotency key to prevent duplicate orders',
              },
            },
            {
              name: 'paymentMethod',
              type: 'select',
              defaultValue: 'esewa_qr',
              options: [
                { label: 'eSewa QR', value: 'esewa_qr' },
                { label: 'Cash on Delivery (COD)', value: 'cod' },
              ],
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'paymentStatus',
              type: 'select',
              defaultValue: 'awaiting_verification',
              options: [
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Awaiting Verification', value: 'awaiting_verification' },
                { label: 'Paid', value: 'paid' },
                { label: 'Refunded', value: 'refunded' },
              ],
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'paymentReference',
              type: 'text',
              admin: {
                position: 'sidebar',
                description: 'Customer-supplied transaction or reference ID',
              },
            },
            {
              name: 'subtotal',
              type: 'number',
              admin: {
                position: 'sidebar',
                readOnly: true,
              },
            },
            {
              name: 'shipping',
              type: 'number',
              admin: {
                position: 'sidebar',
                readOnly: true,
              },
            },
            {
              name: 'orderNotes',
              type: 'textarea',
            },
            {
              name: 'itemsSnapshot',
              type: 'json',
              admin: {
                description: 'Immutable snapshot of purchased items at checkout time',
              },
            },
          ],
        }),
      },
      addresses: {
        addressesCollectionOverride: ({ defaultCollection }: { defaultCollection: any }) => ({
          ...defaultCollection,
          admin: {
            ...defaultCollection.admin,
            group: 'Store',
          },
        }),
      },
      transactions: {
        transactionsCollectionOverride: ({ defaultCollection }: { defaultCollection: any }) => ({
          ...defaultCollection,
          admin: {
            ...defaultCollection.admin,
            group: 'Store',
          },
        }),
      },
      payments: {
        paymentMethods: [],
      },
      products: {
        variants: {
          variantTypesCollectionOverride: ({ defaultCollection }: { defaultCollection: any }) => ({
            ...defaultCollection,
            admin: {
              ...defaultCollection.admin,
              group: 'Catalog',
              defaultColumns: ['label', 'name', 'updatedAt'],
            },
          }),
          variantOptionsCollectionOverride: ({ defaultCollection }: { defaultCollection: any }) => ({
            ...defaultCollection,
            admin: {
              ...defaultCollection.admin,
              group: 'Catalog',
              defaultColumns: [
                'label',
                'value',
                'variantType',
                'colorFamily',
                'hexColor',
                'material',
              ],
            },
            fields: [
              ...defaultCollection.fields,
              {
                name: 'material',
                type: 'relationship',
                relationTo: 'materials',
                admin: {
                  description: 'Link canonical material if this Option belongs to Material Variant Type',
                },
              },
              {
                name: 'colorFamily',
                type: 'select',
                admin: {
                  description: 'Select color family if this Option belongs to Color Variant Type',
                },
                options: [
                  { label: 'Black', value: 'black' },
                  { label: 'White', value: 'white' },
                  { label: 'Gray', value: 'gray' },
                  { label: 'Red', value: 'red' },
                  { label: 'Orange', value: 'orange' },
                  { label: 'Yellow', value: 'yellow' },
                  { label: 'Green', value: 'green' },
                  { label: 'Blue', value: 'blue' },
                  { label: 'Purple', value: 'purple' },
                  { label: 'Pink', value: 'pink' },
                  { label: 'Brown', value: 'brown' },
                  { label: 'Beige', value: 'beige' },
                  { label: 'Gold', value: 'gold' },
                  { label: 'Silver', value: 'silver' },
                  { label: 'Transparent', value: 'transparent' },
                  { label: 'Multicolor', value: 'multicolor' },
                  { label: 'Other', value: 'other' },
                ],
              },
              {
                name: 'hexColor',
                type: 'text',
                admin: {
                  description: 'Optional hex code in format #RRGGBB (e.g. #15A246)',
                },
                validate: (val?: string | null) => {
                  if (!val) return true
                  return /^#[0-9A-Fa-f]{6}$/.test(val) || 'Hex color must be in format #RRGGBB'
                },
              },
            ],
          }),
          variantsCollectionOverride: ({ defaultCollection }: { defaultCollection: any }) => ({
            ...defaultCollection,
            admin: {
              ...defaultCollection.admin,
              group: 'Catalog',
              defaultColumns: ['title', 'sku', 'priceInNPR', 'inventory', 'active', 'updatedAt'],
            },
            fields: [
              ...defaultCollection.fields,
              {
                name: 'images',
                type: 'upload',
                relationTo: 'media',
                hasMany: true,
                admin: {
                  description: 'Variant photography for customer-facing display',
                },
              },
              {
                name: 'sku',
                type: 'text',
                index: true,
              },
              {
                name: 'lowStockThreshold',
                type: 'number',
                defaultValue: 3,
                min: 0,
                admin: {
                  description: 'Threshold below which low-stock warnings trigger',
                },
              },
              {
                name: 'active',
                type: 'checkbox',
                defaultValue: true,
                admin: {
                  description: 'Disabled variants will not be purchasable on storefront',
                },
              },
            ],
          }),
        },
        productsCollectionOverride: ({ defaultCollection }: { defaultCollection: any }) => ({
          ...defaultCollection,
          admin: {
            ...defaultCollection.admin,
            group: 'Catalog',
            useAsTitle: 'title',
            defaultColumns: ['title', 'productType', 'prices', 'variants', 'updatedAt'],
          },
          fields: [
            ...defaultCollection.fields,
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: {
                description: 'URL identifier. Auto-generated from title when left empty.',
              },
              hooks: {
                // ponytail: plain slugify, no plugin dependency
                beforeValidate: [
                  ({ value, data }: { value?: string | null; data?: Record<string, any> }) =>
                    (value || data?.title || '')
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, ''),
                ],
              },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              admin: {
                description: 'Used for product cards, listings and search previews',
              },
            },
            {
              name: 'description',
              type: 'richText',
            },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'productType',
              type: 'select',
              required: true,
              options: [
                { label: 'Filament', value: 'filament' },
                { label: '3D Print', value: '3d-print' },
              ],
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              admin: {
                condition: (data: Record<string, any>) => data?.productType === '3d-print',
              },
            },
            {
              type: 'group',
              name: 'filamentDetails',
              label: 'Filament Details',
              dbName: 'fil_det',
              admin: {
                condition: (data: Record<string, any>) => data?.productType === 'filament',
              },
              fields: [
                {
                  name: 'brand',
                  type: 'select',
                  defaultValue: 'Numakers',
                  options: [{ label: 'Numakers', value: 'Numakers' }],
                },
                {
                  name: 'material',
                  type: 'relationship',
                  relationTo: 'materials',
                },
                {
                  name: 'finish',
                  type: 'select',
                  dbName: 'fin_opt',
                  options: [
                    { label: 'Basic', value: 'basic' },
                    { label: 'Matte', value: 'matte' },
                    { label: 'Silk', value: 'silk' },
                    { label: 'Glossy', value: 'glossy' },
                    { label: 'Metallic', value: 'metallic' },
                    { label: 'Transparent', value: 'transparent' },
                    { label: 'Translucent', value: 'translucent' },
                    { label: 'Sparkle', value: 'sparkle' },
                    { label: 'Marble', value: 'marble' },
                    { label: 'Gradient', value: 'gradient' },
                    { label: 'Dual Color', value: 'dual-color' },
                    { label: 'Tri Color', value: 'tri-color' },
                    { label: 'Glow', value: 'glow' },
                    { label: 'Wood', value: 'wood' },
                    { label: 'Other', value: 'other' },
                  ],
                },
                {
                  name: 'diameter',
                  type: 'number',
                  defaultValue: 1.75,
                  admin: {
                    readOnly: true,
                    description: 'Aura sells only 1.75 mm filament',
                  },
                },
                {
                  name: 'netWeightKg',
                  type: 'number',
                  defaultValue: 1,
                  admin: {
                    readOnly: true,
                    description: 'Aura sells only 1 kg filament spools',
                  },
                },
                {
                  type: 'group',
                  name: 'technicalSpecifications',
                  label: 'Technical Specifications',
                  dbName: 'tech_specs',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'nozzleTempMin',
                          type: 'number',
                          label: 'Nozzle Temp Min (°C)',
                        },
                        {
                          name: 'nozzleTempMax',
                          type: 'number',
                          label: 'Nozzle Temp Max (°C)',
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'bedTempMin',
                          type: 'number',
                          label: 'Bed Temp Min (°C)',
                        },
                        {
                          name: 'bedTempMax',
                          type: 'number',
                          label: 'Bed Temp Max (°C)',
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'printSpeedMin',
                          type: 'number',
                          label: 'Print Speed Min (mm/s)',
                        },
                        {
                          name: 'printSpeedMax',
                          type: 'number',
                          label: 'Print Speed Max (mm/s)',
                        },
                      ],
                    },
                    {
                      name: 'density',
                      type: 'number',
                      label: 'Density (g/cm³)',
                    },
                    {
                      type: 'group',
                      name: 'drying',
                      label: 'Drying Recommendations',
                      dbName: 'drying_specs',
                      fields: [
                        {
                          name: 'recommended',
                          type: 'checkbox',
                          label: 'Drying Recommended',
                        },
                        {
                          name: 'temperature',
                          type: 'number',
                          label: 'Drying Temp (°C)',
                        },
                        {
                          name: 'durationHours',
                          type: 'number',
                          label: 'Drying Duration (hours)',
                        },
                      ],
                    },
                    {
                      name: 'enclosure',
                      type: 'select',
                      dbName: 'enc_opt',
                      options: [
                        { label: 'Not Required', value: 'not-required' },
                        { label: 'Recommended', value: 'recommended' },
                        { label: 'Required', value: 'required' },
                      ],
                    },
                    {
                      name: 'hardenedNozzle',
                      type: 'select',
                      dbName: 'hn_opt',
                      options: [
                        { label: 'Not Required', value: 'not-required' },
                        { label: 'Recommended', value: 'recommended' },
                        { label: 'Required', value: 'required' },
                      ],
                    },
                    {
                      name: 'amsCompatibility',
                      type: 'select',
                      dbName: 'ams_opt',
                      options: [
                        { label: 'Compatible', value: 'compatible' },
                        { label: 'Not Compatible', value: 'not-compatible' },
                        { label: 'Conditional', value: 'conditional' },
                        { label: 'Unknown', value: 'unknown' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      },
    }),
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}

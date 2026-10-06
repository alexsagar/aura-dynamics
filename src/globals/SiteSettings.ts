import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/ecommerce'

/** ponytail: minimal SEO defaults. Per-page SEO lands with the pages that need it. */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: { group: 'Settings' },
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
    {
      type: 'group',
      name: 'paymentSettings',
      label: 'Payment Settings',
      fields: [
        {
          name: 'esewaQrImage',
          label: 'eSewa QR Code Image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Upload the merchant eSewa QR code image to show at checkout',
          },
        },
        {
          name: 'esewaMerchantName',
          label: 'eSewa Merchant Name',
          type: 'text',
          admin: {
            description: 'Merchant / Account holder name displayed to customer (e.g. Aura 3D Technologies)',
          },
        },
        {
          name: 'esewaId',
          label: 'eSewa ID / Number',
          type: 'text',
          admin: {
            description: 'Optional registered eSewa phone or merchant ID',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'shippingSettings',
      label: 'Shipping Settings',
      admin: {
        description: 'Temporary development defaults for shipping fees. Update with real business rules before production.',
      },
      fields: [
        {
          name: 'shippingFee',
          label: 'Standard Shipping Fee (NPR)',
          type: 'number',
          defaultValue: 150,
          admin: {
            description: 'Standard flat rate shipping fee in NPR for orders below free shipping threshold (Temporary test default)',
          },
        },
        {
          name: 'freeShippingThreshold',
          label: 'Free Shipping Threshold (NPR)',
          type: 'number',
          defaultValue: 5000,
          admin: {
            description: 'Cart subtotal in NPR required to qualify for free delivery (Temporary test default)',
          },
        },
        {
          name: 'freeShippingEnabled',
          label: 'Enable Free Shipping Promotion',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether qualifying orders receive free delivery (Temporary test default)',
          },
        },
      ],
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const Materials: CollectionConfig = {
  slug: 'materials',
  admin: {
    useAsTitle: 'name',
    group: 'Catalog',
    defaultColumns: ['name', 'slug', 'baseFamily', 'sortOrder', 'active', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'baseFamily',
      type: 'select',
      required: true,
      options: [
        { label: 'PLA', value: 'pla' },
        { label: 'PETG', value: 'petg' },
        { label: 'TPU', value: 'tpu' },
        { label: 'ABS', value: 'abs' },
        { label: 'ASA', value: 'asa' },
        { label: 'PA (Nylon)', value: 'pa-nylon' },
        { label: 'PC', value: 'pc' },
        { label: 'HIPS', value: 'hips' },
        { label: 'PVA Support', value: 'pva-support' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'subtype',
      type: 'text',
    },
    {
      name: 'modifiers',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Carbon Fiber', value: 'carbon-fiber' },
        { label: 'Glass Fiber', value: 'glass-fiber' },
        { label: 'Wood-filled', value: 'wood-filled' },
        { label: 'Metal-filled', value: 'metal-filled' },
        { label: 'Glow in the Dark', value: 'glow' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}

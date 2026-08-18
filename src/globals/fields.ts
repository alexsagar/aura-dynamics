import type { Field, GroupField } from 'payload'

/** Reusable CTA. Label + plain URL — no internal/external doc picker until the project needs one. */
export const linkFields: Field[] = [
  { name: 'label', type: 'text' },
  { name: 'url', type: 'text' },
]

export const linkGroup = (name: string, label: string): GroupField => ({
  name,
  type: 'group',
  label,
  fields: [{ type: 'row', fields: linkFields }],
})

/** Section on/off switch. Only used on sections that are genuinely optional. */
export const enabledField: Field = {
  name: 'enabled',
  type: 'checkbox',
  defaultValue: true,
}

export const imageField = (name = 'image'): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
})

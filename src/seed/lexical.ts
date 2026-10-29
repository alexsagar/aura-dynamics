// ---------------------------------------------------------------------------
// Minimal Lexical rich-text builders. Payload stores richText as a Lexical
// editor state; these produce the node shapes the editor and the storefront
// RichText renderer expect, so seeded copy renders identically to copy
// authored in Admin.
// ---------------------------------------------------------------------------
type Inline = string | ReturnType<typeof txt>

/** Text node. `format` is the Lexical bitmask (1 = bold, 2 = italic). */
export const txt = (text: string, format = 0) => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})
export const bold = (text: string) => txt(text, 1)

const inline = (parts: Inline[]) => parts.map((p) => (typeof p === 'string' ? txt(p) : p))

export const paragraph = (...parts: Inline[]) => ({
  type: 'paragraph',
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  textFormat: 0,
  children: inline(parts),
})
export const heading = (text: string, tag: 'h2' | 'h3' = 'h3') => ({
  type: 'heading',
  tag,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  children: [txt(text)],
})
export const bulletList = (items: string[]) => ({
  type: 'list',
  listType: 'bullet' as const,
  tag: 'ul' as const,
  start: 1,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  children: items.map((text, i) => ({
    type: 'listitem',
    value: i + 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: [txt(text)],
  })),
})
export const richText = (
  nodes: Array<ReturnType<typeof paragraph> | ReturnType<typeof heading> | ReturnType<typeof bulletList>>,
) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: nodes,
  },
})

import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Product, SiteSetting } from '@/payload-types'
import { Container } from '@/components/storefront/layout/Container'
import { formatNPR } from '@/components/storefront/commerce/Price'

// Lower product-page sections. Every section renders only from real stored
// data and hides itself when there is nothing trustworthy to show.

const SECTION = 'border-t border-black/10 py-16 lg:py-24'
const EYEBROW = 'mb-4 text-sm font-semibold tracking-[0.1em] text-muted uppercase'
const HEADING = 'text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-medium tracking-[-0.03em]'

const isRichText = (v: unknown): v is { root: { children?: unknown[] } } =>
  typeof v === 'object' && v !== null && 'root' in v

const label = (v: string) => v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, ' ')

export function AboutProduct({ product }: { product: Product }) {
  const d = product.description as unknown
  if (!isRichText(d) || !d.root.children?.length) return null
  return (
    <section className={`${SECTION} bg-white`} data-testid="product-description-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-24">
          <div>
            <p className={EYEBROW}>About</p>
            <h2 className={HEADING}>{product.title}</h2>
          </div>
          <div className="max-w-[680px] text-lg leading-[1.7] text-muted [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-5 [&_ul]:mt-3">
            <RichText data={d as never} disableContainer />
          </div>
        </div>
      </Container>
    </section>
  )
}

export function KeyFeatures({ product }: { product: Product }) {
  const items = (product.keyFeatures ?? []).filter((f) => f.title)
  if (!items.length) return null
  return (
    <section className={`${SECTION} bg-background`} data-testid="product-features-section">
      <Container>
        <p className={EYEBROW}>Key Features</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((f, i) => (
            <div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white p-6 md:p-8" key={f.id ?? i}>
              <span className="text-sm font-light text-primary">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-xl font-medium tracking-[-0.02em]">{f.title}</h3>
              {f.description ? <p className="leading-[1.6] text-muted">{f.description}</p> : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Structured spec rows: Filament Details / variant data first, then editor-added extras. */
export function specRows(product: Product): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = []
  const add = (l: string, v: string | null | undefined) => v && rows.push({ label: l, value: v })
  if (product.productType === 'filament') {
    const fd = product.filamentDetails
    add('Brand', fd?.brand)
    add('Material', fd?.material && typeof fd.material === 'object' ? fd.material.name : null)
    add('Diameter', fd?.diameter != null ? `${fd.diameter} mm` : null)
    add('Net Weight', fd?.netWeightKg != null ? `${fd.netWeightKg} kg` : null)
    add('Finish', fd?.finish ? label(fd.finish) : null)
  } else {
    add('Category', product.category && typeof product.category === 'object' ? product.category.name : null)
    const materials = new Set<string>()
    for (const v of product.variants?.docs ?? []) {
      if (!v || typeof v !== 'object' || v.active === false) continue
      for (const o of v.options ?? []) if (o && typeof o === 'object' && o.label) materials.add(o.label)
    }
    add('Available In', [...materials].join(', '))
  }
  for (const s of product.specifications ?? []) add(s.label, s.value)
  return rows
}

export function ProductSpecs({ product }: { product: Product }) {
  const rows = specRows(product)
  if (!rows.length) return null
  return (
    <section className={`${SECTION} bg-white`} data-testid="product-specs-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-24">
          <div>
            <p className={EYEBROW}>Specifications</p>
            <h2 className={HEADING}>The details.</h2>
          </div>
          <dl className="grid grid-cols-1 border-t border-black/10 sm:grid-cols-2 sm:gap-x-10">
            {rows.map((r) => (
              <div className="flex items-baseline justify-between gap-6 border-b border-black/10 py-5" key={r.label}>
                <dt className="text-muted">{r.label}</dt>
                <dd className="text-right font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}

/** Compact store-wide delivery/payment facts from Site Settings (never stored per product). */
export function DeliveryInfo({ settings }: { settings: SiteSetting | null }) {
  const ship = settings?.shippingSettings
  const items = [
    {
      title: 'Delivery across Nepal',
      body:
        typeof ship?.shippingFee === 'number'
          ? `Standard delivery ${formatNPR(ship.shippingFee)}${
              ship.freeShippingEnabled && typeof ship.freeShippingThreshold === 'number'
                ? ` · free on orders over ${formatNPR(ship.freeShippingThreshold)}`
                : ''
            }.`
          : 'Orders ship across Nepal.',
    },
    { title: 'Pay your way', body: 'eSewa QR or Cash on Delivery.' },
    { title: 'Guest checkout', body: 'No account needed to order.' },
  ]
  return (
    <section className={`${SECTION} bg-background`} data-testid="product-delivery-section">
      <Container>
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((i) => (
            <div className="border-l-2 border-lime pl-5" key={i.title}>
              <h3 className="font-medium">{i.title}</h3>
              <p className="mt-1 text-sm leading-[1.6] text-muted">{i.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

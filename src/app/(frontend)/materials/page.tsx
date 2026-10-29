import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'
import { mediaAlt, mediaUrl } from '@/lib/payload-media'
import { getPageContent, pageMetadata } from '@/lib/site/get-page-content'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('materials')
}

const SECTION_TITLE = 'text-mega leading-none font-semibold tracking-[-0.04em]'

const Dots = ({ score }: { score: number }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <div className={cn('size-2 rounded-full', i <= score ? 'bg-black' : 'bg-[#e5e5e5]')} key={i} />
    ))}
  </div>
)

type Cta = { label?: string | null; url?: string | null } | null | undefined

/** CMS CTA: a link when a URL is set, otherwise the label-only button the design shows. */
const CtaButton = ({ cta, variant }: { cta: Cta; variant: 'primary' | 'secondary' | 'accent' }) =>
  !cta?.label ? null : cta.url ? (
    <Button as="a" href={cta.url} size="lg" variant={variant}>
      {cta.label}
    </Button>
  ) : (
    <Button size="lg" variant={variant}>
      {cta.label}
    </Button>
  )

/* eslint-disable @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */
export default async function MaterialsPage() {
  const c = await getPageContent('materials')
  const matrix = c.matrix ?? {}
  const quality = c.quality ?? {}
  const cta = c.cta ?? {}
  return (
    <>
      {/* 1. Technical Hero */}
      <section className="relative flex min-h-[85vh] items-center bg-[#f4f4f4] pt-[15vh]">
        <Container className="w-full">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="flex flex-col items-start">
              <div className="mb-6 inline-flex items-center rounded-full border border-black/10 px-4 py-1.5 text-sm font-semibold tracking-[0.1em] uppercase">
                {c.eyebrow}
              </div>
              <h1 className="mb-8 text-[clamp(3rem,7vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.04em]">
                {c.heading}
              </h1>
              <p className="mb-10 max-w-[500px] text-lg leading-[1.6] text-muted">
                {c.intro}
              </p>
              <div className="flex flex-wrap gap-4">
                <CtaButton cta={c.primaryCta} variant="primary" />
                <CtaButton cta={c.secondaryCta} variant="secondary" />
              </div>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-black">
              <img
                alt={mediaAlt(c.heroImage, '')}
                className="size-full object-cover opacity-80 mix-blend-luminosity"
                src={mediaUrl(c.heroImage)}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 2. "At a Glance" Interactive Matrix */}
      <section className="border-t border-black/10 bg-white py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-black/10 pb-6 md:flex-row md:items-end">
            <h2 className={SECTION_TITLE}>{matrix.heading}</h2>
            <p className="text-xl text-muted">{matrix.subheading}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-black/20 text-sm font-medium tracking-[0.1em] text-muted uppercase">
                  <th className="pb-4 font-semibold">Polymer</th>
                  <th className="pb-4 font-semibold">Tensile Strength</th>
                  <th className="pb-4 font-semibold">Flexibility</th>
                  <th className="pb-4 font-semibold">Heat Resistance</th>
                  <th className="pb-4 font-semibold">Ease of Print</th>
                </tr>
              </thead>
              <tbody className="text-lg font-medium">
                {(matrix.rows ?? []).map((row) => (
                  <tr className="group border-b border-black/10 transition-colors hover:bg-[#f4f4f4]" key={row.id}>
                    <td className="py-6 pr-4 group-hover:pl-4 transition-all">{row.material}</td>
                    <td className="py-6 pr-4"><Dots score={row.strength ?? 0} /></td>
                    <td className="py-6 pr-4"><Dots score={row.flex ?? 0} /></td>
                    <td className="py-6 pr-4"><Dots score={row.heat ?? 0} /></td>
                    <td className="py-6 pr-4"><Dots score={row.ease ?? 0} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* 3. Deep Dives — alternating image/text rows */}
      <section className="bg-black py-[clamp(80px,15vw,160px)] text-white">
        <Container>
          <div className="grid gap-24 md:grid-cols-2 md:items-center">
            {(c.deepDives ?? []).map((d, i) => {
              const flip = i % 2 === 1
              return (
                <React.Fragment key={d.id}>
                  {!flip ? <DiveImage alt={mediaAlt(d.image, '')} src={mediaUrl(d.image)} watermark={d.watermark} /> : null}
                  <div className={cn('flex flex-col items-start', flip && 'order-2 md:order-1')}>
                    <h2 className="mb-4 text-sm font-semibold tracking-[0.1em] text-lime uppercase">
                      {d.eyebrow}
                    </h2>
                    <h3 className="mb-6 text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                      {d.heading}
                    </h3>
                    <p className="mb-8 text-lg leading-[1.6] text-white/70">{d.body}</p>
                    <ul className="mb-10 space-y-4 font-medium text-white/90 border-l border-white/20 pl-6">
                      {(d.points ?? []).map((p) => (
                        <li key={p.id}>{p.text}</li>
                      ))}
                    </ul>
                    <CtaButton cta={d.cta} variant="accent" />
                  </div>
                  {flip ? (
                    <DiveImage
                      alt={mediaAlt(d.image, '')}
                      className="order-1 md:order-2"
                      src={mediaUrl(d.image)}
                      watermark={d.watermark}
                    />
                  ) : null}
                </React.Fragment>
              )
            })}
          </div>
        </Container>
      </section>

      {/* 4. Quality Assurance */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background py-[10vh]">
        <div className="absolute inset-0 z-0">
          <img
            alt={mediaAlt(quality.image, '')}
            className="size-full object-cover mix-blend-multiply opacity-20"
            src={mediaUrl(quality.image)}
          />
        </div>
        <Container className="relative z-10 w-full">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-8 text-[clamp(3rem,6vw,5rem)] leading-[1] font-medium tracking-[-0.03em]">
              {quality.heading}
            </h2>
            {quality.body ? (
              <div className="text-xl leading-[1.6] text-muted">
                <RichText data={quality.body} disableContainer />
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {/* 5. Knowledge Base CTAs */}
      <section className="border-t border-black/10 py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="grid gap-12 md:grid-cols-2">
            <div className="flex flex-col items-start justify-center">
              <h2 className="mb-6 text-4xl font-medium tracking-[-0.02em]">{cta.heading}</h2>
              <p className="mb-8 text-lg text-muted">{cta.body}</p>
              <CtaButton cta={cta.button} variant="primary" />
            </div>
            <Link className="group relative aspect-video overflow-hidden rounded-3xl bg-[#f4f4f4]" href={cta.cardUrl || '#'}>
              <img alt={mediaAlt(cta.image, '')} className="size-full object-cover transition-transform duration-1000 group-hover:scale-105" src={mediaUrl(cta.image)} />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <h3 className="text-2xl font-medium">{cta.cardTitle} &rarr;</h3>
              </div>
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}

function DiveImage({
  alt,
  className,
  src,
  watermark,
}: {
  alt: string
  className?: string
  src?: string
  watermark?: string | null
}) {
  return (
    <div className={cn('relative aspect-[4/5] w-full overflow-hidden rounded-[32px] bg-[#111]', className)}>
      <img alt={alt} className="size-full object-cover opacity-60" src={src} />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <span className="text-[12rem] font-extrabold text-white/5 tracking-tighter">{watermark}</span>
      </div>
    </div>
  )
}

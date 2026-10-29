import React from 'react'
import type { Metadata } from 'next'

import { Container } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'
import { mediaAlt, mediaUrl } from '@/lib/payload-media'
import { getPageContent, pageMetadata } from '@/lib/site/get-page-content'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('about')
}

const SECTION_TITLE = 'text-mega leading-none font-semibold tracking-[-0.04em]'

/* eslint-disable @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */
export default async function AboutPage() {
  const c = await getPageContent('about')
  const mission = c.mission ?? {}
  const studio = c.studio ?? {}
  const local = c.local ?? {}
  const contact = c.contact ?? {}
  return (
    <>
      {/* 1. Manifesto Hero */}
      <section className="relative flex min-h-[90vh] items-end overflow-hidden bg-black py-[10vh]">
        <div className="absolute inset-0 z-0">
          <img
            alt={mediaAlt(c.heroImage, '')}
            className="size-full object-cover opacity-50 mix-blend-luminosity"
            src={mediaUrl(c.heroImage)}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
        </div>
        <Container className="relative z-10 w-full">
          <div className="max-w-[800px] text-white">
            <h1 className="mb-8 text-[clamp(4rem,8vw,8rem)] leading-[0.9] font-extrabold tracking-[-0.04em]">
              {c.headingLine1} <br />
              {c.headingLine2}
            </h1>
            <p className="text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.6] text-white/80">
              {c.intro}
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Origin Story / Mission */}
      <section className="bg-background py-[clamp(80px,15vw,160px)]">
        <Container>
          <div className="grid gap-12 md:grid-cols-[1fr_1.5fr] md:gap-24">
            <div>
              <div className="sticky top-32">
                <h2 className="mb-4 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  {mission.eyebrow}
                </h2>
                <h3 className="text-4xl font-medium leading-[1.1] tracking-[-0.03em]">
                  {mission.heading}
                </h3>
              </div>
            </div>
            <div className="flex flex-col gap-8 text-lg leading-[1.6] text-muted">
              {(mission.paragraphs ?? []).map((p) => (
                <p key={p.id}>{p.text}</p>
              ))}
              <div className="my-8 aspect-video w-full overflow-hidden rounded-[32px] bg-black">
                <img alt={mediaAlt(mission.image, '')} className="size-full object-cover mix-blend-luminosity opacity-80" src={mediaUrl(mission.image)} />
              </div>
              <p>{mission.closing}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. The Factory / Behind the Scenes */}
      <section className="bg-deep-forest py-[clamp(80px,10vw,160px)] text-white">
        <Container>
          <div className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-white/20 pb-6 md:flex-row md:items-end">
            <h2 className={SECTION_TITLE}>{studio.heading}</h2>
            <p className="text-xl text-white/60">{studio.subheading}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="aspect-square overflow-hidden rounded-[32px] bg-black md:aspect-[4/5]">
              <img alt={mediaAlt(studio.imageLarge, '')} className="size-full object-cover mix-blend-luminosity opacity-80" src={mediaUrl(studio.imageLarge)} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="aspect-video overflow-hidden rounded-[32px] bg-black md:aspect-[4/3]">
                <img alt={mediaAlt(studio.imageTop, '')} className="size-full object-cover mix-blend-luminosity opacity-80" src={mediaUrl(studio.imageTop)} />
              </div>
              <div className="aspect-square overflow-hidden rounded-[32px] bg-black md:aspect-auto md:flex-1">
                <img alt={mediaAlt(studio.imageBottom, '')} className="size-full object-cover mix-blend-luminosity opacity-80" src={mediaUrl(studio.imageBottom)} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Made in Nepal */}
      <section className="border-b border-black/10 py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 flex size-32 items-center justify-center rounded-full bg-lime text-black">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinejoin="round" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] font-medium tracking-[-0.03em]">
              {local.heading}
            </h2>
            <p className="max-w-[600px] text-lg leading-[1.6] text-muted">
              {local.body}
            </p>
          </div>
        </Container>
      </section>

      {/* 5. Team / Contact */}
      <section className="bg-white py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className={SECTION_TITLE}>{contact.heading}</h2>
              <p className="mt-6 max-w-[400px] text-lg text-muted">
                {contact.body}
              </p>
            </div>
            <div className="flex flex-col gap-12">
              <div>
                <h3 className="mb-2 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  {contact.locationLabel}
                </h3>
                <p className="text-2xl font-medium tracking-[-0.02em]">
                  {contact.location} <br />
                  <span className="text-muted">{contact.locationNote}</span>
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  {contact.contactLabel}
                </h3>
                <p className="text-2xl font-medium tracking-[-0.02em]">
                  {contact.email} <br />
                  {contact.phone}
                </p>
              </div>
              <div>
                <h3 className="mb-4 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  {contact.socialLabel}
                </h3>
                <div className="flex gap-4">
                  {(contact.socialLinks ?? []).map((s) =>
                    s.url ? (
                      <Button as="a" href={s.url} key={s.id} rel="noreferrer" target="_blank" variant="secondary">
                        {s.label}
                      </Button>
                    ) : (
                      <Button key={s.id} variant="secondary">
                        {s.label}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

import React from 'react'

import { Container, Section } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'

const P_HERO = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop'
const P_STORY = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop'
const P_FACTORY_1 = 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=800&auto=format&fit=crop'
const P_FACTORY_2 = 'https://images.unsplash.com/photo-1603984362497-0a878f607b92?q=80&w=800&auto=format&fit=crop'
const P_FACTORY_3 = 'https://images.unsplash.com/photo-1617478755490-e21232a5eeaf?q=80&w=1600&auto=format&fit=crop'

const SECTION_TITLE = 'text-mega leading-none font-semibold tracking-[-0.04em]'

export default function AboutPage() {
  return (
    <>
      {/* 1. Manifesto Hero */}
      <section className="relative flex min-h-[90vh] items-end overflow-hidden bg-black py-[10vh]">
        <div className="absolute inset-0 z-0">
          <img
            alt="Numakers Factory"
            className="size-full object-cover opacity-50 mix-blend-luminosity"
            src={P_HERO}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
        </div>
        <Container className="relative z-10 w-full">
          <div className="max-w-[800px] text-white">
            <h1 className="mb-8 text-[clamp(4rem,8vw,8rem)] leading-[0.9] font-extrabold tracking-[-0.04em]">
              We build <br />
              the builders.
            </h1>
            <p className="text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.6] text-white/80">
              Aura is the premier 3D printing ecosystem in Nepal. We don't just supply filament; we provide the foundation for innovation, rapid prototyping, and digital manufacturing.
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
                  Our Mission
                </h2>
                <h3 className="text-4xl font-medium leading-[1.1] tracking-[-0.03em]">
                  Empowering the creators of tomorrow.
                </h3>
              </div>
            </div>
            <div className="flex flex-col gap-8 text-lg leading-[1.6] text-muted">
              <p>
                The 3D printing landscape in Nepal used to be fragmented. Makers relied on expensive imports, inconsistent filament quality, and weeks of shipping delays just to get basic materials. Prototyping was a luxury.
              </p>
              <p>
                We started Aura to fix that. By bringing Numakers' high-performance polymers directly to the local market and maintaining a massive ready-stock inventory, we eliminated the friction of creation.
              </p>
              <div className="my-8 aspect-video w-full overflow-hidden rounded-[32px] bg-black">
                <img alt="The beginning" className="size-full object-cover mix-blend-luminosity opacity-80" src={P_STORY} />
              </div>
              <p>
                Today, Aura is the trusted supplier for architectural firms, engineering students, cosplay artists, and functional design studios across the country. If you can dream it, we provide the material to make it real.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. The Factory / Behind the Scenes */}
      <section className="bg-deep-forest py-[clamp(80px,10vw,160px)] text-white">
        <Container>
          <div className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-white/20 pb-6 md:flex-row md:items-end">
            <h2 className={SECTION_TITLE}>The Studio.</h2>
            <p className="text-xl text-white/60">Where digital models become physical reality.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="aspect-square overflow-hidden rounded-[32px] bg-black md:aspect-[4/5]">
              <img alt="Print farm" className="size-full object-cover mix-blend-luminosity opacity-80" src={P_FACTORY_1} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="aspect-video overflow-hidden rounded-[32px] bg-black md:aspect-[4/3]">
                <img alt="Extrusion" className="size-full object-cover mix-blend-luminosity opacity-80" src={P_FACTORY_2} />
              </div>
              <div className="aspect-square overflow-hidden rounded-[32px] bg-black md:aspect-auto md:flex-1">
                <img alt="Finished Print" className="size-full object-cover mix-blend-luminosity opacity-80" src={P_FACTORY_3} />
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
              Designed & Printed in Nepal.
            </h2>
            <p className="max-w-[600px] text-lg leading-[1.6] text-muted">
              We are proud to operate locally. By supporting Aura, you are supporting a local ecosystem of designers, engineers, and makers who are pushing the boundaries of what's possible in the Himalayas.
            </p>
          </div>
        </Container>
      </section>

      {/* 5. Team / Contact */}
      <section className="bg-white py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className={SECTION_TITLE}>Get in touch.</h2>
              <p className="mt-6 max-w-[400px] text-lg text-muted">
                Whether you need a custom print quote, wholesale filament pricing, or just want to talk shop, we're here for you.
              </p>
            </div>
            <div className="flex flex-col gap-12">
              <div>
                <h3 className="mb-2 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  Studio Location
                </h3>
                <p className="text-2xl font-medium tracking-[-0.02em]">
                  Kathmandu, Nepal <br />
                  <span className="text-muted">(Visits by appointment only)</span>
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  Contact
                </h3>
                <p className="text-2xl font-medium tracking-[-0.02em]">
                  hello@aura.com.np <br />
                  +977 980-0000000
                </p>
              </div>
              <div>
                <h3 className="mb-4 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  Social
                </h3>
                <div className="flex gap-4">
                  <Button variant="secondary">Instagram</Button>
                  <Button variant="secondary">Facebook</Button>
                  <Button variant="secondary">TikTok</Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

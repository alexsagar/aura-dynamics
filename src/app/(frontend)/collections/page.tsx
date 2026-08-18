import Link from 'next/link'
import React from 'react'

import { Container, Section } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'

const P_HERO_1 = 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=800&auto=format&fit=crop'
const P_HERO_2 = 'https://images.unsplash.com/photo-1603984362497-0a878f607b92?q=80&w=800&auto=format&fit=crop'
const P_HERO_3 = 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop'

const P_THEME_1 = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop'
const P_THEME_2 = 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?q=80&w=1200&auto=format&fit=crop'

const P_FEATURED = 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1600&auto=format&fit=crop'

const SECTION_TITLE = 'text-mega leading-none font-semibold tracking-[-0.04em]'

const CATEGORIES = [
  { count: 24, name: 'The Desk Setup', subtitle: 'Organizers, stands, and mounts.' },
  { count: 18, name: 'Cosplay Armory', subtitle: 'Helmets, props, and armor pieces.' },
  { count: 32, name: 'Tabletop Vault', subtitle: 'Dice towers, miniatures, and terrain.' },
  { count: 12, name: 'Mechanical & Drone', subtitle: 'High-stress structural components.' },
  { count: 45, name: 'Art & Sculpture', subtitle: 'Statement pieces for the home.' },
]

export default function CollectionsPage() {
  return (
    <>
      {/* 1. Lookbook Hero */}
      <section className="relative flex min-h-[90vh] items-center bg-[#f4f4f4] pt-[15vh]">
        <Container className="grid gap-12 md:grid-cols-2 md:gap-24">
          <div className="flex flex-col items-start justify-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-black/10 px-4 py-1.5 text-sm font-semibold tracking-[0.1em] text-black uppercase">
              The Lookbook
            </div>
            <h1 className="mb-8 text-[clamp(3.5rem,6vw,6rem)] leading-[0.9] font-extrabold tracking-[-0.04em]">
              Curated <br />
              Editions.
            </h1>
            <p className="max-w-[400px] text-lg leading-[1.6] text-muted">
              Discover our exclusive collections of 3D prints, curated by theme, aesthetic, and functional use.
            </p>
          </div>
          <div className="relative h-[60vh] w-full overflow-hidden rounded-[32px]">
            {/* Auto-scrolling collage simulation */}
            <div className="absolute inset-0 grid grid-cols-2 gap-4 animate-slow-pan">
              <div className="flex flex-col gap-4 -translate-y-20">
                <img alt="Gallery 1" className="w-full rounded-2xl object-cover aspect-[4/5]" src={P_HERO_1} />
                <img alt="Gallery 2" className="w-full rounded-2xl object-cover aspect-square" src={P_HERO_2} />
              </div>
              <div className="flex flex-col gap-4 translate-y-10">
                <img alt="Gallery 3" className="w-full rounded-2xl object-cover aspect-square" src={P_HERO_3} />
                <img alt="Gallery 4" className="w-full rounded-2xl object-cover aspect-[4/5]" src={P_HERO_1} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Curated Themes */}
      <section className="bg-black py-[clamp(80px,10vw,160px)] text-white">
        <Container>
          <div className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-white/20 pb-6 md:flex-row md:items-end">
            <h2 className={SECTION_TITLE}>Vibes.</h2>
            <p className="text-xl text-white/60">Aesthetic-first collections.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <Link className="group relative aspect-square overflow-hidden rounded-[32px] md:aspect-[4/5]" href="/collections/minimal">
              <img alt="Minimalist Desk" className="size-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-105" src={P_THEME_1} />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                <h3 className="mb-2 text-4xl font-medium tracking-[-0.02em]">The Desk Setup</h3>
                <p className="text-lg text-white/70">Minimalist geometric organizers and stands.</p>
              </div>
            </Link>
            <Link className="group relative aspect-square overflow-hidden rounded-[32px] md:aspect-[4/5] md:mt-24" href="/collections/industrial">
              <img alt="Industrial Parts" className="size-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-105" src={P_THEME_2} />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                <h3 className="mb-2 text-4xl font-medium tracking-[-0.02em]">Raw & Industrial</h3>
                <p className="text-lg text-white/70">Exposed infill, mechanical aesthetics, and carbon-fiber blends.</p>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* 3. Category List (Hover effect) */}
      <section className="bg-background py-[clamp(80px,10vw,160px)]">
        <Container>
          <h2 className="mb-12 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
            Complete Index
          </h2>
          <div className="group/list flex flex-col border-t border-black/10">
            {CATEGORIES.map((cat, i) => (
              <Link
                className="group flex flex-col items-start border-b border-black/10 py-8 transition-colors hover:bg-black hover:px-8 md:flex-row md:items-center md:py-12"
                href={`/collections/${cat.name.toLowerCase().replace(/ /g, '-')}`}
                key={i}
              >
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold tracking-[0.1em] text-muted group-hover:text-white/50">
                      0{i + 1}
                    </span>
                    <h3 className="text-3xl font-medium tracking-[-0.02em] group-hover:text-white md:text-5xl">
                      {cat.name}
                    </h3>
                  </div>
                  <p className="mt-2 text-lg text-muted group-hover:text-white/70 md:ml-10">
                    {cat.subtitle}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-4 md:mt-0">
                  <span className="rounded-full bg-[#f4f4f4] px-4 py-1 text-sm font-medium group-hover:bg-white/20 group-hover:text-white">
                    {cat.count} items
                  </span>
                  <div className="hidden text-3xl font-extralight text-muted group-hover:text-lime md:block">
                    &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Featured Collection */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-deep-forest py-[10vh]">
        <div className="absolute inset-0 z-0">
          <img
            alt="Geometry Collection"
            className="size-full object-cover opacity-30 mix-blend-luminosity"
            src={P_FEATURED}
          />
          <div className="absolute inset-0 bg-linear-to-r from-deep-forest via-deep-forest/80 to-transparent" />
        </div>
        <Container className="relative z-10 w-full">
          <div className="max-w-[600px] text-white">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold tracking-[0.1em] text-lime uppercase backdrop-blur-[12px]">
              Latest Drop
            </div>
            <h2 className="mb-6 text-[clamp(3rem,5vw,5rem)] leading-[0.9] font-extrabold tracking-[-0.04em]">
              The Geometry Collection.
            </h2>
            <p className="mb-10 text-xl leading-[1.6] text-white/70">
              A study in brutalist shapes and mathematical precision. Printed exclusively in our Matte Black PLA+ for an architectural, zero-glare finish.
            </p>
            <Button size="lg" variant="accent">
              Explore the Drop
            </Button>
          </div>
        </Container>
      </section>

      {/* 5. Drop Alerts */}
      <section className="bg-[#f4f4f4] py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="flex flex-col items-center text-center">
            <h2 className="mb-4 text-4xl font-medium tracking-[-0.02em]">Never miss a drop.</h2>
            <p className="mb-10 max-w-[500px] text-lg text-muted">
              Our featured collections are printed in limited batches. Sign up to get notified when new physical prints are ready to ship.
            </p>
            <form className="flex w-full max-w-[400px] gap-2">
              <input
                className="flex-1 rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black"
                placeholder="Email address"
                type="email"
              />
              <Button size="md" variant="primary">
                Subscribe
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </>
  )
}

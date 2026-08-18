import Link from 'next/link'
import React from 'react'

import { demoPrint } from '@/data/storefront-demo'
import { Container, Section } from '@/components/storefront/layout/Container'
import { PrintCard } from '@/components/storefront/product/PrintCard'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'

const P_HERO = 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=1600&auto=format&fit=crop'
const P_MINI = 'https://images.unsplash.com/photo-1603984362497-0a878f607b92?q=80&w=800&auto=format&fit=crop'
const P_FUNCTIONAL = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800&auto=format&fit=crop'
const P_COSPLAY = 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop'
const P_ART = 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=800&auto=format&fit=crop'
const P_ARTIST = 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?q=80&w=1200&auto=format&fit=crop'
const P_GALLERY_1 = 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=800&auto=format&fit=crop'

const SECTION_TITLE = 'text-mega leading-none font-semibold tracking-[-0.04em]'

const FAQS = [
  {
    a: 'All prints are carefully padded with high-density foam and shipped in crush-proof corrugated boxes to ensure they arrive in pristine condition.',
    q: 'How do you ship fragile prints safely?',
  },
  {
    a: 'Absolutely. We offer custom scaling, material choices, and color matching. Contact our studio to discuss your custom project.',
    q: 'Can I request a custom size or material?',
  },
  {
    a: 'In-stock prints ship within 24 hours. Made-to-order and custom pieces typically take 3-5 business days to print and process.',
    q: 'What is the turnaround time for on-demand prints?',
  },
  {
    a: 'Yes! If you have a specific STL or OBJ file, we provide a premium on-demand printing service. You upload the file, and we handle the slicing and printing.',
    q: 'Do you print custom user files?',
  },
]

export default function PrintsPage() {
  return (
    <>
      {/* 1. Exhibition Hero */}
      <section className="relative flex min-h-screen items-end justify-center overflow-hidden bg-black pb-[15vh]">
        <div className="absolute inset-0 z-0">
          <img
            alt="Intricate 3D Print Exhibition"
            className="size-full object-cover opacity-60 mix-blend-luminosity"
            src={P_HERO}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 flex max-w-4xl flex-col items-center text-center text-white px-6">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold tracking-[0.1em] uppercase backdrop-blur-[12px]">
            The Exhibition
          </div>
          <h1 className="mb-6 text-hero leading-[0.9] font-extrabold tracking-[-0.04em]">
            Digital meets physical.
          </h1>
          <p className="mb-10 max-w-[600px] text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.4] text-white/80">
            Curated, ready-to-ship 3D prints crafted with industrial-grade precision. From tabletop miniatures to robust mechanical assemblies.
          </p>
          <Button as="a" href="#gallery" size="lg" variant="accent">
            Enter the Gallery
          </Button>
        </div>
      </section>

      {/* 2. Category Bento Box */}
      <Section className="bg-background">
        <h2 className="mb-10 text-h2 font-semibold tracking-[-0.02em]">Browse the Collection.</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 md:h-[600px]">
          {/* Large Featured */}
          <Link
            className="group relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-3xl bg-[#f4f4f4]"
            href="/collections/functional"
          >
            <img
              alt="Functional Parts"
              className="size-full object-cover transition-transform duration-1000 ease-editorial group-hover:scale-105"
              src={P_FUNCTIONAL}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <h3 className="text-4xl font-medium tracking-[-0.02em]">Functional Parts</h3>
              <p className="mt-2 text-lg text-white/70">Engineered to withstand real-world stress.</p>
            </div>
          </Link>
          {/* Top Right */}
          <Link
            className="group relative overflow-hidden rounded-3xl bg-[#f4f4f4]"
            href="/collections/miniatures"
          >
            <img
              alt="Miniatures"
              className="size-full object-cover transition-transform duration-1000 ease-editorial group-hover:scale-105"
              src={P_MINI}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="text-2xl font-medium tracking-[-0.02em]">Tabletop Miniatures</h3>
            </div>
          </Link>
          {/* Bottom Right */}
          <Link
            className="group relative overflow-hidden rounded-3xl bg-[#f4f4f4]"
            href="/collections/art"
          >
            <img
              alt="Art & Decor"
              className="size-full object-cover transition-transform duration-1000 ease-editorial group-hover:scale-105"
              src={P_ART}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="text-2xl font-medium tracking-[-0.02em]">Art & Decor</h3>
            </div>
          </Link>
        </div>
      </Section>

      {/* 3. The "On Demand" Pitch */}
      <section className="border-y border-black/10 bg-[#f4f4f4] py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-24">
            <div>
              <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                Don't have a printer? We are your factory.
              </h2>
              <p className="mb-8 text-lg leading-[1.6] text-muted">
                3D printing is an amazing technology, but dealing with clogged nozzles, wet filament, and failed first layers isn't for everyone. Let our farm of perfectly tuned industrial machines do the heavy lifting while you enjoy the pristine end result.
              </p>
              <ul className="mb-10 space-y-4 border-l-2 border-black pl-6 text-lg font-medium">
                <li>Industrial grade precision (±0.03mm)</li>
                <li>Printed using premium Numakers polymers</li>
                <li>Zero post-processing required</li>
                <li>Shipped safely to your door</li>
              </ul>
              <Button size="lg" variant="primary">
                Request Custom Print
              </Button>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-full md:aspect-[4/5] md:rounded-[32px]">
              <img
                alt="3D Printer Farm"
                className="size-full object-cover mix-blend-multiply"
                src={P_COSPLAY}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Featured Artist Spotlight */}
      <section className="bg-deep-forest py-[clamp(80px,12vw,160px)] text-white">
        <Container>
          <div className="flex flex-col items-start md:flex-row md:items-stretch">
            <div className="w-full md:w-1/3">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl bg-black">
                <img
                  alt="Featured Artist"
                  className="size-full object-cover opacity-80"
                  src={P_ARTIST}
                />
              </div>
            </div>
            <div className="mt-10 flex w-full flex-col justify-center md:mt-0 md:w-2/3 md:pl-20">
              <div className="mb-4 text-sm font-semibold tracking-[0.1em] text-lime uppercase">
                Featured Designer
              </div>
              <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                Cinderwing3D
              </h2>
              <p className="mb-8 max-w-[500px] text-lg leading-[1.6] text-white/70">
                Known for incredibly detailed, print-in-place articulated dragons and fantasy creatures. We are fully licensed to print and sell physical versions of Cinderwing3D's stunning digital sculptures using our premium aesthetic filaments.
              </p>
              <div>
                <Button variant="accent">View Collection</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Curated Gallery Grid */}
      <Section id="gallery">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className={SECTION_TITLE}>The Gallery.</h2>
            <p className="mt-4 text-xl text-muted">Ready-to-ship physical prints.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">All</Button>
            <Button variant="tertiary">Functional</Button>
            <Button variant="tertiary">Art</Button>
          </div>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <PrintCard
              key={i}
              product={{
                ...demoPrint,
                imageUrl: i % 2 === 0 ? P_HERO : P_GALLERY_1,
                title: `Curated Print ${i}`,
              }}
              ratio="portrait"
            />
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <Button size="lg" variant="secondary">Load More Exhibitions</Button>
        </div>
      </Section>

      {/* 6. FAQ */}
      <section className="border-t border-black/10 py-[clamp(80px,12vw,160px)]">
        <Container>
          <div className="grid gap-16 md:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="text-[clamp(2.5rem,4vw,3rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                Questions?
              </h2>
              <p className="mt-4 text-lg text-muted">
                Everything you need to know about our ready-stock prints and custom services.
              </p>
            </div>
            <div className="flex flex-col border-t border-black/10">
              {FAQS.map((faq, i) => (
                <div className="border-b border-black/10 py-8" key={i}>
                  <h3 className="mb-4 text-2xl font-medium tracking-[-0.02em]">{faq.q}</h3>
                  <p className="text-lg leading-[1.6] text-muted">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

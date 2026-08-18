import Link from 'next/link'
import React from 'react'

import { demoFilament, demoPrint } from '@/data/storefront-demo'
import { Container, Section } from '@/components/storefront/layout/Container'
import { FilamentCard } from '@/components/storefront/product/FilamentCard'
import { PrintCard } from '@/components/storefront/product/PrintCard'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'
import { InteractiveShades } from '@/components/storefront/ui/InteractiveShades'
import { carouselItem, ScrollableCarousel } from '@/components/storefront/ui/ScrollableCarousel'
import { TestimonialCarousel } from '@/components/storefront/ui/TestimonialCarousel'
import { Velaris } from '@/components/storefront/ui/Velaris'

// Image Placeholders
const P_HERO = 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=1600&auto=format&fit=crop'
const P_FILAMENT = 'https://images.unsplash.com/photo-1617478755490-e21232a5eeaf?q=80&w=800&auto=format&fit=crop'
const P_PRINT = 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=800&auto=format&fit=crop'
const P_STORY = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1600&auto=format&fit=crop'
const P_GUIDE = 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=1200&auto=format&fit=crop'
const P_USECASE_1 = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800&auto=format&fit=crop'
const P_USECASE_2 = 'https://images.unsplash.com/photo-1603984362497-0a878f607b92?q=80&w=800&auto=format&fit=crop'
const P_USECASE_3 = 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop'
const P_SPOTLIGHT = 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1200&auto=format&fit=crop'

const SECTION_TITLE = 'text-mega leading-none font-semibold tracking-[-0.04em]'
const RULE_HEADER =
  'mb-16 flex flex-col justify-between gap-6 border-b border-black/10 pb-6 md:flex-row md:items-end'

const Dots = ({ score }: { score: number }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <div className={cn('size-2 rounded-full', i <= score ? 'bg-black' : 'bg-[#e5e5e5]')} key={i} />
    ))}
  </div>
)

const MATERIALS = [
  {
    desc: 'The undisputed standard. Easy to print, highly rigid, and perfect for rapid prototypes, architectural models, and display pieces.',
    href: '/materials/pla',
    name: 'PLA+',
  },
  {
    desc: 'Engineered for durability. Strong, flexible, and temperature resistant. The ideal choice for mechanical parts and outdoor use.',
    href: '/materials/petg',
    name: 'PETG',
  },
  {
    desc: 'Industrial strength. Unmatched impact resistance and heat deflection for demanding, high-stress engineering applications.',
    href: '/materials/abs',
    name: 'ABS',
  },
  {
    desc: 'Ultimate flexibility. A rubber-like polymer capable of extreme bending and compression without losing its shape.',
    href: '/materials/tpu',
    name: 'TPU',
  },
]

const USE_CASES = [
  { href: '/collections/functional', img: P_USECASE_1, sub: 'Strong engineering materials.', title: 'Functional Parts' },
  { href: '/collections/miniatures', img: P_USECASE_2, sub: 'High detail PLA+ resins.', title: 'Miniatures' },
  { href: '/collections/cosplay', img: P_USECASE_3, sub: 'Lightweight & easy to sand.', title: 'Cosplay Props' },
]

const CATEGORIES = [
  { href: '/filaments', img: P_FILAMENT, sub: 'High-performance polymers', title: 'Filaments' },
  { href: '/3d-prints', img: P_PRINT, sub: 'Ready to ship', title: '3D Prints' },
  { href: '/accessories', img: P_STORY, sub: 'Parts & Upgrades', title: 'Accessories' },
]

const FRESH = [
  { href: '/3d-prints/1', img: P_USECASE_1, price: 'NPR 3,500', title: 'Geometric Planter' },
  { href: '/3d-prints/2', img: P_PRINT, price: 'NPR 2,400', title: 'Desk Organizer' },
  { href: '/3d-prints/3', img: P_USECASE_3, price: 'NPR 8,500', title: 'Mech Keyboard Case' },
  { href: '/3d-prints/4', img: P_USECASE_2, price: 'NPR 4,500', title: 'Articulated Dragon' },
]

const GUIDES = [
  {
    href: '/guides/pla-vs-petg',
    img: P_GUIDE,
    meta: '01 // Material Guide',
    sub: 'A comprehensive guide to the two most popular FDM materials.',
    title: 'PLA vs PETG: Which should you choose?',
  },
  {
    href: '/guides/bed-adhesion',
    img: P_HERO,
    meta: '02 // Print Quality',
    sub: '5 expert tips to ensure your prints never warp or detach mid-print.',
    title: 'Mastering First Layer Adhesion',
  },
  {
    href: '/guides/support-structures',
    img: P_USECASE_1,
    meta: '03 // Advanced',
    sub: 'Learn how to optimize support generation for cleaner overhangs and faster post-processing.',
    title: 'Perfect Support Structures',
  },
]

const COMPARE_ROWS: Array<[string, number[]]> = [
  ['Strength', [4, 4, 2, 5]],
  ['Flexibility', [1, 3, 5, 1]],
  ['Durability', [3, 5, 5, 5]],
]

const WHY: Array<[string, string, string]> = [
  [
    '01',
    'Premium Quality',
    'Numakers filaments are precision extruded to ±0.03mm tolerance for perfectly jam-free printing.',
  ],
  [
    '02',
    'Always In Stock',
    'We maintain a massive local inventory. If you can add it to your cart, it is ready to ship.',
  ],
  [
    '03',
    'Next Day Delivery',
    'Shipped instantly across Nepal so your printing workflow is never unexpectedly interrupted.',
  ],
]

const ArrowRight = () => (
  <svg
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
  >
    <line x1="5" x2="19" y1="12" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

/* Spec-sheet cells: one plain grid, so the mobile layout can restack a row
   label above its values without a second markup tree. */
const CompareHead = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <div
    className={cn(
      'flex items-center border-b-2 border-black pr-2 pb-6 text-xl font-medium md:pr-4 md:pb-10 md:text-2xl',
      className,
    )}
  >
    {children}
  </div>
)

const CompareCell = ({ children, last }: { children: React.ReactNode; last?: boolean }) => (
  <div
    className={cn(
      'flex items-center py-4 pr-2 text-base md:py-8 md:pr-4 md:text-lg',
      last ? 'border-b-0' : 'border-b border-black/10',
    )}
  >
    {children}
  </div>
)

const CompareLabel = ({ children, last }: { children: React.ReactNode; last?: boolean }) => (
  <div
    className={cn(
      'col-span-full flex items-center pt-10 pr-2 pb-2 font-medium text-black md:col-span-1 md:py-8 md:pr-4 md:text-lg md:font-normal md:text-muted',
      last ? 'md:border-b-0' : 'md:border-b md:border-black/10',
    )}
  >
    {children}
  </div>
)

export default function HomePage() {
  return (
    <>
      {/* 1. VELARIS HERO (FULL VIEWPORT STRADDLE) */}
      <section className="relative mb-[clamp(100px,15vw,250px)] h-screen">
        <div className="absolute inset-0 z-0">
          <Velaris
            bg="#000000"
            className="pointer-events-none"
            colors={['#C5F955', '#4ade80', '#059669', '#000000']}
            height="100vh"
          />
        </div>

        <div className="absolute inset-0 z-1">
          <div className="flex h-full flex-col items-center justify-start px-6 pt-[20vh]">
            <h1 className="mb-6 text-center text-hero leading-[0.9] font-extrabold tracking-[-0.04em] text-white">
              Form meets function.
            </h1>
            <p className="max-w-[800px] text-center text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.4] text-white/80">
              High-performance polymers and ready-stock 3D prints. Engineered perfectly for makers
              across Nepal.
            </p>
          </div>

          {/* the image straddles the section edge, half of it in the next section */}
          <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
            <Container>
              <div className="group relative aspect-4/5 w-full overflow-hidden rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] md:aspect-[16/7] md:rounded-[32px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder photography */}
                <img
                  alt="Filament spools in a printing workspace"
                  className="size-full object-cover transition-transform duration-2000 ease-editorial group-hover:scale-105"
                  src={P_HERO}
                />
                <div className="absolute inset-0 flex flex-col items-end justify-end gap-4 bg-linear-to-t from-black/70 to-transparent to-60% p-6 md:flex-row md:justify-center md:p-12">
                  <Button as="a" block className="md:w-auto" href="/filaments" size="lg">
                    Shop Now
                  </Button>
                  <Button as="a" block className="md:w-auto" href="/3d-prints" size="lg" variant="on-dark">
                    Explore Filaments
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </section>

      {/* 2. SHOP CATEGORIES */}
      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <a className="group flex flex-col items-center gap-3 text-center" href={c.href} key={c.href}>
              <div className="mb-2 aspect-3/2 w-full overflow-hidden rounded-3xl bg-[#f4f4f4] md:aspect-4/5 md:rounded-[32px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder photography */}
                <img
                  alt={c.title}
                  className="size-full object-cover transition-transform duration-1200 ease-editorial group-hover:scale-105"
                  src={c.img}
                />
              </div>
              <h3 className="text-2xl font-medium tracking-[-0.02em]">{c.title}</h3>
              <p className="text-muted">{c.sub}</p>
            </a>
          ))}
        </div>
      </Section>

      {/* 3. POPULAR PRODUCTS */}
      <section className="py-[clamp(64px,10vw,120px)]">
        <Container>
          <div className={RULE_HEADER}>
            <h2 className={SECTION_TITLE}>Popular.</h2>
            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 md:gap-8 md:pb-0">
              <span className="cursor-pointer text-lg font-medium text-black">All</span>
              <span className="cursor-pointer text-lg font-medium text-muted transition-colors hover:text-black">
                Filaments
              </span>
              <span className="cursor-pointer text-lg font-medium text-muted transition-colors hover:text-black">
                3D Prints
              </span>
            </div>
          </div>
        </Container>

        <ScrollableCarousel>
          <div className={carouselItem}>
            <FilamentCard product={{ ...demoFilament, imageUrl: P_FILAMENT }} ratio="portrait" />
          </div>
          <div className={carouselItem}>
            <PrintCard
              product={{ ...demoPrint, imageUrl: P_PRINT, title: 'Desk Organizer' }}
              ratio="portrait"
            />
          </div>
          <div className={carouselItem}>
            <FilamentCard
              product={{ ...demoFilament, imageUrl: P_FILAMENT, price: 2500, title: 'Numakers PETG' }}
              ratio="portrait"
            />
          </div>
          <div className={carouselItem}>
            <PrintCard
              product={{
                ...demoPrint,
                imageUrl: P_PRINT,
                materials: ['PLA', 'PETG'],
                title: 'Articulated Dragon',
              }}
              ratio="portrait"
            />
          </div>
          <div className={carouselItem}>
            <FilamentCard
              product={{ ...demoFilament, imageUrl: P_FILAMENT, price: 2300, title: 'Matte Black PLA+' }}
              ratio="portrait"
            />
          </div>
        </ScrollableCarousel>
      </section>

      {/* 4. EXPLORE BY MATERIAL */}
      <div className="bg-deep-forest py-[clamp(64px,10vw,120px)] text-white">
        <Container>
          <h2 className="text-base">Explore by Material</h2>
          <div className="mt-8 flex flex-col border-t border-white/10 md:mt-12">
            {MATERIALS.map((m) => (
              <Link
                className="group flex flex-col items-start overflow-hidden border-b border-white/10 py-8 transition-[padding-left] duration-400 ease-editorial md:flex-row md:items-center md:justify-between md:py-10 md:hover:pl-10"
                href={m.href}
                key={m.href}
              >
                <div className="text-stroke leading-[0.9] font-extrabold tracking-[-0.04em] text-white transition-colors group-hover:text-lime md:text-transparent md:[-webkit-text-stroke:1px_rgba(255,255,255,0.3)] md:group-hover:[-webkit-text-stroke:1px_#c5f955]">
                  {m.name}
                </div>
                <div className="mt-4 max-w-[400px] flex-1 text-lg leading-[1.5] text-white/60 transition duration-400 md:mt-0 md:ml-20 md:-translate-x-5 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
                  {m.desc}
                </div>
                <div className="hidden -translate-x-5 text-5xl font-extralight text-white/30 opacity-0 transition duration-400 group-hover:translate-x-0 group-hover:text-lime group-hover:opacity-100 md:block">
                  &rarr;
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </div>

      {/* 5. WHAT ARE YOU PRINTING? */}
      <Section>
        <h2 className="mb-10 text-h2 font-semibold tracking-[-0.02em]">What are you printing?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {USE_CASES.map((u) => (
            <Link
              className="group relative aspect-4/5 cursor-crosshair overflow-hidden rounded-3xl"
              href={u.href}
              key={u.href}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder photography */}
              <img
                alt={u.title}
                className="size-full object-cover transition-transform duration-800 ease-editorial group-hover:scale-110"
                src={u.img}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent to-50%" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="mb-1 text-2xl">{u.title}</h3>
                <p className="text-white/70">{u.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* 6. FRESH FROM THE PRINTER */}
      <section className="py-[clamp(64px,10vw,120px)]">
        <Container>
          <div className={RULE_HEADER}>
            <h2 className={SECTION_TITLE}>Fresh Prints.</h2>
            <a className="text-lg font-medium hover:underline" href="/3d-prints">
              See all prints &rarr;
            </a>
          </div>
        </Container>

        <ScrollableCarousel>
          {FRESH.map((f) => (
            <a className={cn('group flex flex-col gap-4', carouselItem)} href={f.href} key={f.href}>
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#f4f4f4]">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder photography */}
                <img
                  alt={f.title}
                  className="size-full object-cover transition-transform duration-600 ease-editorial group-hover:scale-105"
                  src={f.img}
                />
              </div>
              <div className="flex items-baseline justify-between border-b border-black/10 pb-3 text-lg font-medium transition-colors group-hover:border-black/50">
                <span>{f.title}</span>
                <span>{f.price}</span>
              </div>
            </a>
          ))}
        </ScrollableCarousel>
      </section>

      {/* 7. STAFF PICK */}
      <section className="py-[clamp(80px,10vw,160px)]">
        <div className="group relative flex min-h-[70vh] items-end overflow-hidden bg-black py-[clamp(40px,8vw,100px)] min-[900px]:items-center">
          <div className="absolute inset-0 z-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder photography */}
            <img
              alt="Matte Black PLA"
              className="size-full object-cover opacity-50 mix-blend-luminosity transition duration-1200 ease-editorial group-hover:scale-105 group-hover:opacity-70"
              src={P_SPOTLIGHT}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 z-2 bg-linear-to-t from-black/90 via-black/50 via-60% to-transparent min-[900px]:bg-linear-to-r min-[900px]:via-black/30" />
          <Container className="relative z-3">
            <div className="flex max-w-[580px] flex-col items-start text-white">
              <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold tracking-[0.1em] uppercase backdrop-blur-[12px]">
                Staff Pick
              </div>
              <h2 className="mb-6 text-mega leading-[1.1] font-medium tracking-[-0.04em]">
                Matte Black PLA+
              </h2>
              <p className="mb-8 text-[clamp(1.125rem,2vw,1.25rem)] leading-[1.6] text-white/70">
                Our best-selling filament. Achieves a flawless, zero-glare finish that hides layer
                lines perfectly. Ideal for photography props, architectural models, and sleek
                functional enclosures.
              </p>
              <Button size="lg">Shop Matte Black</Button>
            </div>
          </Container>
        </div>
      </section>

      {/* 8. MADE IN EVERY SHADE */}
      <section className="bg-background py-[clamp(80px,15vw,160px)]">
        <Container>
          <InteractiveShades />
        </Container>
      </section>

      {/* 9. MATERIAL COMPARISON */}
      <section className="py-[clamp(80px,10vw,160px)]">
        <Container>
          <h2 className={cn(SECTION_TITLE, 'mb-20')}>Compare.</h2>

          <div className="grid w-full grid-cols-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <CompareHead className="hidden md:flex" />
            <CompareHead>PLA+</CompareHead>
            <CompareHead>PETG</CompareHead>
            <CompareHead>TPU</CompareHead>
            <CompareHead>ABS</CompareHead>

            {COMPARE_ROWS.map(([label, scores]) => (
              <React.Fragment key={label}>
                <CompareLabel>{label}</CompareLabel>
                {scores.map((s, i) => (
                  <CompareCell key={i}>
                    <Dots score={s} />
                  </CompareCell>
                ))}
              </React.Fragment>
            ))}

            <CompareLabel last>Best For</CompareLabel>
            {['Detail', 'Mechanical', 'Flexible', 'High Temp'].map((v) => (
              <CompareCell key={v} last>
                {v}
              </CompareCell>
            ))}
          </div>
        </Container>
      </section>

      {/* 10. COMMUNITY SPOTLIGHT */}
      <TestimonialCarousel />

      {/* 11. WHY AURA */}
      <section className="py-[clamp(80px,15vw,200px)]">
        <Container>
          <div className="mb-[clamp(64px,10vw,120px)] flex flex-col gap-4">
            <h2 className="text-[clamp(3rem,7vw,6rem)] leading-none font-medium tracking-[-0.05em]">
              Why Aura.
            </h2>
            <p className="max-w-[600px] text-[clamp(1.25rem,2vw,1.5rem)] text-muted">
              Engineered for those who demand precision and reliability.
            </p>
          </div>

          <div className="flex flex-col border-t border-border">
            {WHY.map(([num, title, body]) => (
              <div
                className="grid grid-cols-[60px_1fr] items-center gap-8 border-b border-border py-[clamp(24px,5vw,40px)] transition-colors duration-500 hover:bg-black/2 min-[900px]:grid-cols-[100px_1fr] min-[900px]:py-[clamp(40px,6vw,80px)]"
                key={num}
              >
                <span className="text-[clamp(2rem,4vw,3rem)] font-light text-primary opacity-80">
                  {num}
                </span>
                <div className="grid items-center gap-2 min-[900px]:grid-cols-2 min-[900px]:gap-8">
                  <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-medium tracking-[-0.02em]">
                    {title}
                  </h3>
                  <p className="max-w-[500px] text-lg leading-[1.6] text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 12. LEARNING HUB */}
      <section className="py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="mb-[clamp(64px,8vw,100px)] flex items-end justify-between gap-6">
            <h2 className={SECTION_TITLE}>Learning Hub</h2>
            <Button as="a" href="/guides" variant="tertiary">
              View all guides &rarr;
            </Button>
          </div>

          <div className="flex flex-col">
            {GUIDES.map((g) => (
              <Link
                className="group grid items-center gap-4 rounded-2xl border-t border-border py-8 transition duration-400 ease-editorial last:border-b hover:bg-background hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.05)] md:grid-cols-[140px_1fr_60px] md:gap-8 md:py-12 lg:-mx-6 lg:grid-cols-[180px_1fr_240px_40px] lg:px-6"
                href={g.href}
                key={g.href}
              >
                <div className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  {g.meta}
                </div>
                <div>
                  <h3 className="mb-3 text-[clamp(1.5rem,3vw,2.5rem)] font-medium tracking-[-0.02em]">
                    {g.title}
                  </h3>
                  <p className="max-w-[600px] text-lg leading-[1.6] text-muted">{g.sub}</p>
                </div>
                <div className="hidden aspect-video w-full scale-95 overflow-hidden rounded-2xl opacity-60 grayscale transition-all duration-500 ease-editorial group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0 lg:block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder photography */}
                  <img alt={g.title} className="size-full object-cover" src={g.img} />
                </div>
                <div className="hidden -translate-x-4 justify-end opacity-0 transition-all duration-400 ease-editorial group-hover:translate-x-0 group-hover:opacity-100 md:flex">
                  <ArrowRight />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 13. FINAL CTA — lives in the mega footer */}
    </>
  )
}

import Link from 'next/link'
import React from 'react'

import { demoFilament, demoPrint } from '@/data/storefront-demo'
import { getHomepageViewModel } from '@/lib/homepage/get-homepage'
import { imageFallback } from '@/lib/homepage/fallback'
import { Container, Section } from '@/components/storefront/layout/Container'
import { FilamentCard } from '@/components/storefront/product/FilamentCard'
import { PrintCard } from '@/components/storefront/product/PrintCard'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'
import { InteractiveShades } from '@/components/storefront/ui/InteractiveShades'
import { carouselItem, ScrollableCarousel } from '@/components/storefront/ui/ScrollableCarousel'
import { TestimonialCarousel } from '@/components/storefront/ui/TestimonialCarousel'
import { Velaris } from '@/components/storefront/ui/Velaris'
import { formatNPR } from '@/components/storefront/commerce/Price'

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

/**
 * Original demo carousel, unchanged, used only when the CMS-selected Popular
 * products don't have photography yet (the current dev catalog has none).
 * Once real Product images exist this branch stops firing on its own.
 */
const PopularFallback = () => (
  <ScrollableCarousel>
    <div className={carouselItem}>
      <FilamentCard product={{ ...demoFilament, imageUrl: imageFallback.categoryFilaments }} ratio="portrait" />
    </div>
    <div className={carouselItem}>
      <PrintCard
        product={{ ...demoPrint, imageUrl: imageFallback.categoryPrints, title: 'Desk Organizer' }}
        ratio="portrait"
      />
    </div>
    <div className={carouselItem}>
      <FilamentCard
        product={{ ...demoFilament, imageUrl: imageFallback.categoryFilaments, price: 2500, title: 'Numakers PETG' }}
        ratio="portrait"
      />
    </div>
    <div className={carouselItem}>
      <PrintCard
        product={{
          ...demoPrint,
          imageUrl: imageFallback.categoryPrints,
          materials: ['PLA', 'PETG'],
          title: 'Articulated Dragon',
        }}
        ratio="portrait"
      />
    </div>
    <div className={carouselItem}>
      <FilamentCard
        product={{ ...demoFilament, imageUrl: imageFallback.categoryFilaments, price: 2500, title: 'Pitch Black PLA' }}
        ratio="portrait"
      />
    </div>
  </ScrollableCarousel>
)

/** Original "Fresh Prints" demo row, same fallback rule as PopularFallback. */
const FRESH_FALLBACK = [
  { href: '/3d-prints', img: imageFallback.useCaseFunctional, price: 'NPR 3,500', title: 'Geometric Planter' },
  { href: '/3d-prints', img: imageFallback.categoryPrints, price: 'NPR 2,400', title: 'Desk Organizer' },
  { href: '/3d-prints', img: imageFallback.useCaseCosplay, price: 'NPR 8,500', title: 'Mech Keyboard Case' },
  { href: '/3d-prints', img: imageFallback.useCaseMiniatures, price: 'NPR 4,500', title: 'Articulated Dragon' },
]

export default async function HomePage() {
  const vm = await getHomepageViewModel()

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
              {vm.hero.heading}
            </h1>
            <p className="max-w-[800px] text-center text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.4] text-white/80">
              {vm.hero.subheading}
            </p>
          </div>

          {/* the image straddles the section edge, half of it in the next section */}
          <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
            <Container>
              <div className="group relative aspect-4/5 w-full overflow-hidden rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] md:aspect-[16/7] md:rounded-[32px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */}
                <img
                  alt={vm.hero.imageAlt}
                  className="size-full object-cover transition-transform duration-2000 ease-editorial group-hover:scale-105"
                  src={vm.hero.imageUrl}
                />
                <div className="absolute inset-0 flex flex-col items-end justify-end gap-4 bg-linear-to-t from-black/70 to-transparent to-60% p-6 md:flex-row md:justify-center md:p-12">
                  <Button as="a" block className="md:w-auto" href={vm.hero.primaryCta.url} size="lg">
                    {vm.hero.primaryCta.label}
                  </Button>
                  <Button
                    as="a"
                    block
                    className="md:w-auto"
                    href={vm.hero.secondaryCta.url}
                    size="lg"
                    variant="on-dark"
                  >
                    {vm.hero.secondaryCta.label}
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </section>

      {/* 2. SHOP CATEGORIES */}
      {vm.categories.enabled ? (
        <Section>
          <div className="grid gap-8 md:grid-cols-3">
            {vm.categories.items.map((c) => (
              <a className="group flex flex-col items-center gap-3 text-center" href={c.url || '#'} key={c.title}>
                <div className="mb-2 aspect-3/2 w-full overflow-hidden rounded-3xl bg-[#f4f4f4] md:aspect-4/5 md:rounded-[32px]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */}
                  <img
                    alt={c.title}
                    className="size-full object-cover transition-transform duration-1200 ease-editorial group-hover:scale-105"
                    src={c.imageUrl}
                  />
                </div>
                <h3 className="text-2xl font-medium tracking-[-0.02em]">{c.title}</h3>
                <p className="text-muted">{c.subtitle}</p>
              </a>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 3. POPULAR PRODUCTS */}
      {vm.popular.enabled ? (
        <section className="py-[clamp(64px,10vw,120px)]">
          <Container>
            <div className={RULE_HEADER}>
              <h2 className={SECTION_TITLE}>{vm.popular.heading}</h2>
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

          {vm.popular.cards.length ? (
            <ScrollableCarousel>
              {vm.popular.cards.map(({ card, type }, i) =>
                type === 'filament' ? (
                  <div className={carouselItem} key={i}>
                    <FilamentCard product={card} ratio="portrait" />
                  </div>
                ) : (
                  <div className={carouselItem} key={i}>
                    <PrintCard product={card} ratio="portrait" />
                  </div>
                ),
              )}
            </ScrollableCarousel>
          ) : (
            <PopularFallback />
          )}
        </section>
      ) : null}

      {/* 4. EXPLORE BY MATERIAL */}
      {vm.materialsSection.enabled ? (
        <div className="bg-deep-forest py-[clamp(64px,10vw,120px)] text-white">
          <Container>
            <h2 className="text-base">{vm.materialsSection.heading}</h2>
            <div className="mt-8 flex flex-col border-t border-white/10 md:mt-12">
              {vm.materialsSection.items.map((m) => (
                <Link
                  className="group flex flex-col items-start overflow-hidden border-b border-white/10 py-8 transition-[padding-left] duration-400 ease-editorial md:flex-row md:items-center md:justify-between md:py-10 md:hover:pl-10"
                  href={m.url || '#'}
                  key={m.name}
                >
                  <div className="text-stroke leading-[0.9] font-extrabold tracking-[-0.04em] text-white transition-colors group-hover:text-lime md:text-transparent md:[-webkit-text-stroke:1px_rgba(255,255,255,0.3)] md:group-hover:[-webkit-text-stroke:1px_#c5f955]">
                    {m.name}
                  </div>
                  <div className="mt-4 max-w-[400px] flex-1 text-lg leading-[1.5] text-white/60 transition duration-400 md:mt-0 md:ml-20 md:-translate-x-5 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
                    {m.description}
                  </div>
                  <div className="hidden -translate-x-5 text-5xl font-extralight text-white/30 opacity-0 transition duration-400 group-hover:translate-x-0 group-hover:text-lime group-hover:opacity-100 md:block">
                    &rarr;
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </div>
      ) : null}

      {/* 5. WHAT ARE YOU PRINTING? */}
      {vm.useCases.enabled ? (
        <Section>
          <h2 className="mb-10 text-h2 font-semibold tracking-[-0.02em]">{vm.useCases.heading}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {vm.useCases.items.map((u) => (
              <Link
                className="group relative aspect-4/5 cursor-crosshair overflow-hidden rounded-3xl"
                href={u.url || '#'}
                key={u.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */}
                <img
                  alt={u.title}
                  className="size-full object-cover transition-transform duration-800 ease-editorial group-hover:scale-110"
                  src={u.imageUrl}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent to-50%" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="mb-1 text-2xl">{u.title}</h3>
                  <p className="text-white/70">{u.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 6. FRESH FROM THE PRINTER */}
      {vm.freshPrints.enabled ? (
        <section className="py-[clamp(64px,10vw,120px)]">
          <Container>
            <div className={RULE_HEADER}>
              <h2 className={SECTION_TITLE}>{vm.freshPrints.heading}</h2>
              <a className="text-lg font-medium hover:underline" href={vm.freshPrints.viewAllUrl}>
                {vm.freshPrints.viewAllLabel} &rarr;
              </a>
            </div>
          </Container>

          <ScrollableCarousel>
            {vm.freshPrints.printCards.length
              ? vm.freshPrints.printCards.map((f) => (
                  <a className={cn('group flex flex-col gap-4', carouselItem)} href={f.href} key={f.href}>
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#f4f4f4]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */}
                      <img
                        alt={f.title}
                        className="size-full object-cover transition-transform duration-600 ease-editorial group-hover:scale-105"
                        src={f.imageUrl}
                      />
                    </div>
                    <div className="flex items-baseline justify-between border-b border-black/10 pb-3 text-lg font-medium transition-colors group-hover:border-black/50">
                      <span>{f.title}</span>
                      <span>{formatNPR(f.price)}</span>
                    </div>
                  </a>
                ))
              : FRESH_FALLBACK.map((f) => (
                  <a className={cn('group flex flex-col gap-4', carouselItem)} href={f.href} key={f.title}>
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
      ) : null}

      {/* 7. STAFF PICK */}
      {vm.staffPick.enabled ? (
        <section className="py-[clamp(80px,10vw,160px)]">
          <div className="group relative flex min-h-[70vh] items-end overflow-hidden bg-black py-[clamp(40px,8vw,100px)] min-[900px]:items-center">
            <div className="absolute inset-0 z-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */}
              <img
                alt={vm.staffPick.heading}
                className="size-full object-cover opacity-50 mix-blend-luminosity transition duration-1200 ease-editorial group-hover:scale-105 group-hover:opacity-70"
                src={vm.staffPick.imageUrl}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 z-2 bg-linear-to-t from-black/90 via-black/50 via-60% to-transparent min-[900px]:bg-linear-to-r min-[900px]:via-black/30" />
            <Container className="relative z-3">
              <div className="flex max-w-[580px] flex-col items-start text-white">
                <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold tracking-[0.1em] uppercase backdrop-blur-[12px]">
                  {vm.staffPick.eyebrow}
                </div>
                <h2 className="mb-6 text-mega leading-[1.1] font-medium tracking-[-0.04em]">
                  {vm.staffPick.heading}
                </h2>
                <p className="mb-8 text-[clamp(1.125rem,2vw,1.25rem)] leading-[1.6] text-white/70">
                  {vm.staffPick.body}
                </p>
                <Button as="a" href={vm.staffPick.ctaUrl} size="lg">
                  {vm.staffPick.ctaLabel}
                </Button>
              </div>
            </Container>
          </div>
        </section>
      ) : null}

      {/* 8. MADE IN EVERY SHADE — copy is CMS-sourced; swatches/interaction stay code-driven */}
      {vm.shadeShowcase.enabled ? (
        <section className="bg-background py-[clamp(80px,15vw,160px)]">
          <Container>
            <InteractiveShades
              ctaLabel={vm.shadeShowcase.ctaLabel}
              ctaUrl={vm.shadeShowcase.ctaUrl}
              description={vm.shadeShowcase.description}
              heading={vm.shadeShowcase.heading}
            />
          </Container>
        </section>
      ) : null}

      {/* 9. MATERIAL COMPARISON */}
      {vm.compare.enabled ? (
        <section className="py-[clamp(80px,10vw,160px)]">
          <Container>
            <h2 className={cn(SECTION_TITLE, 'mb-20')}>{vm.compare.heading}</h2>

            <div className="grid w-full grid-cols-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
              <CompareHead className="hidden md:flex" />
              {vm.compare.columns.map((col) => (
                <CompareHead key={col.label}>{col.label}</CompareHead>
              ))}

              {vm.compare.rows.map((row) => (
                <React.Fragment key={row.label}>
                  <CompareLabel>{row.label}</CompareLabel>
                  {row.scores.map((s, i) => (
                    <CompareCell key={i}>
                      <Dots score={s} />
                    </CompareCell>
                  ))}
                </React.Fragment>
              ))}

              <CompareLabel last>Best For</CompareLabel>
              {vm.compare.columns.map((col) => (
                <CompareCell key={col.label} last>
                  {col.bestFor}
                </CompareCell>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 10. COMMUNITY SPOTLIGHT — kept off: seeded testimonials are unverified/fabricated */}
      {vm.testimonials.enabled ? <TestimonialCarousel /> : null}

      {/* 11. WHY AURA */}
      {vm.whyAura.enabled ? (
        <section className="py-[clamp(80px,15vw,200px)]">
          <Container>
            <div className="mb-[clamp(64px,10vw,120px)] flex flex-col gap-4">
              <h2 className="text-[clamp(3rem,7vw,6rem)] leading-none font-medium tracking-[-0.05em]">
                {vm.whyAura.heading}
              </h2>
              <p className="max-w-[600px] text-[clamp(1.25rem,2vw,1.5rem)] text-muted">
                {vm.whyAura.subheading}
              </p>
            </div>

            <div className="flex flex-col border-t border-border">
              {vm.whyAura.items.map((item, i) => (
                <div
                  className="grid grid-cols-[60px_1fr] items-center gap-8 border-b border-border py-[clamp(24px,5vw,40px)] transition-colors duration-500 hover:bg-black/2 min-[900px]:grid-cols-[100px_1fr] min-[900px]:py-[clamp(40px,6vw,80px)]"
                  key={item.title}
                >
                  <span className="text-[clamp(2rem,4vw,3rem)] font-light text-primary opacity-80">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="grid items-center gap-2 min-[900px]:grid-cols-2 min-[900px]:gap-8">
                    <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-medium tracking-[-0.02em]">
                      {item.title}
                    </h3>
                    <p className="max-w-[500px] text-lg leading-[1.6] text-muted">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 12. LEARNING HUB — off: /guides and its article routes don't exist yet */}
      {vm.learningHub.enabled ? (
        <section className="py-[clamp(80px,10vw,160px)]">
          <Container>
            <div className="mb-[clamp(64px,8vw,100px)] flex items-end justify-between gap-6">
              <h2 className={SECTION_TITLE}>{vm.learningHub.heading}</h2>
              <Button as="a" href={vm.learningHub.viewAllUrl || '#'} variant="tertiary">
                {vm.learningHub.viewAllLabel} &rarr;
              </Button>
            </div>

            <div className="flex flex-col">
              {vm.learningHub.items.map((g) => (
                <Link
                  className="group grid items-center gap-4 rounded-2xl border-t border-border py-8 transition duration-400 ease-editorial last:border-b hover:bg-background hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.05)] md:grid-cols-[140px_1fr_60px] md:gap-8 md:py-12 lg:-mx-6 lg:grid-cols-[180px_1fr_240px_40px] lg:px-6"
                  href={g.url || '#'}
                  key={g.title}
                >
                  <div className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">{g.meta}</div>
                  <div>
                    <h3 className="mb-3 text-[clamp(1.5rem,3vw,2.5rem)] font-medium tracking-[-0.02em]">
                      {g.title}
                    </h3>
                    <p className="max-w-[600px] text-lg leading-[1.6] text-muted">{g.summary}</p>
                  </div>
                  <div className="hidden aspect-video w-full scale-95 overflow-hidden rounded-2xl opacity-60 grayscale transition-all duration-500 ease-editorial group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0 lg:block">
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */}
                    <img alt={g.title} className="size-full object-cover" src={g.imageUrl} />
                  </div>
                  <div className="hidden -translate-x-4 justify-end opacity-0 transition-all duration-400 ease-editorial group-hover:translate-x-0 group-hover:opacity-100 md:flex">
                    <ArrowRight />
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 13. FINAL CTA — lives in the mega footer */}
    </>
  )
}

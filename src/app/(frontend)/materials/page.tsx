import Link from 'next/link'
import React from 'react'

import { Container, Section } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'

const P_HERO = 'https://images.unsplash.com/photo-1617478755490-e21232a5eeaf?q=80&w=1600&auto=format&fit=crop'
const P_MACRO_PLA = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop'
const P_MACRO_PETG = 'https://images.unsplash.com/photo-1603984362497-0a878f607b92?q=80&w=1200&auto=format&fit=crop'
const P_QA = 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?q=80&w=1600&auto=format&fit=crop'
const P_GUIDE = 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=800&auto=format&fit=crop'

const SECTION_TITLE = 'text-mega leading-none font-semibold tracking-[-0.04em]'

const Dots = ({ score }: { score: number }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <div className={cn('size-2 rounded-full', i <= score ? 'bg-black' : 'bg-[#e5e5e5]')} key={i} />
    ))}
  </div>
)

const MATRIX = [
  { material: 'PLA+', strength: 4, flex: 1, heat: 2, ease: 5 },
  { material: 'PETG', strength: 4, flex: 3, heat: 3, ease: 4 },
  { material: 'TPU', strength: 2, flex: 5, heat: 2, ease: 2 },
  { material: 'ABS/ASA', strength: 5, flex: 2, heat: 5, ease: 1 },
]

export default function MaterialsPage() {
  return (
    <>
      {/* 1. Technical Hero */}
      <section className="relative flex min-h-[85vh] items-center bg-[#f4f4f4] pt-[15vh]">
        <Container className="w-full">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="flex flex-col items-start">
              <div className="mb-6 inline-flex items-center rounded-full border border-black/10 px-4 py-1.5 text-sm font-semibold tracking-[0.1em] uppercase">
                Technical Data
              </div>
              <h1 className="mb-8 text-[clamp(4rem,7vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.04em]">
                The Library.
              </h1>
              <p className="mb-10 max-w-[500px] text-lg leading-[1.6] text-muted">
                An index of high-performance polymers. Engineered to rigorous tolerances to ensure perfect bed adhesion, minimal warping, and predictable extrusion.
              </p>
              <div className="flex gap-4">
                <Button size="lg" variant="primary">Shop All Filaments</Button>
                <Button size="lg" variant="secondary">Download Spec Sheets</Button>
              </div>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-black">
              <img
                alt="Macro view of 3D printing filament"
                className="size-full object-cover opacity-80 mix-blend-luminosity"
                src={P_HERO}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 2. "At a Glance" Interactive Matrix */}
      <section className="border-t border-black/10 bg-white py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-black/10 pb-6 md:flex-row md:items-end">
            <h2 className={SECTION_TITLE}>Matrix.</h2>
            <p className="text-xl text-muted">Quick comparison chart.</p>
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
                {MATRIX.map((row) => (
                  <tr className="group border-b border-black/10 transition-colors hover:bg-[#f4f4f4]" key={row.material}>
                    <td className="py-6 pr-4 group-hover:pl-4 transition-all">{row.material}</td>
                    <td className="py-6 pr-4"><Dots score={row.strength} /></td>
                    <td className="py-6 pr-4"><Dots score={row.flex} /></td>
                    <td className="py-6 pr-4"><Dots score={row.heat} /></td>
                    <td className="py-6 pr-4"><Dots score={row.ease} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* 3. Deep Dives */}
      <section className="bg-black py-[clamp(80px,15vw,160px)] text-white">
        <Container>
          <div className="grid gap-24 md:grid-cols-2 md:items-center">
            {/* PLA+ Deep Dive */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] bg-[#111]">
              <img alt="PLA+ Structure" className="size-full object-cover opacity-60" src={P_MACRO_PLA} />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <span className="text-[12rem] font-extrabold text-white/5 tracking-tighter">PLA+</span>
              </div>
            </div>
            <div className="flex flex-col items-start">
              <h2 className="mb-4 text-sm font-semibold tracking-[0.1em] text-lime uppercase">
                The Gold Standard
              </h2>
              <h3 className="mb-6 text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                Polylactic Acid Plus
              </h3>
              <p className="mb-8 text-lg leading-[1.6] text-white/70">
                Modified to be up to 10x tougher than standard PLA. Our PLA+ flows flawlessly, produces incredibly sharp details, and features an impact modifier that prevents snapping under stress. It is the perfect daily driver for 90% of prints.
              </p>
              <ul className="mb-10 space-y-4 font-medium text-white/90 border-l border-white/20 pl-6">
                <li>No enclosure required</li>
                <li>Biodegradable organic base</li>
                <li>Exceptional layer adhesion</li>
              </ul>
              <Button size="lg" variant="accent">Explore PLA+</Button>
            </div>

            {/* PETG Deep Dive */}
            <div className="flex flex-col items-start order-2 md:order-1">
              <h2 className="mb-4 text-sm font-semibold tracking-[0.1em] text-lime uppercase">
                The Engineering Workhorse
              </h2>
              <h3 className="mb-6 text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                Polyethylene Terephthalate Glycol
              </h3>
              <p className="mb-8 text-lg leading-[1.6] text-white/70">
                Bridging the gap between the ease of PLA and the raw strength of ABS. PETG is naturally water resistant, withstands high temperatures without softening, and flexes slightly before breaking. Ideal for mechanical assemblies and outdoor use.
              </p>
              <ul className="mb-10 space-y-4 font-medium text-white/90 border-l border-white/20 pl-6">
                <li>High temperature resistance</li>
                <li>Excellent impact strength</li>
                <li>UV and weather resistant</li>
              </ul>
              <Button size="lg" variant="accent">Explore PETG</Button>
            </div>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] bg-[#111] order-1 md:order-2">
              <img alt="PETG Structure" className="size-full object-cover opacity-60" src={P_MACRO_PETG} />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <span className="text-[12rem] font-extrabold text-white/5 tracking-tighter">PETG</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Quality Assurance */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background py-[10vh]">
        <div className="absolute inset-0 z-0">
          <img
            alt="Quality Control"
            className="size-full object-cover mix-blend-multiply opacity-20"
            src={P_QA}
          />
        </div>
        <Container className="relative z-10 w-full">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-8 text-[clamp(3rem,6vw,5rem)] leading-[1] font-medium tracking-[-0.03em]">
              Precision matters.
            </h2>
            <p className="text-xl leading-[1.6] text-muted">
              Inconsistent filament diameter causes jams, weak layer bonds, and ruined hours of printing. We strictly monitor extrusion to a tolerance of <strong>±0.03mm</strong>. Every single spool is vacuum-sealed with desiccant immediately upon cooling to prevent moisture absorption.
            </p>
          </div>
        </Container>
      </section>

      {/* 5. Knowledge Base CTAs */}
      <section className="border-t border-black/10 py-[clamp(80px,10vw,160px)]">
        <Container>
          <div className="grid gap-12 md:grid-cols-2">
            <div className="flex flex-col items-start justify-center">
              <h2 className="mb-6 text-4xl font-medium tracking-[-0.02em]">Ready to get started?</h2>
              <p className="mb-8 text-lg text-muted">
                Browse the Numakers range and pick the colour that fits your next
                project. Every spool in the catalogue is in stock and ready to ship across Nepal.
              </p>
              <Button as="a" href="/filaments" size="lg" variant="primary">
                Shop Filaments
              </Button>
            </div>
            <Link className="group relative aspect-video overflow-hidden rounded-3xl bg-[#f4f4f4]" href="/filaments">
              <img alt="Browse Aura filaments" className="size-full object-cover transition-transform duration-1000 group-hover:scale-105" src={P_GUIDE} />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <h3 className="text-2xl font-medium">Explore the filament catalogue &rarr;</h3>
              </div>
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}

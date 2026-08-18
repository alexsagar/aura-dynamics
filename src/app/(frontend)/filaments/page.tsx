import Link from 'next/link'
import React from 'react'

import { demoFilament } from '@/data/storefront-demo'
import { Container, Section } from '@/components/storefront/layout/Container'
import { FilamentCard } from '@/components/storefront/product/FilamentCard'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'
import { InteractiveShades } from '@/components/storefront/ui/InteractiveShades'
import { carouselItem, ScrollableCarousel } from '@/components/storefront/ui/ScrollableCarousel'

const P_HERO = 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=1600&auto=format&fit=crop'
const P_FILAMENT = 'https://images.unsplash.com/photo-1617478755490-e21232a5eeaf?q=80&w=800&auto=format&fit=crop'
const P_FACTORY = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop'

const SECTION_TITLE = 'text-mega leading-none font-semibold tracking-[-0.04em]'

export default function FilamentsPage() {
  return (
    <>
      {/* 1. Immersive Parallax Hero */}
      <section className="relative flex min-h-[90vh] items-end justify-start overflow-hidden bg-black pb-[10vh] pt-[20vh]">
        <div className="absolute inset-0 z-0">
          <img
            alt="Filament Extrusion"
            className="size-full object-cover opacity-40 mix-blend-luminosity"
            src={P_FACTORY}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
        </div>
        <Container className="relative z-10 w-full">
          <div className="max-w-[800px] text-white">
            <h1 className="mb-6 text-[clamp(4rem,10vw,8rem)] leading-[0.9] font-extrabold tracking-[-0.04em]">
              The raw <br /> material of <br /> creation.
            </h1>
            <p className="mb-10 text-xl leading-[1.6] text-white/70">
              High-performance polymers extruded to rigorous tolerances. Discover the perfect material for your next project, whether it's an intricate miniature or a high-stress mechanical part.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="accent">
                Explore PLA+
              </Button>
              <Button size="lg" variant="on-dark">
                View Spec Sheet
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Performance Metrics */}
      <section className="bg-black text-white py-[clamp(80px,15vw,160px)]">
        <Container>
          <div className="grid gap-16 md:grid-cols-[1fr_2fr] md:gap-32 lg:items-center">
            <div>
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] font-medium tracking-[-0.04em]">
                Engineered for flawless extrusion.
              </h2>
            </div>
            <div className="grid gap-12 sm:grid-cols-2">
              <div className="flex flex-col border-t border-white/20 pt-8">
                <span className="mb-2 text-5xl font-light text-lime">±0.03mm</span>
                <span className="text-lg font-semibold tracking-tight">Dimensional Accuracy</span>
                <p className="mt-4 text-white/60">Strict laser monitoring ensures a perfectly round diameter across the entire spool, preventing jams and under-extrusion.</p>
              </div>
              <div className="flex flex-col border-t border-white/20 pt-8">
                <span className="mb-2 text-5xl font-light text-lime">&lt;0.1%</span>
                <span className="text-lg font-semibold tracking-tight">Moisture Content</span>
                <p className="mt-4 text-white/60">Vacuum sealed with premium desiccant immediately after extrusion to guarantee bubble-free, structurally sound prints.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. The Color Palette Matrix (Reusing InteractiveShades) */}
      <section className="bg-background py-[clamp(80px,15vw,160px)]">
        <Container>
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className={SECTION_TITLE}>Made in every shade.</h2>
              <p className="mt-6 max-w-[500px] text-lg text-muted">
                From essential matte tones to vibrant accents, our PLA+ lineup offers the perfect color for any project.
              </p>
            </div>
          </div>
          <InteractiveShades />
        </Container>
      </section>

      {/* 4. Best Sellers Scrolling Marquee */}
      <section className="py-[clamp(64px,10vw,120px)] overflow-hidden">
        <Container>
          <div className="mb-16 flex items-end justify-between border-b border-black/10 pb-6">
            <h2 className={SECTION_TITLE}>Best Sellers.</h2>
            <Button variant="tertiary">Shop all filaments &rarr;</Button>
          </div>
        </Container>
        
        <ScrollableCarousel>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div className={carouselItem} key={i}>
              <FilamentCard product={{ ...demoFilament, imageUrl: P_FILAMENT, title: `Matte Black PLA+` }} ratio="portrait" />
            </div>
          ))}
        </ScrollableCarousel>
      </section>

      {/* 5. Material Deep Dive (PLA vs PETG) */}
      <section className="py-[clamp(80px,15vw,160px)]">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center bg-[#f4f4f4] p-12 md:p-24 rounded-3xl">
              <span className="text-sm font-semibold uppercase tracking-widest text-muted">The Standard</span>
              <h2 className="mt-4 text-5xl font-medium tracking-tight">PLA+</h2>
              <p className="mt-6 text-lg text-muted">
                The absolute standard for most prints. Our PLA+ is formulated to be significantly tougher than regular PLA, while maintaining the same incredible ease of printing and perfectly crisp overhangs.
              </p>
              <ul className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-8">
                <li className="flex justify-between"><span>Bed Temp</span><span className="font-semibold">60°C</span></li>
                <li className="flex justify-between"><span>Hotend Temp</span><span className="font-semibold">210°C</span></li>
                <li className="flex justify-between"><span>Enclosure</span><span className="font-semibold">Not Required</span></li>
              </ul>
              <div className="mt-12">
                <Button block>Shop PLA+</Button>
              </div>
            </div>
            
            <div className="flex flex-col justify-center bg-black text-white p-12 md:p-24 rounded-3xl">
              <span className="text-sm font-semibold uppercase tracking-widest text-white/50">The Workhorse</span>
              <h2 className="mt-4 text-5xl font-medium tracking-tight">PETG</h2>
              <p className="mt-6 text-lg text-white/70">
                When you need UV resistance and mechanical strength. PETG is naturally flexible, impact-resistant, and won't warp in a hot car. It is the material of choice for functional parts.
              </p>
              <ul className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 text-white/80">
                <li className="flex justify-between"><span>Bed Temp</span><span className="font-semibold text-white">80°C</span></li>
                <li className="flex justify-between"><span>Hotend Temp</span><span className="font-semibold text-white">240°C</span></li>
                <li className="flex justify-between"><span>Enclosure</span><span className="font-semibold text-white">Recommended</span></li>
              </ul>
              <div className="mt-12">
                <Button block variant="on-dark">Shop PETG</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. Trusted By / Reviews */}
      <section className="bg-background py-[clamp(80px,15vw,160px)] border-t border-black/5">
        <Container>
          <div className="flex flex-col items-center text-center">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-medium tracking-tight">
              Trusted by 5,000+ makers across Nepal.
            </h2>
            <p className="mt-6 max-w-[600px] text-lg text-muted">
              From hobbyists creating their first Benchy to industrial farms running 24/7, Aura is the filament that keeps them printing.
            </p>
            
            <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-16 opacity-40 grayscale">
               {/* Placeholders for logos */}
               <div className="flex items-center justify-center font-bold text-2xl tracking-widest">MAKERBOT</div>
               <div className="flex items-center justify-center font-bold text-2xl tracking-widest">CREALITY</div>
               <div className="flex items-center justify-center font-bold text-2xl tracking-widest">PRUSA</div>
               <div className="flex items-center justify-center font-bold text-2xl tracking-widest">BAMBU LAB</div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

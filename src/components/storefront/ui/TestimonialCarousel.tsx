'use client'

import React, { useEffect, useState } from 'react'

import { Container } from '../layout/Container'
import { cn } from './cn'

type Testimonial = {
  quote: string
  name: string
  studio: string
  avatarUrl: string
}

const testimonials: Testimonial[] = [
  {
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    name: 'Build With Makers',
    quote:
      'Aura completely changed how I prototype. The materials are reliable and the ready-stock parts mean I never stop building.',
    studio: 'Engineering Studio',
  },
  {
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    name: 'Sarah Jenkins',
    quote:
      'The print quality is unmatched. I’ve transitioned all my production parts to their PETG and the consistency is flawless.',
    studio: 'Industrial Design',
  },
  {
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    name: 'David Chen',
    quote:
      'Finally, a supplier that understands rapid iteration. Their PLA+ handles complex geometries with zero stringing and perfect adhesion.',
    studio: 'Robotics Lab',
  },
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="flex justify-center py-[clamp(80px,15vw,200px)] text-center">
      <Container>
        <div className="relative mx-auto max-w-[900px]">
          {/* every slide sits in the same grid cell and cross-fades */}
          <div className="grid">
            {testimonials.map((t, i) => (
              <div
                aria-hidden={i !== currentIndex}
                className={cn(
                  'col-start-1 row-start-1 flex flex-col items-center transition-[opacity,transform] duration-700 ease-out',
                  i === currentIndex
                    ? 'z-2 visible translate-y-0 opacity-100'
                    : 'invisible translate-y-2.5 opacity-0',
                )}
                key={i}
              >
                <h2 className="relative z-2 mb-10 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] font-medium tracking-[-0.04em] text-balance">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-20 left-1/2 -z-10 -translate-x-1/2 font-serif text-[240px] leading-none text-primary opacity-5"
                  >
                    &quot;
                  </span>
                  &quot;{t.quote}&quot;
                </h2>
                <div className="relative z-2 flex flex-col items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote avatar placeholder */}
                  <img
                    alt={t.name}
                    className="size-20 rounded-full object-cover shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                    src={t.avatarUrl}
                  />
                  <div className="flex flex-col items-center">
                    <strong className="text-lg font-semibold">{t.name}</strong>
                    <span className="text-sm text-muted">{t.studio}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-10 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                aria-current={i === currentIndex ? 'true' : 'false'}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'size-2 cursor-pointer rounded-full transition duration-300',
                  i === currentIndex ? 'scale-130 bg-primary' : 'bg-border hover:bg-muted',
                )}
                key={i}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

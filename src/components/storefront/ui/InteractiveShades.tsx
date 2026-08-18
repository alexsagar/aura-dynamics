'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { cn } from './cn'

const MOCK_SHADES = [
  { hex: '#111', id: 'black', image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1200&auto=format&fit=crop', name: 'Black' },
  { hex: '#f9f9f9', id: 'white', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1200&auto=format&fit=crop', name: 'White' },
  { hex: '#dc2626', id: 'red', image: 'https://images.unsplash.com/photo-1617478755490-e21232a5eeaf?q=80&w=1200&auto=format&fit=crop', name: 'Red' },
  { hex: '#16a34a', id: 'green', image: 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=1200&auto=format&fit=crop', name: 'Green' },
  { hex: '#2563eb', id: 'blue', image: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=1200&auto=format&fit=crop', name: 'Blue' },
  { hex: '#9333ea', id: 'purple', image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop', name: 'Purple' },
  { hex: '#ea580c', id: 'orange', image: 'https://images.unsplash.com/photo-1603984362497-0a878f607b92?q=80&w=1200&auto=format&fit=crop', name: 'Orange' },
  { hex: '#eab308', id: 'yellow', image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1200&auto=format&fit=crop', name: 'Yellow' },
]

export function InteractiveShades() {
  const [activeId, setActiveId] = useState(MOCK_SHADES[0].id)

  return (
    <div className="grid gap-16 min-[900px]:grid-cols-[40%_1fr] min-[900px]:items-center min-[900px]:gap-20">
      <div className="flex flex-col">
        <h2 className="mb-4 text-[clamp(3rem,5vw,4rem)] leading-[1.1] font-medium tracking-[-0.04em]">
          Made in every shade.
        </h2>
        <p className="mb-8 max-w-[480px] text-xl leading-[1.5] text-muted">
          From pure matte black to vibrant neon green, find the perfect high-precision color for your
          next project.
        </p>

        <div className="mb-10 grid grid-cols-2 gap-2">
          {MOCK_SHADES.map((shade) => (
            <button
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-control p-2 text-left text-base font-medium transition',
                activeId === shade.id
                  ? 'bg-black/5 text-foreground'
                  : 'text-muted hover:bg-black/3',
              )}
              key={shade.id}
              onClick={() => setActiveId(shade.id)}
            >
              <span
                className={cn(
                  'size-6 flex-none rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-transform',
                  activeId === shade.id &&
                    'scale-115 ring-2 ring-foreground ring-offset-2 ring-offset-background',
                )}
                style={{
                  background: shade.hex,
                  border: shade.hex === '#f9f9f9' ? '1px solid #ddd' : 'none',
                }}
              />
              {shade.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-6">
          <span className="text-sm font-semibold tracking-[0.05em] text-muted uppercase">
            40+ colors available
          </span>
          <Link
            className="inline-flex items-center gap-2 text-lg font-medium transition-colors hover:text-cta"
            href="/filaments"
          >
            Explore all colors &rarr;
          </Link>
        </div>
      </div>

      <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl bg-black/5">
        {MOCK_SHADES.map((shade) => (
          /* eslint-disable-next-line @next/next/no-img-element -- remote placeholder photography */
          <img
            alt={`${shade.name} filament`}
            className={cn(
              'absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 ease-in-out',
              activeId === shade.id ? 'scale-100 opacity-100' : 'scale-102 opacity-0',
            )}
            key={shade.id}
            src={shade.image}
          />
        ))}
      </div>
    </div>
  )
}

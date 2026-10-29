'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { cn } from './cn'

export type Shade = { hex: string; id: string; image?: string; name: string }

type InteractiveShadesProps = {
  heading: string
  description: string
  shades: Shade[]
  availabilityNote: string
  ctaLabel: string
  ctaUrl: string
}

/** Copy, swatches and photos come from the Homepage global; only the interaction lives here. */
export function InteractiveShades({
  heading,
  description,
  shades,
  availabilityNote,
  ctaLabel,
  ctaUrl,
}: InteractiveShadesProps) {
  const [activeId, setActiveId] = useState(shades[0]?.id)

  return (
    <div className="grid gap-16 min-[900px]:grid-cols-[40%_1fr] min-[900px]:items-center min-[900px]:gap-20">
      <div className="flex flex-col">
        <h2 className="mb-4 text-[clamp(3rem,5vw,4rem)] leading-[1.1] font-medium tracking-[-0.04em]">
          {heading}
        </h2>
        <p className="mb-8 max-w-[480px] text-xl leading-[1.5] text-muted">{description}</p>

        <div className="mb-10 grid grid-cols-2 gap-2">
          {shades.map((shade) => (
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
            {availabilityNote}
          </span>
          <Link
            className="inline-flex items-center gap-2 text-lg font-medium transition-colors hover:text-cta"
            href={ctaUrl}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>

      <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl bg-black/5">
        {shades.map((shade) => (
          /* eslint-disable-next-line @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */
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

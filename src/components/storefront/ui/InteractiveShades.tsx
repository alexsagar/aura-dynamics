'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { cn } from './cn'

export type Shade = {
  hex: string
  id: string
  image?: string
  name: string
  /** Filtered catalog link for this colour. */
  href: string
  inStock: boolean
}

type InteractiveShadesProps = {
  heading: string
  description: string
  shades: Shade[]
  availabilityNote: string
  ctaLabel: string
  ctaUrl: string
}

/**
 * Colours come from the published catalog (see get-homepage); photos from the
 * colour's variant or a Homepage → "Made in Every Shade" override. Only the
 * interaction lives here.
 */
export function InteractiveShades({
  heading,
  description,
  shades,
  availabilityNote,
  ctaLabel,
  ctaUrl,
}: InteractiveShadesProps) {
  const [activeId, setActiveId] = useState(shades[0]?.id)
  const active = shades.find((s) => s.id === activeId) ?? shades[0]

  return (
    <div className="grid gap-16 min-[900px]:grid-cols-[40%_1fr] min-[900px]:items-center min-[900px]:gap-20">
      <div className="flex min-w-0 flex-col">
        <h2 className="mb-4 text-[clamp(3rem,5vw,4rem)] leading-[1.1] font-medium tracking-[-0.04em]">
          {heading}
        </h2>
        <p className="mb-8 max-w-[480px] text-xl leading-[1.5] text-muted">{description}</p>

        <div className="mb-10 grid grid-cols-2 gap-2" role="group" aria-label="Colours">
          {shades.map((shade) => (
            <button
              aria-pressed={activeId === shade.id}
              className={cn(
                'flex min-w-0 cursor-pointer items-center gap-3 rounded-control p-2 text-left text-base font-medium transition',
                activeId === shade.id ? 'bg-black/5 text-foreground' : 'text-muted hover:bg-black/3',
              )}
              key={shade.id}
              onClick={() => setActiveId(shade.id)}
              type="button"
            >
              <span
                className={cn(
                  'size-6 flex-none rounded-full border border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-transform',
                  activeId === shade.id && 'scale-115 ring-2 ring-foreground ring-offset-2 ring-offset-background',
                )}
                style={{ background: shade.hex }}
              />
              <span className="min-w-0 truncate">{shade.name}</span>
              {!shade.inStock ? <span className="ml-auto flex-none text-xs text-muted">Sold out</span> : null}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6">
          {availabilityNote ? (
            <span className="text-sm font-semibold tracking-[0.05em] text-muted uppercase">{availabilityNote}</span>
          ) : null}
          {active ? (
            <Link
              className="inline-flex items-center gap-2 text-lg font-medium transition-colors hover:text-cta"
              href={active.href}
            >
              Shop {active.name} &rarr;
            </Link>
          ) : null}
          {ctaLabel && ctaUrl ? (
            <Link className="text-base text-muted transition-colors hover:text-foreground" href={ctaUrl}>
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <Link
        aria-label={active ? `Shop ${active.name}` : undefined}
        className="relative block aspect-4/5 w-full overflow-hidden rounded-3xl bg-black/5"
        href={active?.href ?? ctaUrl}
      >
        {shades.map((shade) =>
          shade.image ? (
            /* eslint-disable-next-line @next/next/no-img-element -- CMS-managed photography, no fixed dimensions */
            <img
              alt={`${shade.name} filament`}
              className={cn(
                'absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 ease-in-out',
                activeId === shade.id ? 'scale-100 opacity-100' : 'scale-102 opacity-0',
              )}
              key={shade.id}
              loading="lazy"
              src={shade.image}
            />
          ) : (
            // No photo yet: the colour itself, never a broken image.
            <div
              aria-hidden
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                activeId === shade.id ? 'opacity-100' : 'opacity-0',
              )}
              key={shade.id}
              style={{ background: shade.hex }}
            />
          ),
        )}
      </Link>
    </div>
  )
}

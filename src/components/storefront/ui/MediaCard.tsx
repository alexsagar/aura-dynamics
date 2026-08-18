import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowUpRight } from './icons'
import { cn } from './cn'
import { ProductImage } from './ProductImage'

type Ratio = 'feature' | 'landscape' | 'portrait' | 'square' | 'tall' | 'wide'

/** Copy at the top keeps a shallow scrim so the photograph stays the subject. */
const SCRIM = {
  bottom: 'bg-linear-to-b from-deep-forest/0 from-40% via-deep-forest/15 via-60% to-deep-forest/60',
  top: 'bg-linear-to-b from-deep-forest/50 via-deep-forest/10 via-45% to-deep-forest/0 to-70%',
}

/**
 * Photography-led editorial card: the image carries the message and a short
 * overlay sits on one edge. Used for hero mosaics and category features.
 */
export function MediaCard({
  /** Where the overlay copy sits: 'top' for hero/category features, 'bottom' otherwise. */
  align = 'bottom',
  /** Corner arrow marking the card as a link. */
  arrow,
  cta,
  href,
  imageAlt,
  imageUrl,
  kicker,
  ratio = 'landscape',
  size = 'md',
  subtitle,
  title,
}: {
  align?: 'bottom' | 'top'
  arrow?: boolean
  cta?: ReactNode
  href: string
  imageAlt?: string
  imageUrl?: string
  kicker?: string
  ratio?: Ratio
  size?: 'lg' | 'md' | 'sm'
  subtitle?: string
  title: string
}) {
  return (
    <div className="relative block h-full overflow-hidden rounded-media bg-[#e8ebe6] text-white">
      <ProductImage
        alt={imageAlt ?? title}
        // the placeholder caption would collide with the overlay copy
        className={cn(
          'h-full rounded-none [&>span]:hidden',
          // a shallow feature ratio leaves no room for the overlay on a phone
          size === 'lg' && 'max-md:aspect-4/5',
          size === 'sm' && 'max-md:aspect-4/3',
        )}
        ratio={ratio}
        sizes="(max-width: 768px) 100vw, 60vw"
        src={imageUrl}
      />
      <span aria-hidden="true" className={cn('absolute inset-0', SCRIM[align])} />
      <div
        className={cn(
          'absolute inset-x-0 flex flex-col items-start gap-2',
          align === 'top' ? 'top-0' : 'bottom-0',
          size === 'sm' ? 'p-4' : 'p-4 sm:p-6',
        )}
      >
        {kicker ? (
          <span className="text-micro font-medium tracking-[0.08em] text-white/80 uppercase">
            {kicker}
          </span>
        ) : null}
        <h3
          className={cn(
            'font-semibold tracking-[-0.02em] text-balance',
            size === 'lg' ? 'max-w-[18ch] text-h2 leading-[1.1]' : 'max-w-[22ch] text-h3 leading-[1.15]',
          )}
        >
          {/* Whole card is the link unless it carries its own CTA control. */}
          {cta ? title : <Link href={href}>{title}</Link>}
        </h3>
        {subtitle ? <p className="max-w-[36ch] text-sm text-white/85">{subtitle}</p> : null}
        {cta ? <div className="mt-2">{cta}</div> : null}
      </div>
      {arrow ? (
        <span aria-hidden="true" className="absolute right-5 bottom-5 text-white">
          <ArrowUpRight />
        </span>
      ) : null}
      {cta ? null : (
        <Link aria-label={title} className="absolute inset-0" href={href} tabIndex={-1} />
      )}
    </div>
  )
}

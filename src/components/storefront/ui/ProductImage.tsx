import Image from 'next/image'

import { cn } from './cn'

/** square 1:1 · portrait 4:5 · tall 3:4 · landscape 4:3 · feature 3:2 · wide 16:9 */
type Ratio = 'feature' | 'landscape' | 'portrait' | 'square' | 'tall' | 'wide'

const RATIOS: Record<Ratio, string> = {
  feature: 'aspect-3/2',
  landscape: 'aspect-4/3',
  portrait: 'aspect-4/5',
  square: 'aspect-square',
  tall: 'aspect-3/4',
  wide: 'aspect-video',
}

/**
 * Neutral placeholder until real product media is connected.
 * Pass `src` once media exists and it renders the real image instead.
 */
export function ProductImage({
  alt,
  src,
  ratio = 'square',
  className = '',
  sizes = '(max-width: 640px) 50vw, 320px',
  priority,
}: {
  alt: string
  src?: string
  ratio?: Ratio
  className?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-media',
        'bg-linear-to-b from-[#f2f4f0] to-[#e8ebe6] text-micro text-muted',
        RATIOS[ratio],
        className,
      )}
    >
      {src ? (
        // Media is served by Payload at /api/media/file/<name> on the same
        // Worker. The Cloudflare/OpenNext image optimizer can't re-fetch that
        // same-origin upstream (/_next/image → 404 "upstream response is
        // invalid"), so cards go unoptimized and load the media directly —
        // the same plain-URL strategy the product gallery already uses.
        <Image
          alt={alt}
          className="object-cover"
          fill
          priority={priority}
          sizes={sizes}
          src={src}
          unoptimized
        />
      ) : (
        <span aria-hidden="true">Image coming soon</span>
      )}
    </div>
  )
}

/**
 * Official Aura logo assets, used unmodified from public/brand/.
 *
 * Each supplied SVG is a 1:1 canvas with the artwork centred inside a large
 * transparent margin. The crop values below are the measured artwork bounding
 * box (as a fraction of the canvas), so the component can scale the file and
 * clip only the empty padding — the artwork itself is never recoloured,
 * redrawn, stretched or otherwise altered.
 */
import { cn } from './cn'

export type LogoVariant = 'full' | 'wordmark' | 'wordmark-offwhite' | 'symbol'

const ASSETS: Record<LogoVariant, { h: number; left: number; src: string; top: number; w: number }> =
  {
    full: { h: 0.2375, left: 0.1075, src: '/brand/aura-logo.svg', top: 0.4025, w: 0.7675 },
    symbol: { h: 0.235, left: 0.38, src: '/brand/aura-symbol.svg', top: 0.3825, w: 0.24 },
    wordmark: { h: 0.135, left: 0.245, src: '/brand/aura-wordmark.svg', top: 0.4325, w: 0.495 },
    'wordmark-offwhite': { h: 0.135, left: 0.245, src: '/brand/aura-wordmark-offwhite.svg', top: 0.4325, w: 0.495 },
  }

export function Logo({
  className = '',
  /** Rendered artwork height in px; width follows the asset's own aspect ratio. */
  height = 28,
  /** Use 'lazy' for a variant that is hidden at the current breakpoint. */
  loading = 'eager',
  title = 'Aura',
  variant = 'full',
}: {
  className?: string
  height?: number
  loading?: 'eager' | 'lazy'
  title?: string
  variant?: LogoVariant
}) {
  const asset = ASSETS[variant]
  const canvas = height / asset.h

  return (
    <span
      className={cn('block flex-none overflow-hidden', className)}
      style={{ height, width: Math.round(canvas * asset.w) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, no optimisation wanted */}
      <img
        alt={title}
        className="max-w-none"
        height={canvas}
        loading={loading}
        src={asset.src}
        style={{ marginLeft: -canvas * asset.left, marginTop: -canvas * asset.top }}
        width={canvas}
      />
    </span>
  )
}

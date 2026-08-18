import type { ReactNode } from 'react'

import { cn } from './cn'

export type BadgeTone = 'brand' | 'danger' | 'dark' | 'neutral' | 'success' | 'warning'

const TONES: Record<BadgeTone, string> = {
  brand: 'bg-accent text-accent-foreground border-success-border',
  danger: 'bg-destructive-surface text-destructive border-destructive-border',
  dark: 'bg-deep-forest text-deep-forest-foreground border-transparent',
  neutral: 'bg-background text-muted border-border',
  success: 'bg-success-surface text-success border-success-border',
  warning: 'bg-warning-surface text-warning border-warning-border',
}

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-[3px] text-micro leading-[1.4] font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Named badges used across the storefront, so tone choices stay consistent. */
export const StockBadge = ({ state }: { state: 'in' | 'low' | 'out' }) => (
  <Badge tone={state === 'in' ? 'success' : state === 'low' ? 'warning' : 'danger'}>
    {state === 'in' ? 'In Stock' : state === 'low' ? 'Low Stock' : 'Out of Stock'}
  </Badge>
)

export const NewBadge = () => <Badge tone="dark">New</Badge>
export const FeaturedBadge = () => <Badge tone="brand">Featured</Badge>
export const MaterialBadge = ({ name }: { name: string }) => <Badge tone="neutral">{name}</Badge>
export const PackagingBadge = ({ kind }: { kind: 'full-spool' | 'refill' }) => (
  <Badge tone="neutral">{kind === 'refill' ? 'Refill' : 'Full Spool'}</Badge>
)

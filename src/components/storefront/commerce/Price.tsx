import { discountNPR } from '@/lib/catalog/pricing'
import type React from 'react'
import { cn } from '../ui/cn'

const npr = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** NPR-only. `amount` is in rupees (not paisa). */
export function formatNPR(amount: number): string {
  return `Rs. ${npr.format(amount)}`
}

export function Price({
  amount,
  from,
  compareAt,
  className = '',
}: {
  amount: number
  /** Renders "From Rs. …" for variant-priced products. */
  from?: boolean
  /** Display-only original price, struck through. Ignored unless above `amount`. */
  compareAt?: number
  className?: string
}) {
  const discount = discountNPR(amount, compareAt)
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2 font-semibold tabular-nums', className)}>
      {from ? <span className="text-sm font-normal text-muted">From</span> : null}
      {discount ? (
        <s className="text-sm font-normal text-muted">
          <span className="sr-only">Original price </span>
          {formatNPR(discount.original)}
        </s>
      ) : null}
      <span>{formatNPR(amount)}</span>
      {discount ? <span className="text-xs font-semibold tracking-[0.04em] uppercase">{discount.percent}% off</span> : null}
    </span>
  )
}

/**
 * Amount that depends on CMS shipping settings. Never renders a number until
 * settings are verified: skeleton while loading, "Unavailable" on error.
 */
export function PendingAmount({
  status,
  children,
  className = '',
}: {
  status: 'loading' | 'error' | 'ready'
  children: React.ReactNode
  className?: string
}) {
  if (status === 'loading') {
    return (
      <span className={cn('inline-block h-[1em] w-16 animate-pulse rounded bg-black/10 align-middle', className)} data-pending-amount="loading">
        <span className="sr-only">Calculating…</span>
      </span>
    )
  }
  if (status === 'error') {
    return <span className="text-sm font-medium text-muted" data-pending-amount="error">Unavailable</span>
  }
  return <>{children}</>
}

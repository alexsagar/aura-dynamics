import { discountNPR } from '@/lib/catalog/pricing'
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

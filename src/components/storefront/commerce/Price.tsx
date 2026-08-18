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
  /** Original price, struck through. Sale logic is not implemented yet. */
  compareAt?: number
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-baseline gap-2 font-semibold tabular-nums', className)}>
      {from ? <span className="text-sm font-normal text-muted">From</span> : null}
      <span>{formatNPR(amount)}</span>
      {compareAt != null && compareAt > amount ? (
        <span className="text-sm font-normal text-muted line-through">{formatNPR(compareAt)}</span>
      ) : null}
    </span>
  )
}

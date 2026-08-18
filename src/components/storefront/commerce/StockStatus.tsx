import type { StockState } from '../types'

import { cn } from '../ui/cn'

const TONES: Record<StockState, { dot: string; text: string }> = {
  in: { dot: 'bg-primary', text: 'text-success' },
  low: { dot: 'bg-warning', text: 'text-warning' },
  out: { dot: 'bg-[#b8bec9]', text: 'text-muted' },
}

export function StockStatus({
  state,
  quantity,
  className = '',
}: {
  state: StockState
  /** Shown as "Only N left" when state is 'low'. */
  quantity?: number
  className?: string
}) {
  const label =
    state === 'out'
      ? 'Out of stock'
      : state === 'low'
        ? quantity != null
          ? `Only ${quantity} left`
          : 'Low stock'
        : 'In stock'

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', TONES[state].text, className)}>
      <span aria-hidden="true" className={cn('size-[7px] flex-none rounded-full', TONES[state].dot)} />
      {label}
    </span>
  )
}

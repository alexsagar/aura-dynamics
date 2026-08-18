import type { PackagingKind } from '../types'

const LABELS: Record<PackagingKind, { label: string; hint: string }> = {
  'full-spool': { label: 'Full Spool', hint: 'On a reusable spool' },
  refill: { label: 'Refill', hint: 'Spool not included' },
}

/**
 * Visual foundation only — selection logic lands with the product page.
 * ponytail: plain buttons with aria-pressed; swap to a radiogroup when it becomes stateful.
 */
export function PackagingOption({
  kind,
  selected,
  disabled,
}: {
  kind: PackagingKind
  selected?: boolean
  disabled?: boolean
}) {
  const { label, hint } = LABELS[kind]
  return (
    <button
      aria-pressed={selected ? 'true' : 'false'}
      className="flex min-h-14 min-w-29 cursor-pointer flex-col gap-0.5 rounded-control border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:not-disabled:border-[#c6cbd3] aria-pressed:border-primary aria-pressed:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      type="button"
    >
      <span className="font-medium">{label}</span>
      <span className="text-micro text-muted">{disabled ? 'Unavailable' : hint}</span>
    </button>
  )
}

export function PackagingSelector({
  options,
  selected,
}: {
  options: PackagingKind[]
  selected?: PackagingKind
}) {
  return (
    <div aria-label="Packaging" className="flex flex-wrap gap-2" role="group">
      {options.map((o) => (
        <PackagingOption key={o} kind={o} selected={o === selected} />
      ))}
    </div>
  )
}

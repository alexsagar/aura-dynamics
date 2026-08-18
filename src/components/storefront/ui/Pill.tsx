import Link from 'next/link'

import { cn } from './cn'

const PILL = cn(
  'inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4',
  'text-sm font-medium text-foreground transition-colors hover:not-disabled:border-[#ccd1d8]',
  'aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-white',
  'aria-[current=true]:border-foreground aria-[current=true]:bg-foreground aria-[current=true]:text-white',
)

const COLOR_PILL = 'text-micro tracking-[0.06em] uppercase'

/**
 * Category / filter pill. Rendered as a button for future client-side filtering,
 * or as a link when it should navigate. No filtering logic yet.
 */
export function CategoryPill({
  active,
  children,
  href,
}: {
  active?: boolean
  children: string
  href?: string
}) {
  if (href) {
    return (
      <Link aria-current={active ? 'true' : undefined} className={PILL} href={href}>
        {children}
      </Link>
    )
  }
  return (
    <button aria-pressed={active ? 'true' : 'false'} className={PILL} type="button">
      {children}
    </button>
  )
}

/** Colour explorer pill: visible dot + readable name (never colour alone). */
export function ColorPill({
  active,
  hex,
  href,
  name,
}: {
  active?: boolean
  hex: string
  href?: string
  name: string
}) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="size-3.5 flex-none rounded-full border border-foreground/20"
        style={{ background: hex }}
      />
      {name}
    </>
  )

  if (href) {
    return (
      <Link
        aria-current={active ? 'true' : undefined}
        className={cn(PILL, COLOR_PILL)}
        href={href}
      >
        {inner}
      </Link>
    )
  }
  return (
    <button
      aria-pressed={active ? 'true' : 'false'}
      className={cn(PILL, COLOR_PILL)}
      type="button"
    >
      {inner}
    </button>
  )
}

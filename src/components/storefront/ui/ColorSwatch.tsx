import type { FilamentColor } from '../types'

import { cn } from './cn'

type Props = {
  name: string
  hex: string
  size?: 'lg' | 'md'
  selected?: boolean
  disabled?: boolean
  /** Interactive swatches render a real button; display-only ones render a span. */
  interactive?: boolean
  className?: string
}

/** Diagonal strike marking an unavailable colour. */
const Unavailable = () => (
  <span
    aria-hidden="true"
    className="absolute -inset-px rounded-full bg-[linear-gradient(to_top_right,transparent_45%,currentColor_45%,currentColor_55%,transparent_55%)] text-muted"
  />
)

export function ColorSwatch({
  name,
  hex,
  size = 'md',
  selected,
  disabled,
  interactive,
  className = '',
}: Props) {
  const classes = cn(
    'relative rounded-full border border-[#111827]/18 p-0 transition-shadow',
    size === 'lg' ? 'size-8.5' : 'size-5.5',
    selected && 'ring-2 ring-primary ring-offset-2 ring-offset-surface',
    interactive ? 'cursor-pointer' : 'cursor-default',
    disabled && 'cursor-not-allowed opacity-40',
    className,
  )

  const style = { background: hex }

  if (!interactive) {
    return (
      <span className={classes} style={style} title={name}>
        <span className="sr-only">{name}</span>
      </span>
    )
  }

  return (
    <button
      aria-label={disabled ? `${name} — unavailable` : name}
      aria-pressed={selected ? 'true' : 'false'}
      className={classes}
      disabled={disabled}
      style={style}
      title={name}
      type="button"
    >
      {disabled ? <Unavailable /> : null}
    </button>
  )
}

export function ColorSwatchGroup({
  colors,
  max = 5,
  size,
  interactive,
}: {
  colors: FilamentColor[]
  max?: number
  size?: 'lg' | 'md'
  interactive?: boolean
}) {
  const shown = colors.slice(0, max)
  const rest = colors.length - shown.length

  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((c) => (
        <ColorSwatch
          disabled={c.available === false}
          hex={c.hex}
          interactive={interactive}
          key={c.name}
          name={c.name}
          size={size}
        />
      ))}
      {rest > 0 ? <span className="text-micro text-muted">+{rest}</span> : null}
    </div>
  )
}

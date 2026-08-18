import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import { cn } from './cn'

export type ButtonVariant =
  | 'accent'
  | 'destructive'
  | 'on-dark'
  | 'primary'
  | 'secondary'
  | 'tertiary'
export type ButtonSize = 'lg' | 'md' | 'sm'

type BaseProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  loading?: boolean
  children: ReactNode
  className?: string
}

const SIZES: Record<ButtonSize, string> = {
  lg: 'min-h-13 px-8 text-base',
  md: 'min-h-11 px-5 text-sm',
  sm: 'min-h-9 px-3 text-sm',
}

/**
 * Flow variants keep a solid fill at rest — a transparent pill over
 * photography reads as no button at all — and the expanding circle only
 * swaps which solid colour is showing. `--btn-sweep` / `--btn-sweep-text`
 * pair the incoming background with the text colour that stays legible on it.
 */
const FLOW: Record<string, string> = {
  accent: '[--btn-sweep:#ffffff] [--btn-sweep-text:#000000] border-lime bg-lime text-black',
  'on-dark':
    '[--btn-sweep:var(--color-deep-forest)] [--btn-sweep-text:#ffffff] border-white bg-white text-[#111111]',
  primary:
    '[--btn-sweep:var(--color-primary-text)] [--btn-sweep-text:#ffffff] border-deep-forest bg-deep-forest text-white',
  secondary:
    '[--btn-sweep:var(--color-deep-forest)] [--btn-sweep-text:#ffffff] border-border bg-surface text-foreground',
}

const STATIC: Record<string, string> = {
  destructive:
    'rounded-control border-destructive-border bg-surface text-destructive hover:not-disabled:bg-destructive-surface',
  tertiary: 'min-h-8 px-0 text-primary-text hover:not-disabled:text-deep-forest',
}

// ponytail: one polymorphic component instead of Button + LinkButton. `as="a"` covers links.
export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  block,
  loading,
  className = '',
  children,
  ...rest
}: BaseProps & { as?: T } & Omit<ComponentPropsWithoutRef<T>, keyof BaseProps | 'as'>) {
  const Tag = (as || 'button') as ElementType
  const isFlow = variant in FLOW

  return (
    <Tag
      className={cn(
        'group relative inline-flex cursor-pointer items-center justify-center gap-2 border border-transparent font-medium transition-colors',
        SIZES[size],
        block && 'w-full',
        isFlow
          ? cn(
            'overflow-hidden rounded-full border-[1.5px] px-6',
              'transition-[color,border-color] duration-600 ease-editorial',
              'hover:border-transparent hover:text-[var(--btn-sweep-text)]',
              'active:scale-95 motion-reduce:transition-none',
              FLOW[variant],
            )
          : STATIC[variant],
        'disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 data-loading:cursor-not-allowed data-loading:opacity-55',
        className,
      )}
      data-loading={loading ? 'true' : undefined}
      {...(Tag === 'button' ? { type: 'button' } : null)}
      {...rest}
    >
      {isFlow ? (
        <>
          <FlowArrow className="left-[-25%] group-hover:left-6" />

          <span className="relative z-2 -translate-x-3 transition-transform duration-800 ease-flow group-hover:translate-x-3 motion-reduce:transition-none">
            {children}
          </span>

          <span
            className={cn(
              'absolute top-1/2 left-1/2 z-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--btn-sweep)] opacity-0',
              'size-4 scale-0 transition-[transform,opacity] duration-800 ease-flow group-hover:opacity-100 group-hover:scale-[100] motion-reduce:transition-none',
            )}
          />

          <FlowArrow className="right-6 group-hover:right-[-25%]" />
        </>
      ) : (
        children
      )}
    </Tag>
  )
}

const FlowArrow = ({ className }: { className: string }) => (
  <svg
    aria-hidden="true"
    className={cn(
      'absolute z-9 size-4 transition-all duration-800 ease-overshoot motion-reduce:transition-none',
      className,
    )}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <line x1="5" x2="19" y1="12" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

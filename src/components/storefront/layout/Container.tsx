import type { ElementType, ReactNode } from 'react'

import { cn } from '../ui/cn'

export function Container({
  as: Tag = 'div',
  children,
  className = '',
  wide,
}: {
  as?: ElementType
  children: ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        wide ? 'max-w-wide' : 'max-w-standard',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function Section({
  children,
  className = '',
  id,
  tight,
  wide,
}: {
  children: ReactNode
  className?: string
  id?: string
  tight?: boolean
  wide?: boolean
}) {
  return (
    <section
      className={cn(
        tight ? 'py-8 sm:py-11 lg:py-16' : 'py-14 sm:py-18 lg:py-26',
        className,
      )}
      id={id}
    >
      <Container wide={wide}>{children}</Container>
    </section>
  )
}

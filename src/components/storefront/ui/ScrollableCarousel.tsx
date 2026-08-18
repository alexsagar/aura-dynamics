'use client'

import React, { useRef } from 'react'

import { cn } from './cn'

/** Width of one card in the track — apply to each child. */
export const carouselItem = 'w-[80vw] flex-none md:w-80'

const ARROW =
  'absolute top-[45%] z-10 hidden size-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition duration-300 ease-editorial hover:scale-105 hover:bg-background hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] md:flex'

export function ScrollableCarousel({
  children,
  className = '',
  trackClassName = '',
}: {
  children: React.ReactNode
  className?: string
  trackClassName?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.8 : 400
      scrollRef.current.scrollBy({
        behavior: 'smooth',
        left: direction === 'left' ? -scrollAmount : scrollAmount,
      })
    }
  }

  return (
    <div className={cn('relative w-full', className)}>
      <button aria-label="Scroll left" className={cn(ARROW, 'left-5')} onClick={() => scroll('left')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>

      <div
        className={cn(
          'no-scrollbar flex snap-x snap-mandatory gap-10 overflow-x-auto scroll-smooth px-[4vw] pb-4',
          trackClassName,
        )}
        ref={scrollRef}
      >
        {children}
      </div>

      <button aria-label="Scroll right" className={cn(ARROW, 'right-5')} onClick={() => scroll('right')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  )
}

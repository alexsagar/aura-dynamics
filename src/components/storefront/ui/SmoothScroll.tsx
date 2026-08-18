'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// ponytail: autoRaf handles the render loop, so this is just create + destroy.
export function SmoothScroll(): null {
  const pathname = usePathname()

  // Reset scroll to top when navigating to a new page
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      // Touch devices already have native momentum; hijacking it feels worse.
      syncTouch: false,
    })

    return () => lenis.destroy()
  }, [])

  return null
}

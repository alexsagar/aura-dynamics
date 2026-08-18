'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '../ui/Button'
import { Logo } from '../ui/Logo'
import { Container } from './Container'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: '/filaments', label: 'Filaments' },
      { href: '/3d-prints', label: '3D Prints' },
      { href: '/collections', label: 'Collections' },
    ],
  },
  {
    title: 'Materials',
    links: [
      { href: '/materials/pla', label: 'PLA' },
      { href: '/materials/petg', label: 'PETG' },
      { href: '/materials/tpu', label: 'TPU' },
      { href: '/materials/abs', label: 'ABS / ASA' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/shipping', label: 'Shipping Info' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/returns', label: 'Return Policy' },
    ],
  },
]

const SOCIAL_LINK =
  'flex size-12 items-center justify-center rounded-full border border-white/10 text-white/80 transition duration-400 hover:scale-105 hover:bg-white hover:text-black hover:border-transparent'

export function Footer() {
  const pathname = usePathname()
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/checkout')) {
    return null
  }

  return (
    <footer className="relative z-10 overflow-hidden bg-black pt-24 pb-60 text-white md:pt-40">
      <Container>
        <div className="relative z-2 mb-32 grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-32">
          {/* Left Column: Brand Statement & Newsletter */}
          <div className="flex flex-col items-start">
            <Logo height={40} loading="lazy" title="Aura" variant="wordmark-offwhite" />
            
            <h2 className="mt-12 text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-medium tracking-[-0.02em] text-white">
              Engineered perfectly for makers across Nepal.
            </h2>
            <p className="mt-6 max-w-[480px] text-lg text-white/60 leading-[1.6]">
              Numakers filaments and ready-stock 3D prints, shipped directly to your door with unmatched precision and reliability.
            </p>

            <div className="mt-12 flex w-full max-w-[440px] flex-col gap-4">
              <span className="text-sm font-semibold tracking-[0.1em] text-white/40 uppercase">
                Join our newsletter
              </span>
              <div className="flex h-14 w-full overflow-hidden rounded-[100px] border border-white/20 bg-white/5 transition-colors focus-within:border-lime focus-within:bg-white/10">
                <input
                  aria-label="Email address"
                  className="h-full flex-1 bg-transparent px-6 text-white outline-none placeholder:text-white/30"
                  placeholder="Enter your email"
                  type="email"
                />
                <button className="flex h-full items-center justify-center bg-white px-8 text-sm font-semibold text-black transition-colors hover:bg-lime">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Links Grid & Contact */}
          <div className="flex flex-col lg:pt-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-16 sm:grid-cols-3">
              {COLUMNS.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-6 text-sm font-semibold tracking-[0.1em] text-white/40 uppercase">
                    {col.title}
                  </h3>
                  <ul className="flex list-none flex-col gap-5">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          className="inline-block text-base text-white/80 transition-colors hover:text-lime"
                          href={l.href}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact and Socials (Full Width) */}
        <div className="mb-16 flex flex-col gap-8 border-t border-white/10 pt-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-[0.9375rem] leading-[1.8] text-white/60">
            <p>
              <strong className="font-semibold text-white">Aura Dynamics Pvt. Ltd.</strong>
            </p>
            <p>123 Maker Street, Kathmandu, Nepal</p>
            <p>+977 1-2345678</p>
            <a className="transition-colors hover:text-white" href="mailto:hello@auradynamics.com">
              hello@auradynamics.com
            </a>
          </div>

          <div className="flex gap-3">
            <a aria-label="Instagram" className={SOCIAL_LINK} href="https://instagram.com" rel="noreferrer" target="_blank">
              <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><rect height="20" rx="5" ry="5" width="20" x="2" y="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a aria-label="Facebook" className={SOCIAL_LINK} href="https://facebook.com" rel="noreferrer" target="_blank">
              <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a aria-label="Twitter" className={SOCIAL_LINK} href="https://twitter.com" rel="noreferrer" target="_blank">
              <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-2 flex flex-col items-start gap-4 border-t border-white/10 pt-8 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <span>© {new Date().getFullYear()} Aura Dynamics. All rights reserved.</span>
          <div className="flex gap-8">
            <Link className="transition-colors hover:text-white" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="transition-colors hover:text-white" href="/terms">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>

      {/* Massive Brand Watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-5px] left-1/2 z-1 w-full -translate-x-1/2 whitespace-nowrap bg-linear-to-b from-white/6 to-transparent bg-clip-text text-center text-[clamp(3rem,15vw,15rem)] leading-[0.8] font-extrabold tracking-[-0.04em] text-transparent select-none"
      >
        AURA DYNAMICS
      </div>
    </footer>
  )
}

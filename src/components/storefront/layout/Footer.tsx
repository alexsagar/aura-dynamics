'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import type { FooterViewModel } from '@/lib/site/get-site-globals'
import { Logo } from '../ui/Logo'
import { Container } from './Container'

const SOCIAL_LINK =
  'flex size-12 items-center justify-center rounded-full border border-white/10 text-white/80 transition duration-400 hover:scale-105 hover:bg-white hover:text-black hover:border-transparent'

/** Icon rendering stays code-controlled; CMS only supplies platform + URL. */
const SOCIAL_ICONS: Record<string, ReactNode> = {
  instagram: (
    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><rect height="20" rx="5" ry="5" width="20" x="2" y="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
  ),
  facebook: (
    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ),
  twitter: (
    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
  ),
  youtube: (
    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><rect height="15" rx="4" width="20" x="2" y="4.5"/><path d="M10 9.5l5 3-5 3z"/></svg>
  ),
  tiktok: (
    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"/></svg>
  ),
}

export function Footer({ data }: { data: FooterViewModel }) {
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
              {data.brandHeading}
            </h2>
            <p className="mt-6 max-w-[480px] text-lg text-white/60 leading-[1.6]">
              {data.brandCopy}
            </p>

            <div className="mt-12 flex w-full max-w-[440px] flex-col gap-4">
              <span className="text-sm font-semibold tracking-[0.1em] text-white/40 uppercase">
                {data.newsletterHeading}
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
              {data.columns.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-6 text-sm font-semibold tracking-[0.1em] text-white/40 uppercase">
                    {col.title}
                  </h3>
                  <ul className="flex list-none flex-col gap-5">
                    {col.links.map((l) => (
                      <li key={l.url}>
                        <Link
                          className="inline-block text-base text-white/80 transition-colors hover:text-lime"
                          href={l.url}
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
        {(data.contact.companyName || data.contact.address || data.contact.phone || data.contact.email || data.socialLinks.length > 0) && (
          <div className="mb-16 flex flex-col gap-8 border-t border-white/10 pt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-[0.9375rem] leading-[1.8] text-white/60">
              {data.contact.companyName ? (
                <p>
                  <strong className="font-semibold text-white">{data.contact.companyName}</strong>
                </p>
              ) : null}
              {data.contact.address ? <p>{data.contact.address}</p> : null}
              {data.contact.phone ? <p>{data.contact.phone}</p> : null}
              {data.contact.email ? (
                <a className="transition-colors hover:text-white" href={`mailto:${data.contact.email}`}>
                  {data.contact.email}
                </a>
              ) : null}
            </div>

            {data.socialLinks.length > 0 ? (
              <div className="flex gap-3">
                {data.socialLinks.map((s) => (
                  <a
                    aria-label={s.platform}
                    className={SOCIAL_LINK}
                    href={s.url}
                    key={s.platform}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {SOCIAL_ICONS[s.platform]}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Bottom Bar */}
        <div className="relative z-2 flex flex-col items-start gap-4 border-t border-white/10 pt-8 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <span>© {new Date().getFullYear()} {data.copyright}</span>
          <div className="flex gap-8">
            {data.legalLinks.map((l) => (
              <Link className="transition-colors hover:text-white" href={l.url} key={l.url}>
                {l.label}
              </Link>
            ))}
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

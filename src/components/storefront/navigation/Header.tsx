'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../../../providers/CartProvider'
import type { HeaderViewModel } from '@/lib/site/get-site-globals'
import { Container } from '../layout/Container'
import { CartIcon, MenuIcon, SearchIcon, UserIcon } from '../ui/icons'
import { Logo } from '../ui/Logo'

type NavLink = { href: string; label: string }

/* The bar collapses at 900px — between Tailwind's md and lg stops. */
const ICON_BTN =
  'relative inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent bg-black/3 px-2 text-sm font-medium text-foreground transition duration-300 ease-editorial hover:scale-105 hover:bg-black/8'

/** Official logo: full horizontal lockup on desktop, symbol only when the bar is tight. */
export const Wordmark = () => (
  <Link aria-label="Aura — home" className="inline-flex items-center" href="/">
    <Logo className="max-[899px]:hidden" height={26} variant="full" />
    <Logo className="min-[900px]:hidden" height={26} loading="lazy" variant="symbol" />
  </Link>
)

/** Navigates to the /search page (server-rendered results, shareable ?q= URL). */
export const SearchTrigger = () => (
  <Link aria-label="Search" className={ICON_BTN} href="/search">
    <SearchIcon />
    <span className="hidden min-[900px]:inline">Search</span>
  </Link>
)

export const CartIndicator = ({ count = 0, onClick }: { count?: number; onClick: () => void }) => (
  <button
    aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
    className={ICON_BTN}
    onClick={onClick}
    type="button"
  >
    <CartIcon />
    {count > 0 ? (
      <span
        aria-hidden="true"
        className="absolute top-0.5 right-0 h-[17px] min-w-[17px] rounded-full bg-cta px-1 text-center text-[11px] leading-[17px] text-white"
      >
        {count > 9 ? '9+' : count}
      </span>
    ) : null}
  </button>
)

/**
 * Mobile menu uses a native <details> disclosure: keyboard accessible, no client JS.
 * ponytail: convert to a client component only if it needs close-on-navigate or a focus trap.
 */
const MobileNav = ({ navLinks }: { navLinks: NavLink[] }) => (
  <details className="min-[900px]:hidden">
    <summary className="inline-flex size-10 cursor-pointer list-none items-center justify-center rounded-control [&::-webkit-details-marker]:hidden">
      <MenuIcon />
      <span className="sr-only">Menu</span>
    </summary>
    <nav
      aria-label="Mobile"
      className="absolute inset-x-0 top-[calc(100%+12px)] rounded-3xl border border-white/40 bg-white/90 px-6 py-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] backdrop-blur-[24px]"
    >
      {navLinks.map((l) => (
        <Link
          className="block border-b border-black/5 py-3 text-lg font-medium text-[#111] last:border-b-0"
          href={l.href}
          key={l.href}
        >
          {l.label}
        </Link>
      ))}
      <Link className="block py-3 text-lg font-medium text-[#111]" href="/account">
        Account
      </Link>
    </nav>
  </details>
)

export function Header({ data }: { data: HeaderViewModel }) {
  const pathname = usePathname()
  const { cartItems, openCart } = useCart()
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const navLinks: NavLink[] = data.navLinks.map((l) => ({ href: l.url, label: l.label }))

  if (pathname.startsWith('/checkout')) {
    return null
  }

  return (
    <header className="fixed top-6 left-1/2 z-40 w-[calc(100%-48px)] max-w-[1000px] -translate-x-1/2 rounded-full border border-white/40 bg-white/70 px-2 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-[24px] backdrop-saturate-180 transition duration-400 ease-editorial">
      <Container>
        <div className="flex min-h-14 items-center justify-between gap-3 min-[900px]:gap-6">
          <MobileNav navLinks={navLinks} />
          <Wordmark />

          <nav
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center gap-8 min-[900px]:flex"
          >
            {navLinks.map((l) => (
              <Link
                className="group relative py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
                href={l.href}
                key={l.href}
              >
                {l.label}
                <span className="absolute bottom-0 left-1/2 h-0.5 w-full -translate-x-1/2 scale-x-0 rounded-sm bg-foreground transition-transform duration-300 ease-editorial group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <SearchTrigger />
            <Link aria-label="Account" className={ICON_BTN} href="/account">
              <UserIcon />
            </Link>
            <CartIndicator count={cartCount} onClick={openCart} />
          </div>
        </div>
      </Container>
    </header>
  )
}

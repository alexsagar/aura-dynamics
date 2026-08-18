// ponytail: three hand-rolled 16px strokes instead of an icon dependency.
const base = {
  'aria-hidden': true,
  fill: 'none',
  height: 18,
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.6,
  viewBox: '0 0 24 24',
  width: 18,
}

export const SearchIcon = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
)

export const UserIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
)

export const CartIcon = () => (
  <svg {...base}>
    <path d="M4 5h2l1.6 10.2A2 2 0 0 0 9.6 17h8.2" />
    <path d="M6.4 8h13.2l-1.4 6.2H7.4" />
    <circle cx="10" cy="20" r="1.2" />
    <circle cx="18" cy="20" r="1.2" />
  </svg>
)

export const ArrowUpRight = () => (
  <svg {...base} height={22} width={22}>
    <path d="M8 16 16 8M9.5 8H16v6.5" />
  </svg>
)

/* benefit marks — lightweight line graphics, no illustration library */
export const BoxIcon = () => (
  <svg {...base} height={24} width={24}>
    <path d="M12 3.5 20 8v8l-8 4.5L4 16V8z" />
    <path d="M4 8l8 4.5L20 8M12 12.5V21" />
  </svg>
)

export const SpoolIcon = () => (
  <svg {...base} height={24} width={24}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const ChatIcon = () => (
  <svg {...base} height={24} width={24}>
    <path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.6-.35L5 20.5l1.2-3.2A6.3 6.3 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z" />
  </svg>
)

export const MenuIcon = () => (
  <svg {...base} height={20} width={20}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

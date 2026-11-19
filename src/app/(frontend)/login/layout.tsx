import type { Metadata } from 'next'

// Transactional page: keep out of the index even if robots.txt is ignored.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

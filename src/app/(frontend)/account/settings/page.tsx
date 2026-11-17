import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Container } from '@/components/storefront/layout/Container'
import { PasswordForm, ProfileForm } from './SettingsForms'

export const metadata: Metadata = {
  title: 'Account settings',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AccountSettingsPage() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.collection !== 'customers') redirect('/login')
  const { name, phone } = user as { name?: string | null; phone?: string | null }

  const card = 'rounded-2xl border border-black/10 bg-white p-6 md:p-8'
  const heading = 'mb-6 text-2xl font-medium tracking-[-0.02em]'
  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Container>
        <div className="mb-12 border-b border-black/10 pb-10 md:mb-16">
          <Link href="/account" className="text-sm font-semibold text-muted hover:text-black">
            ← Back to dashboard
          </Link>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.02em] md:text-5xl">Account settings</h1>
        </div>

        <div className="grid max-w-2xl gap-12">
          <section aria-labelledby="profile" className={card}>
            <h2 id="profile" className={heading}>
              Your details
            </h2>
            <p className="mb-6 text-sm text-muted">
              Email: <span className="font-medium break-all text-black">{user.email}</span>. To change
              your email address, contact{' '}
              <a href="mailto:support@printwithaura.com" className="font-semibold text-black underline">
                support@printwithaura.com
              </a>
              .
            </p>
            <ProfileForm name={name ?? ''} phone={phone ?? ''} />
          </section>

          <section aria-labelledby="password" className={card}>
            <h2 id="password" className={heading}>
              Change password
            </h2>
            <PasswordForm email={user.email} />
            <p className="mt-6 text-sm text-muted">
              Forgot your current password?{' '}
              <Link href="/forgot-password" className="font-semibold text-black hover:underline">
                Reset it by email
              </Link>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}

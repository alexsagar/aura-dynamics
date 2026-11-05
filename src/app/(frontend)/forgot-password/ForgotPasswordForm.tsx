'use client'

import React, { useState } from 'react'
import { Button } from '@/components/storefront/ui/Button'

// Same reply whether or not the account exists, so the form can't be used to probe for accounts.
const SENT_MESSAGE =
  "If an account exists for that email, we've sent a link to reset your password. It expires in one hour."

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/customers/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.')
        setStatus('error')
        return
      }
      setStatus('sent')
    } catch {
      setError('An error occurred. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-center bg-background px-8 pt-32 pb-20">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-4xl font-medium tracking-[-0.02em]">Forgot password.</h1>
        <p className="mb-10 text-lg text-muted">Enter your account email and we'll send you a reset link.</p>

        {status === 'sent' ? (
          <div role="status" className="rounded-xl border border-black/10 bg-white p-4 text-sm">
            {SENT_MESSAGE}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label htmlFor="forgot-email" className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black"
                required
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="mt-4" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}

        <div className="mt-12 text-center text-muted">
          Remembered it?{' '}
          <a href="/login" className="font-semibold text-black hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}

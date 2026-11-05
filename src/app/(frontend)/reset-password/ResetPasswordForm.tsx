'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/storefront/ui/Button'
import { useAuth } from '@/providers/AuthProvider'

const INVALID_LINK = 'This reset link is invalid or has expired. Please request a new one.'

export function ResetPasswordForm() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // The emailed link is /reset-password#token=…: the fragment never reaches the
  // server, logs or Referer. Read it once, then drop it from the address bar and history.
  // The ref keeps a second effect run (React Strict Mode) from reading the already-cleared hash.
  const readToken = useRef<string | null>(null)
  useEffect(() => {
    if (readToken.current === null) {
      readToken.current = new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
      if (window.location.hash) window.history.replaceState(null, '', window.location.pathname)
    }
    setToken(readToken.current)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = (await res.json().catch(() => ({}))) as any
      if (res.ok && data.user) {
        setUser(data.user)
        router.push('/account')
        router.refresh()
      } else if (res.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.')
      } else {
        setError(INVALID_LINK)
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-center bg-background px-8 pt-32 pb-20">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-4xl font-medium tracking-[-0.02em]">Choose a new password.</h1>
        <p className="mb-10 text-lg text-muted">You'll be signed in once it's saved.</p>

        {token === '' ? (
          <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {INVALID_LINK}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label htmlFor="reset-password" className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                New password
              </label>
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="reset-confirm" className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                Confirm password
              </label>
              <input
                id="reset-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black"
                required
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="mt-4" disabled={isLoading || token === null}>
              {isLoading ? 'Saving...' : 'Save password'}
            </Button>
          </form>
        )}

        <div className="mt-12 text-center text-muted">
          <a href="/forgot-password" className="font-semibold text-black hover:underline">
            Request a new link
          </a>
        </div>
      </div>
    </div>
  )
}

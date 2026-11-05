'use client'

import React, { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/storefront/ui/Button'

export function SignOutButton() {
  const { setUser } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setError('')
    try {
      const res = await fetch('/api/customers/logout', { method: 'POST' })
      if (!res.ok) throw new Error('logout failed')
      setUser(null)
      // A full document navigation (not router.push) drops Next's in-memory
      // router cache, so Back cannot restore the signed-in account view; the
      // page itself is no-store, so going back re-requests it and redirects.
      window.location.replace('/login')
    } catch {
      setError('Sign out failed. Please try again.')
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <Button onClick={handleLogout} variant="secondary" disabled={isLoggingOut}>
        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

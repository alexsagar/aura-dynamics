'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/storefront/ui/Button'

export function SignOutButton() {
  const { setUser } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/customers/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
      router.refresh()
    } catch {
      console.error('Logout failed')
      setIsLoggingOut(false)
    }
  }

  return (
    <Button onClick={handleLogout} variant="secondary" disabled={isLoggingOut}>
      {isLoggingOut ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type User = {
  id: string | number
  email: string
  name?: string
  collection?: string
  cart?: any
}

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch the current user on mount
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/customers/me')
        if (res.ok) {
          const data = await res.json() as { user: User }
          if (data && data.user) {
            setUser(data.user)
          }
        }
      } catch (e) {
        console.error('Failed to fetch user session', e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

'use client'

import React from 'react'
import { AuthProvider } from './AuthProvider'
import { CartProvider } from './CartProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  )
}

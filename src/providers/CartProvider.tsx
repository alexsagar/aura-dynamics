'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'

export type CartItem = {
  product: string | any
  quantity: number
  id?: string
}

type CartContextType = {
  cartItems: CartItem[]
  addItem: (product: any, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isLoading: boolean
  cartTotal: number
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  isLoading: true,
  cartTotal: 0,
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  // Load cart from Payload if logged in, or LocalStorage if guest
  useEffect(() => {
    if (authLoading) return

    if (user) {
      // User is logged in, use their payload cart
      setCartItems(user.cart?.items || [])
      setIsLoading(false)
    } else {
      // Guest, load from local storage
      const localCart = localStorage.getItem('aura-guest-cart')
      if (localCart) {
        try {
          setCartItems(JSON.parse(localCart))
        } catch (e) {
          console.error('Failed to parse guest cart')
        }
      }
      setIsLoading(false)
    }
  }, [user, authLoading])

  // Sync cart to backend or local storage whenever it changes
  const saveCart = async (items: CartItem[]) => {
    setCartItems(items)
    
    if (user) {
      // Sync to Payload backend
      try {
        await fetch(`/api/customers/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cart: {
              items: items.map(item => ({
                product: typeof item.product === 'object' ? item.product.id : item.product,
                quantity: item.quantity
              }))
            }
          })
        })
      } catch (error) {
        console.error('Failed to sync cart to backend', error)
      }
    } else {
      // Sync to local storage
      localStorage.setItem('aura-guest-cart', JSON.stringify(items))
    }
  }

  const addItem = async (product: any, quantity: number) => {
    const productId = typeof product === 'object' ? product.id : product
    const existingIndex = cartItems.findIndex(
      (item) => (typeof item.product === 'object' ? item.product.id : item.product) === productId
    )

    let newItems = [...cartItems]
    if (existingIndex > -1) {
      newItems[existingIndex].quantity += quantity
    } else {
      newItems.push({ product, quantity })
    }

    await saveCart(newItems)
    openCart() // Auto-open sidebar on add
  }

  const removeItem = async (productId: string) => {
    const newItems = cartItems.filter(
      (item) => (typeof item.product === 'object' ? item.product.id : item.product) !== productId
    )
    await saveCart(newItems)
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(productId)
    }
    
    const newItems = cartItems.map((item) => {
      const pid = typeof item.product === 'object' ? item.product.id : item.product
      if (pid === productId) {
        return { ...item, quantity }
      }
      return item
    })
    
    await saveCart(newItems)
  }

  const clearCart = async () => {
    await saveCart([])
  }

  // Calculate cart total (this assumes 'product' is populated with price data. If it's just IDs, you need to resolve them).
  // For the sake of this mock/UI phase, we will calculate based on populated prices.
  const cartTotal = cartItems.reduce((total, item) => {
    const price = typeof item.product === 'object' && item.product.prices && item.product.prices.length > 0
      ? item.product.prices[0].amount || 0
      : 0; // Fallback to 0 if we only have an ID
    return total + (price * item.quantity)
  }, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading: isLoading || authLoading,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

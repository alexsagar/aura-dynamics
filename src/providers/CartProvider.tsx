'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'

export type CartItem = {
  id: string
  productId: string | number
  variantId: string | number
  slug?: string
  title: string
  variantTitle?: string
  sku?: string
  color?: string
  hexColor?: string
  unitPrice: number
  image?: string
  quantity: number
  maxStock: number
  product?: any
}

type CartContextType = {
  cartItems: CartItem[]
  addItem: (productOrParams: any, quantity?: number, variant?: any) => Promise<void>
  removeItem: (idOrProductId: string | number) => Promise<void>
  updateQuantity: (idOrProductId: string | number, quantity: number) => Promise<void>
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

function normalizeStoredItem(rawItem: any): CartItem {
  // If already normalized
  if (rawItem.id && typeof rawItem.unitPrice === 'number') {
    return {
      ...rawItem,
      maxStock: typeof rawItem.maxStock === 'number' ? rawItem.maxStock : 999,
    }
  }

  // Handle legacy items
  const product = typeof rawItem.product === 'object' ? rawItem.product : null
  const productId = product?.id || rawItem.productId || rawItem.product || 'item'
  const variantId = rawItem.variantId || 'default'
  const price =
    typeof rawItem.unitPrice === 'number'
      ? rawItem.unitPrice
      : product?.priceInNPR ??
        product?.prices?.[0]?.amount ??
        0

  return {
    id: `${productId}-${variantId}`,
    productId,
    variantId,
    slug: product?.slug || rawItem.slug || '',
    title: product?.title || rawItem.title || 'Product',
    variantTitle: rawItem.variantTitle || product?.title || 'Product',
    sku: rawItem.sku || '',
    color: rawItem.color || '',
    hexColor: rawItem.hexColor || '',
    unitPrice: price,
    image: rawItem.image || product?.images?.[0]?.url || '',
    quantity: rawItem.quantity || 1,
    maxStock: rawItem.maxStock || 999,
    product: rawItem.product,
  }
}

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
      const items = (user.cart?.items || []).map(normalizeStoredItem)
      setCartItems(items)
      setIsLoading(false)
    } else {
      const localCart = localStorage.getItem('aura-guest-cart')
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart)
          if (Array.isArray(parsed)) {
            setCartItems(parsed.map(normalizeStoredItem))
          }
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
      try {
        await fetch(`/api/customers/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cart: {
              items: items.map((item) => ({
                product: item.productId,
                quantity: item.quantity,
              })),
            },
          }),
        })
      } catch (error) {
        console.error('Failed to sync cart to backend', error)
      }
    } else {
      localStorage.setItem('aura-guest-cart', JSON.stringify(items))
    }
  }

  const addItem = async (
    productOrParams: any,
    maybeQuantity?: number,
    maybeVariant?: any
  ) => {
    let product: any
    let variant: any
    let quantity: number

    if (
      productOrParams &&
      typeof productOrParams === 'object' &&
      'product' in productOrParams &&
      !('title' in productOrParams && 'productType' in productOrParams)
    ) {
      product = productOrParams.product
      variant = productOrParams.variant
      quantity = productOrParams.quantity ?? 1
    } else {
      product = productOrParams
      quantity = maybeQuantity ?? 1
      variant = maybeVariant
    }

    const productId = typeof product === 'object' ? product.id : product
    const variantId = variant?.id || 'default'
    const lineId = `${productId}-${variantId}`

    const optionData = variant?.options?.[0]
    const colorLabel = optionData?.label || optionData?.colorFamily || ''
    const hex = optionData?.hexColor || ''
    const sku = variant?.sku || ''
    const title = product?.title || 'Product'
    const variantTitle = variant?.title || title
    const maxStock =
      typeof variant?.inventory === 'number'
        ? variant.inventory
        : typeof product?.inventory === 'number'
          ? product.inventory
          : 999

    const unitPrice =
      variant?.priceInNPR ??
      variant?.prices?.[0]?.amount ??
      product?.priceInNPR ??
      product?.prices?.[0]?.amount ??
      0

    let image = ''
    if (variant?.images?.[0]?.url) {
      image = variant.images[0].url
    } else if (product?.images?.[0]?.url) {
      image = product.images[0].url
    }

    // Do not add if stock is 0
    if (maxStock <= 0) {
      return
    }

    // Match exact variant
    const existingIndex = cartItems.findIndex((item) => item.id === lineId)

    let newItems = [...cartItems]
    if (existingIndex > -1) {
      const currentQty = newItems[existingIndex].quantity
      // Never exceed inventory
      const newQty = Math.min(maxStock, currentQty + quantity)
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newQty,
        maxStock,
        unitPrice,
        image: image || newItems[existingIndex].image,
      }
    } else {
      const initialQty = Math.min(maxStock, Math.max(1, quantity))
      newItems.push({
        id: lineId,
        productId,
        variantId,
        slug: product?.slug,
        title,
        variantTitle,
        sku,
        color: colorLabel,
        hexColor: hex,
        unitPrice,
        image,
        quantity: initialQty,
        maxStock,
        product,
      })
    }

    await saveCart(newItems)
    openCart()
  }

  const removeItem = async (idOrProductId: string | number) => {
    const key = String(idOrProductId)
    const newItems = cartItems.filter(
      (item) => item.id !== key && String(item.productId) !== key && String(item.variantId) !== key
    )
    await saveCart(newItems)
  }

  const updateQuantity = async (idOrProductId: string | number, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(idOrProductId)
    }

    const key = String(idOrProductId)
    const newItems = cartItems.map((item) => {
      if (item.id === key || String(item.productId) === key || String(item.variantId) === key) {
        const validQuantity = Math.min(item.maxStock, Math.max(1, quantity))
        return { ...item, quantity: validQuantity }
      }
      return item
    })

    await saveCart(newItems)
  }

  const clearCart = async () => {
    await saveCart([])
  }

  const cartTotal = cartItems.reduce((total, item) => {
    const price = typeof item.unitPrice === 'number' ? item.unitPrice : 0
    return total + price * item.quantity
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
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

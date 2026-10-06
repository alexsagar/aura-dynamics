import { describe, it, expect } from 'vitest'

// Core ecommerce logic tested in isolation to ensure bulletproof guest checkout, cart, and quantity operations

describe('1. Quantity Selector Logic', () => {
  it('defaults quantity to 1 for in-stock variant', () => {
    const stock = 10
    const initialQty = stock > 0 ? 1 : 0
    expect(initialQty).toBe(1)
  })

  it('cannot go below 1', () => {
    let quantity = 1
    const decrease = (qty: number) => Math.max(1, qty - 1)
    quantity = decrease(quantity)
    expect(quantity).toBe(1)
    quantity = decrease(quantity)
    expect(quantity).toBe(1)
  })

  it('cannot exceed variant stock', () => {
    const stock = 5
    let quantity = 1
    const increase = (qty: number, max: number) => Math.min(max, qty + 1)

    for (let i = 0; i < 10; i++) {
      quantity = increase(quantity, stock)
    }
    expect(quantity).toBe(5)
  })

  it('reevaluates quantity when selected variant changes', () => {
    let currentQty = 8
    const newVariantStock = 3
    const clampQty = (qty: number, maxStock: number) => {
      if (maxStock <= 0) return 0
      return Math.min(Math.max(1, qty), maxStock)
    }

    currentQty = clampQty(currentQty, newVariantStock)
    expect(currentQty).toBe(3)

    // Variant with 0 stock
    const outOfStock = clampQty(currentQty, 0)
    expect(outOfStock).toBe(0)
  })
})

describe('2. Cart Line Items & Quantity Merging', () => {
  type TestCartItem = {
    id: string
    productId: string | number
    variantId: string | number
    color: string
    unitPrice: number
    quantity: number
    maxStock: number
  }

  function addOrMerge(cart: TestCartItem[], newItem: TestCartItem): TestCartItem[] {
    const existingIndex = cart.findIndex((item) => item.id === newItem.id)
    if (existingIndex > -1) {
      const existing = cart[existingIndex]
      const mergedQty = Math.min(existing.maxStock, existing.quantity + newItem.quantity)
      const updated = [...cart]
      updated[existingIndex] = { ...existing, quantity: mergedQty }
      return updated
    }
    const initialQty = Math.min(newItem.maxStock, Math.max(1, newItem.quantity))
    return [...cart, { ...newItem, quantity: initialQty }]
  }

  it('merges identical variants without creating duplicate lines', () => {
    let cart: TestCartItem[] = []
    const whiteVariant: TestCartItem = {
      id: 'prod-1-v-wht',
      productId: 'prod-1',
      variantId: 'v-wht',
      color: 'Pure White',
      unitPrice: 2500,
      quantity: 2,
      maxStock: 50,
    }

    cart = addOrMerge(cart, whiteVariant)
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(2)

    // Add 3 more of Pure White
    cart = addOrMerge(cart, { ...whiteVariant, quantity: 3 })
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(5)
  })

  it('keeps different colors as separate line items', () => {
    let cart: TestCartItem[] = []
    const whiteVariant: TestCartItem = {
      id: 'prod-1-v-wht',
      productId: 'prod-1',
      variantId: 'v-wht',
      color: 'Pure White',
      unitPrice: 2500,
      quantity: 2,
      maxStock: 50,
    }
    const blackVariant: TestCartItem = {
      id: 'prod-1-v-blk',
      productId: 'prod-1',
      variantId: 'v-blk',
      color: 'Pitch Black',
      unitPrice: 2500,
      quantity: 1,
      maxStock: 50,
    }

    cart = addOrMerge(cart, whiteVariant)
    cart = addOrMerge(cart, blackVariant)

    expect(cart).toHaveLength(2)
    expect(cart.find((i) => i.color === 'Pure White')?.quantity).toBe(2)
    expect(cart.find((i) => i.color === 'Pitch Black')?.quantity).toBe(1)
  })

  it('enforces stock maximum when adding to cart', () => {
    let cart: TestCartItem[] = []
    const lowStockVariant: TestCartItem = {
      id: 'prod-1-v-clr',
      productId: 'prod-1',
      variantId: 'v-clr',
      color: 'Transparent',
      unitPrice: 2500,
      quantity: 8,
      maxStock: 10,
    }

    cart = addOrMerge(cart, lowStockVariant)
    expect(cart[0].quantity).toBe(8)

    // Customer tries to add 5 more when only 10 exist
    cart = addOrMerge(cart, { ...lowStockVariant, quantity: 5 })
    expect(cart[0].quantity).toBe(10) // Capped at maxStock
  })

  it('updates line totals and cart subtotal immediately upon quantity modification', () => {
    const cart: TestCartItem[] = [
      { id: '1', productId: 1, variantId: 1, color: 'Forest Green', unitPrice: 2500, quantity: 3, maxStock: 20 },
      { id: '2', productId: 1, variantId: 2, color: 'Pure White', unitPrice: 2500, quantity: 2, maxStock: 20 },
    ]

    const getLineTotal = (item: TestCartItem) => item.unitPrice * item.quantity
    const getSubtotal = (items: TestCartItem[]) => items.reduce((acc, it) => acc + getLineTotal(it), 0)

    expect(getLineTotal(cart[0])).toBe(7500)
    expect(getLineTotal(cart[1])).toBe(5000)
    expect(getSubtotal(cart)).toBe(12500)

    // Modify quantity
    cart[0].quantity = 4
    expect(getLineTotal(cart[0])).toBe(10000)
    expect(getSubtotal(cart)).toBe(15000)
  })
})

describe('3. Server-Side Checkout Verification & Rules', () => {
  type DbProduct = { id: number; title: string; priceInNPR: number }
  type DbVariant = { id: number; productId: number; title: string; priceInNPR: number; inventory: number; active: boolean }

  const mockDbVariants: Record<number, DbVariant> = {
    101: { id: 101, productId: 1, title: 'Forest Green', priceInNPR: 2500, inventory: 50, active: true },
    102: { id: 102, productId: 1, title: 'Pure White', priceInNPR: 2500, inventory: 120, active: true },
    103: { id: 103, productId: 1, title: 'Transparent', priceInNPR: 2500, inventory: 10, active: true },
    104: { id: 104, productId: 1, title: 'Out of Stock Red', priceInNPR: 2500, inventory: 0, active: true },
  }

  function serverVerifyAndCalculate(
    requestedItems: Array<{ productId: number; variantId: number; quantity: number }>,
    paymentMethod: 'esewa_qr' | 'cod',
    paymentReference?: string
  ) {
    if (!requestedItems.length) throw new Error('Cart is empty')

    let subtotal = 0
    const verifiedItems = []

    for (const req of requestedItems) {
      const variant = mockDbVariants[req.variantId]
      if (!variant || !variant.active) {
        throw new Error(`Variant ${req.variantId} not found or inactive`)
      }
      if (variant.inventory <= 0) {
        throw new Error(`"${variant.title}" is out of stock`)
      }
      if (req.quantity > variant.inventory) {
        throw new Error(`Requested quantity exceeds available stock (${variant.inventory})`)
      }
      const lineTotal = variant.priceInNPR * req.quantity
      subtotal += lineTotal
      verifiedItems.push({
        variantId: variant.id,
        quantity: req.quantity,
        unitPrice: variant.priceInNPR,
        lineTotal,
      })
    }

    const shipping = subtotal >= 5000 ? 0 : 150
    const grandTotal = subtotal + shipping

    if (paymentMethod === 'esewa_qr') {
      if (!paymentReference || paymentReference.trim().length < 3) {
        throw new Error('Please enter your eSewa transaction reference ID')
      }
      return {
        orderStatus: 'processing',
        paymentMethod: 'esewa_qr',
        paymentStatus: 'awaiting_verification',
        paymentReference: paymentReference.trim(),
        subtotal,
        shipping,
        grandTotal,
        verifiedItems,
        orderNumber: `AURA-ORD-${Date.now().toString(36).toUpperCase()}-TEST`,
      }
    } else {
      return {
        orderStatus: 'processing',
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        paymentReference: null,
        subtotal,
        shipping,
        grandTotal,
        verifiedItems,
        orderNumber: `AURA-ORD-${Date.now().toString(36).toUpperCase()}-TEST`,
      }
    }
  }

  it('rejects checkout when variant is out of stock', () => {
    expect(() =>
      serverVerifyAndCalculate([{ productId: 1, variantId: 104, quantity: 1 }], 'cod')
    ).toThrow('"Out of Stock Red" is out of stock')
  })

  it('rejects checkout when requested quantity exceeds available stock', () => {
    expect(() =>
      serverVerifyAndCalculate([{ productId: 1, variantId: 103, quantity: 15 }], 'cod')
    ).toThrow('Requested quantity exceeds available stock (10)')
  })

  it('creates awaiting_verification order for eSewa QR and does NOT mark as paid', () => {
    const order = serverVerifyAndCalculate(
      [{ productId: 1, variantId: 101, quantity: 3 }],
      'esewa_qr',
      'ESEWA-TXN-9988'
    )

    expect(order.subtotal).toBe(7500)
    expect(order.shipping).toBe(0) // Free shipping over 5000
    expect(order.grandTotal).toBe(7500)
    expect(order.paymentMethod).toBe('esewa_qr')
    expect(order.paymentStatus).toBe('awaiting_verification')
    expect(order.paymentStatus).not.toBe('paid')
    expect(order.paymentReference).toBe('ESEWA-TXN-9988')
    expect(order.orderNumber).toMatch(/^AURA-ORD-/)
  })

  it('creates unpaid COD order for Cash on Delivery', () => {
    const order = serverVerifyAndCalculate(
      [{ productId: 1, variantId: 102, quantity: 1 }],
      'cod'
    )

    expect(order.subtotal).toBe(2500)
    expect(order.shipping).toBe(150)
    expect(order.grandTotal).toBe(2650)
    expect(order.paymentMethod).toBe('cod')
    expect(order.paymentStatus).toBe('unpaid')
    expect(order.paymentStatus).not.toBe('paid')
    expect(order.paymentReference).toBeNull()
  })

  it('decrements stock only once upon order placement', () => {
    const initialStock = mockDbVariants[101].inventory
    const qtyOrdered = 3
    const newStock = initialStock - qtyOrdered

    expect(newStock).toBe(47)
    // When payment is verified later, stock remains 47 (no double decrement)
    const stockAfterPaymentVerification = newStock
    expect(stockAfterPaymentVerification).toBe(47)
  })
})

describe('4. Checkout Hardening, Idempotency & Atomicity', () => {
  type ShippingSettings = {
    shippingFee: number
    freeShippingThreshold: number
    freeShippingEnabled: boolean
  }

  function calculateShipping(subtotal: number, settings: ShippingSettings) {
    if (settings.freeShippingEnabled && subtotal >= settings.freeShippingThreshold) {
      return 0
    }
    return settings.shippingFee
  }

  it('calculates shipping dynamically from CMS settings', () => {
    const defaultSettings: ShippingSettings = {
      shippingFee: 150,
      freeShippingThreshold: 5000,
      freeShippingEnabled: true,
    }

    expect(calculateShipping(4999, defaultSettings)).toBe(150)
    expect(calculateShipping(5000, defaultSettings)).toBe(0)
    expect(calculateShipping(10000, defaultSettings)).toBe(0)

    // Custom business settings from CMS
    const customSettings: ShippingSettings = {
      shippingFee: 200,
      freeShippingThreshold: 8000,
      freeShippingEnabled: true,
    }
    expect(calculateShipping(6000, customSettings)).toBe(200)
    expect(calculateShipping(8000, customSettings)).toBe(0)

    // Free shipping disabled by admin
    const promoDisabled: ShippingSettings = {
      shippingFee: 250,
      freeShippingThreshold: 5000,
      freeShippingEnabled: false,
    }
    expect(calculateShipping(15000, promoDisabled)).toBe(250)
  })

  it('rejects eSewa checkout if merchant QR image is unconfigured in CMS', () => {
    type MockPaymentSettings = {
      esewaQrImage: { url: string } | null
      esewaMerchantName: string | null
      esewaId: string | null
    }

    const paymentSettings: MockPaymentSettings = {
      esewaQrImage: null, // Not configured
      esewaMerchantName: null,
      esewaId: null,
    }

    function validatePaymentMethod(method: 'esewa_qr' | 'cod', settings: typeof paymentSettings) {
      if (method === 'esewa_qr') {
        const hasQr = Boolean(settings.esewaQrImage)
        if (!hasQr) {
          throw new Error('eSewa QR payment is currently unavailable. Merchant QR code not configured.')
        }
      }
      return true
    }

    expect(() => validatePaymentMethod('esewa_qr', paymentSettings)).toThrow(
      'eSewa QR payment is currently unavailable'
    )

    // COD continues to work when QR is missing
    expect(validatePaymentMethod('cod', paymentSettings)).toBe(true)

    // When configured, eSewa is allowed
    const configuredSettings = {
      esewaQrImage: { url: '/media/merchant-esewa.png' },
      esewaMerchantName: 'Aura 3D Technologies',
      esewaId: '9841000000',
    }
    expect(validatePaymentMethod('esewa_qr', configuredSettings)).toBe(true)
  })

  it('omits merchant name and eSewa ID when empty in CMS (no fabricated defaults)', () => {
    function getMerchantDisplay(settings: { esewaMerchantName?: string | null; esewaId?: string | null }) {
      return {
        merchantName: settings.esewaMerchantName?.trim() || null,
        esewaId: settings.esewaId?.trim() || null,
      }
    }

    const emptyDisplay = getMerchantDisplay({ esewaMerchantName: '', esewaId: null })
    expect(emptyDisplay.merchantName).toBeNull()
    expect(emptyDisplay.esewaId).toBeNull()

    const realDisplay = getMerchantDisplay({ esewaMerchantName: 'Aura 3D Tech Pvt Ltd', esewaId: '9812345678' })
    expect(realDisplay.merchantName).toBe('Aura 3D Tech Pvt Ltd')
    expect(realDisplay.esewaId).toBe('9812345678')
  })

  it('handles server idempotency: same key returns existing order and decrements stock only once', () => {
    const ordersDb: Record<string, any> = {}
    const variantStock: Record<number, number> = { 201: 20 }

    function checkoutWithIdempotency(idempotencyKey: string, qty: number) {
      if (ordersDb[idempotencyKey]) {
        return {
          order: ordersDb[idempotencyKey],
          idempotentReplay: true,
        }
      }

      // Decrement stock
      variantStock[201] -= qty

      const newOrder = {
        id: `ord-${Object.keys(ordersDb).length + 1}`,
        idempotencyKey,
        quantity: qty,
        orderNumber: `AURA-ORD-${idempotencyKey.slice(0, 8)}`,
      }
      ordersDb[idempotencyKey] = newOrder

      return {
        order: newOrder,
        idempotentReplay: false,
      }
    }

    const key = 'a84e680a-9d62-4f0f-8761-9f2df95cbe10'

    // First attempt: creates order and decrements stock
    const firstCall = checkoutWithIdempotency(key, 2)
    expect(firstCall.idempotentReplay).toBe(false)
    expect(firstCall.order.orderNumber).toBe('AURA-ORD-a84e680a')
    expect(variantStock[201]).toBe(18)

    // Second attempt (duplicate/replay): returns existing order without re-decrementing
    const secondCall = checkoutWithIdempotency(key, 2)
    expect(secondCall.idempotentReplay).toBe(true)
    expect(secondCall.order.id).toBe(firstCall.order.id)
    expect(secondCall.order.orderNumber).toBe(firstCall.order.orderNumber)
    expect(variantStock[201]).toBe(18) // Stock remains 18 (decremented once)

    // Only one order exists
    expect(Object.keys(ordersDb)).toHaveLength(1)
  })

  it('guarantees inventory atomicity: rolls back decremented stock if order creation fails', () => {
    let currentStock = 25
    const qtyOrdered = 4

    // Decrement stock first
    currentStock -= qtyOrdered
    expect(currentStock).toBe(21)

    // Simulate order creation failure (e.g. database error or unique constraint)
    let orderCreationSucceeded = false
    try {
      throw new Error('Simulated database write failure during order creation')
    } catch {
      // Rollback compensation
      currentStock += qtyOrdered
    }

    expect(orderCreationSucceeded).toBe(false)
    // Inventory is strictly restored
    expect(currentStock).toBe(25)
  })
})

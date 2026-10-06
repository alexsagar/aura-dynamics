'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/providers/CartProvider'
import { Button } from '@/components/storefront/ui/Button'

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, cartTotal, clearCart } = useCart()

  // Form State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  // Unique client idempotency key per checkout attempt
  const [idempotencyKey] = useState<string>(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `aura-chk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  })

  // Payment Method: 'esewa_qr' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState<'esewa_qr' | 'cod'>('cod')
  const [paymentReference, setPaymentReference] = useState('')

  // Real QR Settings from CMS (no fake fallbacks)
  const [isEsewaConfigured, setIsEsewaConfigured] = useState<boolean>(false)
  const [esewaQrUrl, setEsewaQrUrl] = useState<string | null>(null)
  const [esewaMerchantName, setEsewaMerchantName] = useState<string | null>(null)
  const [esewaId, setEsewaId] = useState<string | null>(null)

  // Dynamic Shipping Configuration from CMS
  const [shippingConfig, setShippingConfig] = useState({
    shippingFee: 150,
    freeShippingThreshold: 5000,
    freeShippingEnabled: true,
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch real payment and shipping settings from backend (SiteSettings)
  useEffect(() => {
    fetch('/api/payment-settings')
      .then((res) => (res.ok ? (res.json() as Promise<any>) : null))
      .then((data: any) => {
        if (data?.shippingSettings) {
          setShippingConfig(data.shippingSettings)
        }

        if (data?.isEsewaConfigured && data?.esewaQrImageUrl) {
          setIsEsewaConfigured(true)
          setEsewaQrUrl(data.esewaQrImageUrl)
          setEsewaMerchantName(data.esewaMerchantName || null)
          setEsewaId(data.esewaId || null)
          setPaymentMethod('esewa_qr')
        } else {
          setIsEsewaConfigured(false)
          setEsewaQrUrl(null)
          setEsewaMerchantName(null)
          setEsewaId(null)
          setPaymentMethod('cod')
        }
      })
      .catch(() => {
        setIsEsewaConfigured(false)
        setPaymentMethod('cod')
      })
  }, [])

  // Calculate totals using dynamic CMS shipping rules
  const shipping =
    shippingConfig.freeShippingEnabled && cartTotal >= shippingConfig.freeShippingThreshold
      ? 0
      : shippingConfig.shippingFee
  const finalTotal = cartTotal + shipping

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Client-side validation
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.')
      return
    }

    const digitsOnly = phone.replace(/\D/g, '')
    if (!phone.trim() || digitsOnly.length !== 10 || !/^(98|97)\d{8}$/.test(digitsOnly)) {
      setErrorMessage('Please enter a valid 10-digit Nepal mobile number (e.g. 98XXXXXXXX).')
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!address.trim()) {
      setErrorMessage('Please enter your delivery address.')
      return
    }

    if (!city.trim()) {
      setErrorMessage('Please enter your city / area.')
      return
    }

    if (paymentMethod === 'esewa_qr') {
      if (!isEsewaConfigured || !esewaQrUrl) {
        setErrorMessage('eSewa QR payment is currently unavailable. Please select Cash on Delivery.')
        return
      }
      if (!paymentReference.trim()) {
        setErrorMessage('Please enter your eSewa transaction or reference ID.')
        return
      }
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.')
      return
    }

    setIsProcessing(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey,
          customer: {
            fullName: fullName.trim(),
            phone: digitsOnly,
            email: email.trim(),
            address: address.trim(),
            city: city.trim(),
            orderNotes: orderNotes.trim(),
          },
          paymentMethod,
          paymentReference: paymentMethod === 'esewa_qr' ? paymentReference.trim() : null,
          items: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      })

      const data: any = await res.json()

      if (!res.ok || !data.success) {
        setIsProcessing(false)
        setErrorMessage(data.error || 'Failed to place order. Please review your details.')
        return
      }

      // Order confirmed successfully: clear cart and redirect to success page
      await clearCart()

      const query = new URLSearchParams({
        orderNumber: data.order.orderNumber,
        amount: String(data.order.amount),
        paymentMethod: data.order.paymentMethod,
        paymentStatus: data.order.paymentStatus,
      })

      router.push(`/checkout/success?${query.toString()}`)
    } catch (err: any) {
      setIsProcessing(false)
      setErrorMessage(err.message || 'An error occurred while connecting to the checkout service.')
    }
  }

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-32 text-center">
        <h1 className="mb-4 text-3xl font-medium tracking-[-0.02em]">Your cart is empty.</h1>
        <p className="mb-8 text-muted">Add some products before proceeding to checkout.</p>
        <Button as="a" href="/filaments" variant="primary" size="lg">
          Explore Products
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col-reverse bg-background lg:flex-row">
      {/* Left Column: Form */}
      <div className="w-full px-6 py-12 sm:px-12 lg:w-3/5 lg:py-24">
        <div className="mx-auto max-w-[580px]">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/cart"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-black transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Return to Cart
            </Link>
            <h1 className="text-3xl font-medium tracking-[-0.03em] sm:text-4xl">Guest Checkout</h1>
            <p className="mt-2 text-muted text-sm">
              Complete your order quickly. No account or password required.
            </p>
          </div>

          {errorMessage && (
            <div
              className="mb-8 rounded-2xl bg-red-50 p-4 border border-red-200 text-sm text-red-600"
              data-testid="checkout-error-banner"
            >
              <p className="font-semibold">Checkout Error</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          )}

          <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-10">
            {/* Contact Details */}
            <section>
              <h2 className="mb-4 text-xl font-medium tracking-[-0.02em]">Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="e.g. Aayush Shrestha"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black"
                    data-testid="checkout-fullname"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="98XXXXXXXX / 97XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black"
                    data-testid="checkout-phone"
                  />
                  <span className="mt-1 block text-[11px] text-muted">Required for delivery coordination</span>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="aayush@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black"
                    data-testid="checkout-email"
                  />
                  <span className="mt-1 block text-[11px] text-muted">Order confirmation will be sent here</span>
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="mb-4 text-xl font-medium tracking-[-0.02em]">Delivery Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Street Address / Landmark <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    placeholder="House / Building No, Street, Ward No"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black"
                    data-testid="checkout-address"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    City / Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    placeholder="e.g. Kathmandu, Lalitpur, Pokhara"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black"
                    data-testid="checkout-city"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    disabled
                    value="Nepal"
                    className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-muted outline-none cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="orderNotes" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    id="orderNotes"
                    rows={2}
                    placeholder="e.g. Near Big Mart, call before delivery"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full rounded-xl border border-black/20 bg-transparent px-4 py-3 outline-none transition-colors focus:border-black"
                    data-testid="checkout-notes"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="mb-4 text-xl font-medium tracking-[-0.02em]">Payment Method</h2>
              <div className="flex flex-col overflow-hidden rounded-2xl border border-black/20 bg-white">
                {/* eSewa QR Option */}
                {isEsewaConfigured && esewaQrUrl ? (
                  <>
                    <label className={`flex cursor-pointer items-center justify-between border-b border-black/10 p-5 transition-colors ${paymentMethod === 'esewa_qr' ? 'bg-[#f8f9fa]' : 'hover:bg-black/5'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="esewa_qr"
                          checked={paymentMethod === 'esewa_qr'}
                          onChange={() => setPaymentMethod('esewa_qr')}
                          className="size-4 accent-black"
                          data-testid="payment-method-esewa"
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base">eSewa QR Payment</span>
                          <span className="rounded bg-[#60BB46]/10 px-2 py-0.5 text-xs font-bold text-[#43962b]">
                            Instant QR
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted">Manual verification</span>
                    </label>

                    {/* eSewa Details Body */}
                    {paymentMethod === 'esewa_qr' && (
                      <div className="flex flex-col gap-6 bg-[#fbfbfb] p-6 border-b border-black/10" data-testid="esewa-qr-section">
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                          <div className="shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
                            <img
                              src={esewaQrUrl}
                              alt="eSewa QR Code"
                              className="h-48 w-48 object-contain"
                              data-testid="esewa-qr-image"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-2 text-sm">
                            <p className="font-medium text-foreground">
                              Payable Amount:{' '}
                              <span className="text-lg font-bold text-black" data-testid="esewa-payable-amount">
                                Rs. {finalTotal.toFixed(2)}
                              </span>
                            </p>
                            <p className="text-muted leading-relaxed">
                              Scan the QR using eSewa and pay the exact order amount. After payment, enter your eSewa transaction/reference ID below.
                            </p>
                            {esewaMerchantName && (
                              <div className="rounded-xl bg-black/5 p-3 text-xs text-muted" data-testid="esewa-merchant-badge">
                                <span className="font-semibold text-foreground">Merchant: </span>
                                {esewaMerchantName}
                              </div>
                            )}
                            {esewaId && (
                              <div className="rounded-xl bg-black/5 p-3 text-xs text-muted">
                                <span className="font-semibold text-foreground">eSewa ID: </span>
                                {esewaId}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="paymentReference" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                            eSewa Transaction / Reference ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="paymentReference"
                            type="text"
                            placeholder="e.g. 0ABC1234 or transaction code"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 outline-none transition-colors focus:border-black font-mono text-sm"
                            required={paymentMethod === 'esewa_qr'}
                            data-testid="esewa-reference-input"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="border-b border-black/10 p-5 opacity-60 bg-black/[0.02]" data-testid="esewa-unavailable-notice">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          disabled
                          className="size-4 opacity-40 cursor-not-allowed"
                          data-testid="payment-method-esewa-disabled"
                        />
                        <span className="font-medium text-muted">eSewa QR Payment (Currently Unavailable)</span>
                      </div>
                      <span className="text-xs text-muted">Unconfigured</span>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      Online QR payment is temporarily unavailable. Store administrator can upload the merchant QR image in Site Settings.
                    </p>
                  </div>
                )}

                {/* Cash on Delivery Option */}
                <label className={`flex cursor-pointer items-center justify-between p-5 transition-colors ${paymentMethod === 'cod' ? 'bg-[#f8f9fa]' : 'hover:bg-black/5'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="size-4 accent-black"
                      data-testid="payment-method-cod"
                    />
                    <span className="font-semibold text-base">Cash on Delivery (COD)</span>
                  </div>
                  <span className="text-xs text-muted">Pay at doorstep</span>
                </label>

                {paymentMethod === 'cod' && (
                  <div className="bg-[#fbfbfb] p-6 text-sm text-muted border-t border-black/10">
                    <p>Pay with exact cash when your package is delivered to your shipping address.</p>
                  </div>
                )}
              </div>
            </section>
          </form>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full bg-[#f4f4f4] px-6 py-12 sm:px-12 lg:w-2/5 lg:py-24">
        <div className="mx-auto w-full max-w-[420px] lg:sticky lg:top-12">
          <h2 className="mb-6 text-2xl font-medium tracking-[-0.02em]">Order Summary</h2>

          {/* Items */}
          <div className="mb-8 flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1" data-testid="checkout-summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="size-full object-cover mix-blend-multiply"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-xs text-muted">
                      Aura
                    </div>
                  )}
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-medium text-sm leading-snug line-clamp-1">{item.title}</span>
                  {item.color && (
                    <span className="text-xs text-muted">{item.color}</span>
                  )}
                  <span className="text-xs text-muted">Rs. {item.unitPrice.toFixed(2)} each</span>
                </div>
                <span className="font-semibold text-sm">
                  Rs. {(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="flex flex-col gap-3 border-y border-black/10 py-5 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-medium text-black">Rs. {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Delivery Charge</span>
              <span className="font-medium text-black">
                {shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <span className="text-lg font-medium">Total</span>
            <span className="text-3xl font-bold tracking-[-0.02em]" data-testid="checkout-final-total">
              Rs. {finalTotal.toFixed(2)}
            </span>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            variant="primary"
            size="lg"
            className="mt-8 w-full h-14 text-base"
            disabled={isProcessing}
            data-testid="place-order-button"
          >
            {isProcessing ? 'Processing Order...' : paymentMethod === 'esewa_qr' ? 'Submit eSewa Order' : 'Place COD Order'}
          </Button>

          <p className="mt-4 text-center text-xs text-muted">
            All prices in Nepalese Rupees (NPR). Development pricing until official launch.
          </p>
        </div>
      </div>
    </div>
  )
}

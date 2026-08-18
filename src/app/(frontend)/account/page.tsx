'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { Container } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'

export default function AccountPage() {
  const { user, isLoading, setUser } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      // Attempt to fetch orders from Payload plugin-ecommerce
      const fetchOrders = async () => {
        try {
          // Typically the ecommerce plugin adds an 'orders' collection linked to the customer
          const res = await fetch(`/api/orders?where[customer][equals]=${user.id}`)
          if (res.ok) {
            const data = await res.json() as { docs?: any[] }
            setOrders(data.docs || [])
          }
        } catch (e) {
          console.error('Failed to fetch orders')
        }
      }
      fetchOrders()
    }
  }, [user])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/customers/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
      router.refresh()
    } catch (e) {
      console.error('Logout failed')
      setIsLoggingOut(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Container>
        <div className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-black/10 pb-10 md:flex-row md:items-end">
          <div>
            <h1 className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
              Dashboard
            </h1>
            <h2 className="mt-2 text-5xl font-medium tracking-[-0.02em]">
              Hello, {user.name || user.email?.split('@')[0]}
            </h2>
          </div>
          <Button onClick={handleLogout} variant="secondary" disabled={isLoggingOut}>
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>

        <div className="grid gap-16 lg:grid-cols-[1fr_300px]">
          {/* Order History */}
          <div>
            <h3 className="mb-6 text-2xl font-medium tracking-[-0.02em]">Order History</h3>
            {orders.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
                <table className="w-full text-left">
                  <thead className="border-b border-black/10 bg-[#f4f4f4] text-sm font-semibold text-muted">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any) => (
                      <tr key={order.id} className="border-b border-black/10 last:border-0">
                        <td className="p-4 font-medium">{order.id}</td>
                        <td className="p-4 text-muted">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex rounded-full bg-lime/20 px-3 py-1 text-xs font-semibold text-lime">
                            {order.status || 'Processing'}
                          </span>
                        </td>
                        <td className="p-4 font-medium">Rs. {order.total || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white p-12 text-center">
                <p className="text-lg text-muted">You haven't placed any orders yet.</p>
                <Button as="a" href="/filaments" variant="primary" className="mt-6">
                  Start Shopping
                </Button>
              </div>
            )}
          </div>

          {/* Account Details */}
          <div>
            <h3 className="mb-6 text-2xl font-medium tracking-[-0.02em]">Account Details</h3>
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <div className="mb-6">
                <p className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  Email
                </p>
                <p className="mt-1 text-lg font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
                  Password
                </p>
                <p className="mt-1 text-lg font-medium">••••••••</p>
              </div>
              <Button variant="secondary" className="mt-8 w-full">
                Edit Details
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

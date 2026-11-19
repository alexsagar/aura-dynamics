'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ShippingSettings } from '@/lib/shipping'

export type StoreSettings = {
  isEsewaConfigured: boolean
  esewaQrImageUrl: string | null
  esewaMerchantName: string | null
  esewaId: string | null
  shippingSettings: ShippingSettings
}

export type StoreSettingsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; settings: StoreSettings }

/**
 * Loads CMS shipping/payment settings for cart and checkout. There is no
 * client-side default fee: until the CMS answers, the delivery charge is
 * unknown and callers must not show it (or a total) as final.
 */
export function useStoreSettings(): StoreSettingsState & { retry: () => void } {
  const [state, setState] = useState<StoreSettingsState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    fetch('/api/payment-settings', { cache: 'no-store' })
      .then((res) => (res.ok ? (res.json() as Promise<StoreSettings>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!data?.shippingSettings) throw new Error('missing shippingSettings')
        if (!cancelled) setState({ status: 'ready', settings: data })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}

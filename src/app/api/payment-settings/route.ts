import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    })

    const paymentSettings = siteSettings?.paymentSettings
    const qrMedia = paymentSettings?.esewaQrImage
    const qrImageUrl =
      typeof qrMedia === 'object' && qrMedia?.url ? qrMedia.url : null

    const shippingSettings = siteSettings?.shippingSettings
    const shippingFee =
      typeof shippingSettings?.shippingFee === 'number'
        ? shippingSettings.shippingFee
        : 150
    const freeShippingThreshold =
      typeof shippingSettings?.freeShippingThreshold === 'number'
        ? shippingSettings.freeShippingThreshold
        : 5000
    const freeShippingEnabled = shippingSettings?.freeShippingEnabled !== false

    return NextResponse.json({
      isEsewaConfigured: Boolean(qrImageUrl),
      esewaQrImageUrl: qrImageUrl,
      esewaMerchantName: paymentSettings?.esewaMerchantName?.trim() || null,
      esewaId: paymentSettings?.esewaId?.trim() || null,
      shippingSettings: {
        shippingFee,
        freeShippingThreshold,
        freeShippingEnabled,
      },
    })
  } catch (error) {
    console.error('Error fetching store/payment settings:', error)
    return NextResponse.json({
      isEsewaConfigured: false,
      esewaQrImageUrl: null,
      esewaMerchantName: null,
      esewaId: null,
      shippingSettings: {
        shippingFee: 150,
        freeShippingThreshold: 5000,
        freeShippingEnabled: true,
      },
    })
  }
}

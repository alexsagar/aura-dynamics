import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { DEFAULT_SHIPPING, resolveShippingSettings } from '@/lib/shipping'

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

    return NextResponse.json({
      isEsewaConfigured: Boolean(qrImageUrl),
      esewaQrImageUrl: qrImageUrl,
      esewaMerchantName: paymentSettings?.esewaMerchantName?.trim() || null,
      esewaId: paymentSettings?.esewaId?.trim() || null,
      shippingSettings: resolveShippingSettings(siteSettings?.shippingSettings),
    })
  } catch (error) {
    console.error('Error fetching store/payment settings:', error)
    return NextResponse.json({
      isEsewaConfigured: false,
      esewaQrImageUrl: null,
      esewaMerchantName: null,
      esewaId: null,
      shippingSettings: DEFAULT_SHIPPING,
    })
  }
}

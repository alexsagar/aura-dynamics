import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { sql } from '@payloadcms/db-d1-sqlite'
import configPromise from '@/payload.config'

/**
 * ============================================================================
 * SAFEGUARD: DEVELOPMENT-ONLY PRICING NOTICE
 * ============================================================================
 * All product and variant prices (e.g. Numakers PLA at Rs. 2,500.00) are
 * strictly development/test prices. Production checkout must NOT be enabled
 * until confirmed selling prices are approved and entered by the store owner.
 * ============================================================================
 */

export async function POST(req: Request) {
  try {
    const body: any = await req.json()

    // 1. Basic body validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const { customer, paymentMethod, paymentReference, items, idempotencyKey } = body

    // 2. Server-side Idempotency Key validation
    if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.trim().length < 8) {
      return NextResponse.json(
        { error: 'A valid client-side idempotencyKey (UUID) is required for checkout.' },
        { status: 400 }
      )
    }

    const normalizedIdempotencyKey = idempotencyKey.trim()

    // 3. Customer detail validation
    if (!customer || typeof customer !== 'object') {
      return NextResponse.json({ error: 'Customer details are required.' }, { status: 400 })
    }

    const fullName = customer.fullName?.trim()
    const phone = customer.phone?.trim()
    const email = customer.email?.trim()
    const address = customer.address?.trim()
    const city = customer.city?.trim()
    const orderNotes = customer.orderNotes?.trim() || ''

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })
    }

    // Nepal phone format: 10 digits starting with 98 or 97
    const digitsOnly = phone ? phone.replace(/\D/g, '') : ''
    if (!phone || digitsOnly.length !== 10 || !/^(98|97)\d{8}$/.test(digitsOnly)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number (e.g. 98XXXXXXXX).' },
        { status: 400 }
      )
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (!address || address.length < 3) {
      return NextResponse.json({ error: 'Please enter your delivery address.' }, { status: 400 })
    }

    if (!city || city.length < 2) {
      return NextResponse.json({ error: 'Please enter your city / area.' }, { status: 400 })
    }

    if (paymentMethod !== 'esewa_qr' && paymentMethod !== 'cod') {
      return NextResponse.json({ error: 'Invalid payment method selected.' }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    // 4. Initialize Payload
    const payload = await getPayload({ config: configPromise })

    // 5. Check Idempotency: Return existing order if already processed for this key
    const existingOrders = await payload.find({
      collection: 'orders',
      where: {
        idempotencyKey: {
          equals: normalizedIdempotencyKey,
        },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingOrders.docs.length > 0) {
      const existing = existingOrders.docs[0] as any
      return NextResponse.json({
        success: true,
        order: {
          id: existing.id,
          orderNumber: existing.orderNumber,
          amount: existing.amount,
          subtotal: existing.subtotal,
          shipping: existing.shipping,
          currency: existing.currency,
          paymentMethod: existing.paymentMethod,
          paymentStatus: existing.paymentStatus,
        },
        idempotentReplay: true,
      })
    }

    // 6. Fetch Site Settings for payment and shipping configuration
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    })

    // Validate eSewa QR configuration if eSewa was selected
    if (paymentMethod === 'esewa_qr') {
      const qrMedia = siteSettings?.paymentSettings?.esewaQrImage
      const hasRealQr =
        typeof qrMedia === 'object' && qrMedia !== null && Boolean(qrMedia.url)

      if (!hasRealQr) {
        return NextResponse.json(
          {
            error:
              'eSewa QR payment is currently unavailable because the merchant QR code has not been configured by the store administrator.',
          },
          { status: 400 }
        )
      }

      const ref = paymentReference?.trim()
      if (!ref || ref.length < 3) {
        return NextResponse.json(
          { error: 'Please enter your eSewa transaction or reference ID.' },
          { status: 400 }
        )
      }
    }

    // 7. Server-side product & variant validation, inventory check, and verified price calculation
    type VerifiedLineItem = {
      product: number
      variant: number
      title: string
      variantTitle: string
      sku: string
      color: string
      hexColor: string
      unitPrice: number
      quantity: number
      lineTotal: number
      availableStock: number
      image: string
    }

    const verifiedItems: VerifiedLineItem[] = []

    for (const item of items) {
      const productId = Number(item.productId)
      const variantId = Number(item.variantId)
      const requestedQty = Math.floor(Number(item.quantity))

      if (!productId || isNaN(productId)) {
        return NextResponse.json({ error: 'Invalid product ID in cart item.' }, { status: 400 })
      }

      if (!requestedQty || requestedQty < 1) {
        return NextResponse.json({ error: 'Quantity must be at least 1.' }, { status: 400 })
      }

      // Fetch Product from database
      let productDoc: any
      try {
        productDoc = await payload.findByID({
          collection: 'products',
          id: productId,
          depth: 1,
          overrideAccess: true,
        })
      } catch (e) {
        return NextResponse.json({ error: `Product with ID ${productId} not found.` }, { status: 400 })
      }

      if (!productDoc) {
        return NextResponse.json({ error: `Product not found.` }, { status: 400 })
      }

      // Fetch Variant from database
      let variantDoc: any = null
      if (variantId && !isNaN(variantId)) {
        try {
          variantDoc = await payload.findByID({
            collection: 'variants',
            id: variantId,
            depth: 1,
            overrideAccess: true,
          })
        } catch (e) {
          return NextResponse.json({ error: `Variant with ID ${variantId} not found.` }, { status: 400 })
        }
      }

      if (!variantDoc) {
        return NextResponse.json({ error: `Variant for product "${productDoc.title}" is required.` }, { status: 400 })
      }

      if (variantDoc.active === false) {
        return NextResponse.json(
          { error: `Variant "${variantDoc.title}" is no longer available.` },
          { status: 400 }
        )
      }

      const availableStock = typeof variantDoc.inventory === 'number' ? variantDoc.inventory : 0
      if (availableStock <= 0) {
        return NextResponse.json(
          { error: `"${variantDoc.title || productDoc.title}" is currently out of stock.` },
          { status: 400 }
        )
      }

      if (requestedQty > availableStock) {
        return NextResponse.json(
          {
            error: `Requested quantity (${requestedQty}) for "${variantDoc.title || productDoc.title}" exceeds available stock (${availableStock}).`,
          },
          { status: 400 }
        )
      }

      // Verified unit price from CMS
      const verifiedPrice =
        variantDoc.priceInNPREnabled && typeof variantDoc.priceInNPR === 'number'
          ? variantDoc.priceInNPR
          : typeof productDoc.priceInNPR === 'number'
            ? productDoc.priceInNPR
            : 0

      if (verifiedPrice <= 0) {
        return NextResponse.json(
          { error: `Price is not configured for "${variantDoc.title || productDoc.title}".` },
          { status: 400 }
        )
      }

      const optionData = variantDoc.options?.[0]
      const color = optionData?.label || optionData?.colorFamily || ''
      const hexColor = optionData?.hexColor || ''
      const sku = variantDoc.sku || ''
      const image =
        variantDoc.images?.[0]?.url ||
        productDoc.images?.[0]?.url ||
        ''

      verifiedItems.push({
        product: productDoc.id,
        variant: variantDoc.id,
        title: productDoc.title,
        variantTitle: variantDoc.title || productDoc.title,
        sku,
        color,
        hexColor,
        unitPrice: verifiedPrice,
        quantity: requestedQty,
        lineTotal: verifiedPrice * requestedQty,
        availableStock,
        image,
      })
    }

    // 8. Calculate verified subtotal and dynamic shipping from CMS settings
    const subtotal = verifiedItems.reduce((acc, it) => acc + it.lineTotal, 0)

    const shippingSettings = siteSettings?.shippingSettings
    const standardShippingFee =
      typeof shippingSettings?.shippingFee === 'number'
        ? shippingSettings.shippingFee
        : 150
    const freeShippingThreshold =
      typeof shippingSettings?.freeShippingThreshold === 'number'
        ? shippingSettings.freeShippingThreshold
        : 5000
    const freeShippingEnabled = shippingSettings?.freeShippingEnabled !== false

    const shipping =
      freeShippingEnabled && subtotal >= freeShippingThreshold ? 0 : standardShippingFee
    const grandTotal = subtotal + shipping

    // 9. Generate real human-readable order number
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `AURA-ORD-${timestamp}-${randomSuffix}`

    // 10. Order Status Semantics
    // Main status uses standard supported enum value: 'processing'
    // Payment status tracks verified state: 'awaiting_verification' (eSewa) or 'unpaid' (COD)
    const orderStatus = 'processing'
    const paymentStatus = paymentMethod === 'esewa_qr' ? 'awaiting_verification' : 'unpaid'
    const storedRef = paymentMethod === 'esewa_qr' ? paymentReference?.trim() : null

    // 11. Atomic Inventory Reservation + Order Creation with delta-based rollback.
    // Each decrement is a single conditional UPDATE guarded by `inventory >= qty`,
    // so concurrent checkouts cannot oversell (no read-modify-write race): two
    // buyers of the last unit will see exactly one UPDATE affect a row.
    const db = (payload.db as any).drizzle
    const decrementsPerformed: { variantId: number; qty: number }[] = []

    // Restore ONLY each checkout's own quantity (a delta add-back), never an
    // absolute snapshot — otherwise a concurrent order's decrement would be lost.
    const rollbackInventory = async () => {
      for (const dec of decrementsPerformed) {
        try {
          await db.run(
            sql`UPDATE \`variants\` SET \`inventory\` = \`inventory\` + ${dec.qty} WHERE \`id\` = ${dec.variantId}`,
          )
        } catch (rollbackError) {
          console.error(`CRITICAL: Failed to roll back variant ${dec.variantId} stock:`, rollbackError)
        }
      }
    }

    try {
      // Step A: Atomically reserve inventory for each ordered variant.
      for (const item of verifiedItems) {
        const res: any = await db.run(
          sql`UPDATE \`variants\` SET \`inventory\` = \`inventory\` - ${item.quantity} WHERE \`id\` = ${item.variant} AND \`inventory\` >= ${item.quantity}`,
        )
        const changed = res?.meta?.changes ?? res?.changes ?? 0
        if (changed !== 1) {
          // Lost the race for remaining stock between validation and reservation.
          await rollbackInventory()
          return NextResponse.json(
            {
              error: `"${item.variantTitle}" just sold out or doesn't have enough stock left. Please adjust your cart and try again.`,
            },
            { status: 409 },
          )
        }
        decrementsPerformed.push({ variantId: item.variant, qty: item.quantity })
      }

      // Step B: Create Order record in Payload
      const orderDoc = await payload.create({
        collection: 'orders',
        data: {
          idempotencyKey: normalizedIdempotencyKey,
          orderNumber,
          status: orderStatus,
          amount: grandTotal,
          currency: 'NPR',
          subtotal,
          shipping,
          paymentMethod,
          paymentStatus,
          paymentReference: storedRef,
          customerEmail: email,
          shippingAddress: {
            firstName: fullName,
            addressLine1: address,
            city,
            country: 'Nepal',
            phone: digitsOnly,
          },
          orderNotes: orderNotes || null,
          items: verifiedItems.map((it) => ({
            product: it.product,
            variant: it.variant,
            quantity: it.quantity,
          })),
          itemsSnapshot: verifiedItems.map((it) => ({
            productId: it.product,
            variantId: it.variant,
            title: it.title,
            variantTitle: it.variantTitle,
            sku: it.sku,
            color: it.color,
            hexColor: it.hexColor,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            lineTotal: it.lineTotal,
            image: it.image,
          })),
        },
        overrideAccess: true,
      })

      return NextResponse.json({
        success: true,
        order: {
          id: orderDoc.id,
          orderNumber,
          amount: grandTotal,
          subtotal,
          shipping,
          currency: 'NPR',
          paymentMethod,
          paymentStatus,
        },
      })
    } catch (orderError: any) {
      console.error('Order creation failed. Rolling back inventory decrements:', orderError)

      // Step C: Rollback compensation - add back only this checkout's quantities.
      await rollbackInventory()

      // Check if failure was caused by a concurrent unique constraint on idempotencyKey
      if (
        orderError.message?.includes('UNIQUE constraint failed') ||
        orderError.message?.includes('idempotency_key')
      ) {
        const replayOrder = await payload.find({
          collection: 'orders',
          where: {
            idempotencyKey: {
              equals: normalizedIdempotencyKey,
            },
          },
          limit: 1,
          overrideAccess: true,
        })

        if (replayOrder.docs.length > 0) {
          const existing = replayOrder.docs[0] as any
          return NextResponse.json({
            success: true,
            order: {
              id: existing.id,
              orderNumber: existing.orderNumber,
              amount: existing.amount,
              subtotal: existing.subtotal,
              shipping: existing.shipping,
              currency: existing.currency,
              paymentMethod: existing.paymentMethod,
              paymentStatus: existing.paymentStatus,
            },
            idempotentReplay: true,
          })
        }
      }

      return NextResponse.json(
        { error: orderError.message || 'An error occurred while creating your order.' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Server checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing your order.' },
      { status: 500 }
    )
  }
}

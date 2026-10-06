import { test, expect } from '@playwright/test'

test.use({ channel: 'chrome' })

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
]

test.describe('Aura Ecommerce Guest Shopping Flow', () => {
  test.setTimeout(90000)

  test('Flow 1: When eSewa QR is not configured, eSewa is unavailable & COD works cleanly', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // 1. Visit Product Page
    await page.goto('http://localhost:3000/product/numakers-pla')
    await page.waitForLoadState('networkidle')

    // Verify Title & Brand/Material specs
    await expect(page.locator('h1').first()).toContainText('Numakers PLA')
    await expect(page.locator('text=Numakers').first()).toBeVisible()
    await expect(page.locator('text=PLA').first()).toBeVisible()

    // 2. Select Pure White
    const whiteBtn = page.locator('[data-testid="variant-color-pure-white"]')
    await whiteBtn.click()

    // 3. Test Quantity Selector: Default is 1, Cannot go below 1
    const qtyDisplay = page.locator('[data-testid="product-quantity-display"]')
    await expect(qtyDisplay).toHaveText('1')

    const minusBtn = page.locator('button[aria-label="Decrease quantity"]')
    await expect(minusBtn).toBeDisabled()

    const plusBtn = page.locator('button[aria-label="Increase quantity"]')
    await plusBtn.click() // qty -> 2
    await expect(qtyDisplay).toHaveText('2')

    // 4. Add to Cart
    const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]')
    await addToCartBtn.click()

    // 5. Navigate to Cart
    await page.goto('http://localhost:3000/cart')
    await page.waitForLoadState('networkidle')

    // Verify Cart shows Pure White x2
    await expect(page.locator('text=Pure White').first()).toBeVisible()
    const cartQty = page.locator('[data-testid^="cart-item-qty-"]').first()
    await expect(cartQty).toHaveText('2')

    // Verify subtotal: Rs. 5000.00 (2 * 2500)
    const subtotal = page.locator('[data-testid="cart-subtotal"]')
    await expect(subtotal).toContainText(/5,?000\.00/)

    // 6. Proceed to Checkout
    await page.locator('[data-testid="proceed-to-checkout-btn"]').click()
    await page.waitForURL('**/checkout')
    await page.waitForLoadState('networkidle')

    // Verify eSewa is unavailable notice is displayed and radio is disabled
    await expect(page.locator('[data-testid="esewa-unavailable-notice"]')).toBeVisible()
    const disabledEsewaRadio = page.locator('[data-testid="payment-method-esewa-disabled"]')
    await expect(disabledEsewaRadio).toBeDisabled()

    // COD is selected by default when eSewa is unconfigured
    const codRadio = page.locator('[data-testid="payment-method-cod"]')
    await expect(codRadio).toBeChecked()

    // Fill Guest Checkout Details
    await page.locator('[data-testid="checkout-fullname"]').fill('Bikash Maharjan')
    await page.locator('[data-testid="checkout-phone"]').fill('9801122334')
    await page.locator('[data-testid="checkout-email"]').fill('bikash@example.com')
    await page.locator('[data-testid="checkout-address"]').fill('Jhamsikhel, Lalitpur')
    await page.locator('[data-testid="checkout-city"]').fill('Lalitpur')
    await page.locator('[data-testid="checkout-notes"]').fill('Deliver before noon')

    // Submit COD Order
    await page.locator('[data-testid="place-order-button"]').click()

    // 7. Verify Success Page
    await page.waitForURL('**/checkout/success**', { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify COD message & statuses
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Your order has been received as Cash on Delivery.'
    )
    await expect(page.locator('[data-testid="success-payment-method"]')).toContainText('Cash on Delivery')
    await expect(page.locator('[data-testid="success-payment-status"]')).toContainText('Unpaid')

    // Verify real order number format
    const orderNum = await page.locator('[data-testid="success-order-number"]').textContent()
    expect(orderNum).toMatch(/^AURA-ORD-/)

    // Zero hydration errors
    const hydrationErrors = consoleErrors.filter((err) =>
      /hydration|did not match|react-dom/i.test(err)
    )
    expect(hydrationErrors).toHaveLength(0)
  })

  test('Flow 2: Configured eSewa QR renders real merchant info and completes order awaiting verification', async ({
    page,
  }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // Mock real configured settings from CMS
    await page.route('**/api/payment-settings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isEsewaConfigured: true,
          esewaQrImageUrl: '/brand/esewa-qr.svg',
          esewaMerchantName: 'Aura Technologies Pvt Ltd',
          esewaId: '9841234567',
          shippingSettings: {
            shippingFee: 150,
            freeShippingThreshold: 5000,
            freeShippingEnabled: true,
          },
        }),
      })
    })

    // Mock successful checkout response for configured QR flow
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: {
            id: 999,
            orderNumber: 'AURA-ORD-ESEWA-CONF',
            amount: 7500,
            subtotal: 7500,
            shipping: 0,
            currency: 'NPR',
            paymentMethod: 'esewa_qr',
            paymentStatus: 'awaiting_verification',
          },
        }),
      })
    })

    // 1. Visit Product Page & Add Forest Green x3
    await page.goto('http://localhost:3000/product/numakers-pla')
    await page.waitForLoadState('networkidle')

    const greenBtn = page.locator('[data-testid="variant-color-forest-green"]')
    await greenBtn.click()

    const plusBtn = page.locator('button[aria-label="Increase quantity"]')
    await plusBtn.click()
    await plusBtn.click() // qty -> 3

    await page.locator('[data-testid="add-to-cart-button"]').click()

    // 2. Go directly to checkout
    await page.goto('http://localhost:3000/checkout')
    await page.waitForLoadState('networkidle')

    // eSewa QR should be selectable and selected by default
    const esewaRadio = page.locator('[data-testid="payment-method-esewa"]')
    await expect(esewaRadio).toBeVisible()
    await expect(esewaRadio).toBeChecked()

    // Verify QR Section and dynamic merchant badge from CMS
    await expect(page.locator('[data-testid="esewa-qr-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="esewa-qr-image"]')).toBeVisible()
    await expect(page.locator('[data-testid="esewa-merchant-badge"]')).toContainText('Aura Technologies Pvt Ltd')
    await expect(page.locator('[data-testid="esewa-payable-amount"]')).toContainText(/7,?500\.00/)

    // Fill form
    await page.locator('[data-testid="checkout-fullname"]').fill('Aayush Shrestha')
    await page.locator('[data-testid="checkout-phone"]').fill('9841234567')
    await page.locator('[data-testid="checkout-email"]').fill('aayush@example.com')
    await page.locator('[data-testid="checkout-address"]').fill('Baluwatar, Ward 4')
    await page.locator('[data-testid="checkout-city"]').fill('Kathmandu')

    // Enter eSewa reference ID
    await page.locator('[data-testid="esewa-reference-input"]').fill('ESW-CONF-1122')

    // Submit Order
    await page.locator('[data-testid="place-order-button"]').click()

    // Success Page
    await page.waitForURL('**/checkout/success**', { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="success-payment-method"]')).toContainText('eSewa QR')
    await expect(page.locator('[data-testid="success-payment-status"]')).toContainText('Awaiting Verification')
  })

  test('Flow 3: Server Idempotency prevents duplicate order and double stock deduction', async ({
    request,
  }) => {
    const idempotencyKey = `e2e-idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // Resolve the real product/variant ids by SKU so the test is robust on a
    // fresh clone (ids are not stable across seeds).
    const variantRes = await request.get(
      'http://localhost:3000/api/variants?where[sku][equals]=AURA-NUM-PLA-WHT&depth=0&limit=1',
    )
    expect(variantRes.ok()).toBe(true)
    const variantJson = await variantRes.json()
    const variant = variantJson.docs?.[0]
    expect(variant, 'Numakers PLA Pure White variant must exist (run the seed)').toBeTruthy()
    const variantId = variant.id
    const productId = typeof variant.product === 'object' ? variant.product.id : variant.product

    const checkoutPayload = {
      idempotencyKey,
      customer: {
        fullName: 'Test Idempotency User',
        phone: '9841998877',
        email: 'idempotent@aura.local',
        address: 'Thamel, Ward 26',
        city: 'Kathmandu',
      },
      paymentMethod: 'cod',
      items: [
        {
          productId,
          variantId,
          quantity: 1,
        },
      ],
    }

    // Attempt 1: Initial Order Creation against real backend
    const res1 = await request.post('http://localhost:3000/api/checkout', {
      data: checkoutPayload,
    })
    expect(res1.ok()).toBe(true)
    const json1 = await res1.json()
    expect(json1.success).toBe(true)
    expect(json1.order.orderNumber).toMatch(/^AURA-ORD-/)
    const firstOrderNumber = json1.order.orderNumber

    // Attempt 2: Immediate Replay with the same idempotencyKey
    const res2 = await request.post('http://localhost:3000/api/checkout', {
      data: checkoutPayload,
    })
    expect(res2.ok()).toBe(true)
    const json2 = await res2.json()
    expect(json2.success).toBe(true)
    expect(json2.idempotentReplay).toBe(true)
    // Must return the exact same order number, not create a new one
    expect(json2.order.orderNumber).toBe(firstOrderNumber)
  })

  test('Flow 4: Missing eSewa QR on server returns HTTP 400 rejection', async ({ request }) => {
    // Current database does not have real QR configured
    const res = await request.post('http://localhost:3000/api/checkout', {
      data: {
        idempotencyKey: `e2e-no-qr-${Date.now()}`,
        customer: {
          fullName: 'Test Customer',
          phone: '9841001122',
          email: 'test@example.com',
          address: 'Kathmandu',
          city: 'Kathmandu',
        },
        paymentMethod: 'esewa_qr',
        paymentReference: 'TXN-1234',
        items: [{ productId: 3, variantId: 21, quantity: 1 }],
      },
    })

    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('eSewa QR payment is currently unavailable')
  })

  for (const vp of VIEWPORTS) {
    test(`Responsive check at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('http://localhost:3000/product/numakers-pla')
      await page.waitForLoadState('networkidle')

      // Ensure key interactive elements are present and clickable
      const addToCart = page.locator('[data-testid="add-to-cart-button"]')
      await expect(addToCart).toBeVisible()
    })
  }
})

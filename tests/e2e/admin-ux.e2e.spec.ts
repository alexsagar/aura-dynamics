import { test, expect } from '@playwright/test'
import { jwtSign } from '../../node_modules/payload/dist/auth/jwt.js'

// Pre-computed internal Payload secret hash for local dev
const SECRET = 'c0c551dd975f6f85e4969827ba4d1c30'
const SESSION_ID = 'aura-test-session-1790500773476'
const ADMIN_EMAIL = 'admin@auradynamics.com.np'

async function getAdminToken() {
  const { token } = await jwtSign({
    fieldsToSign: {
      id: 1,
      collection: 'users',
      email: ADMIN_EMAIL,
      sid: SESSION_ID,
    },
    secret: SECRET,
    tokenExpiration: 7 * 24 * 3600,
  })
  return token
}

test.use({ channel: 'chrome' })

test.describe('Aura Admin UI & Store Management Refinements', () => {
  test.setTimeout(90000)

  test('1. Unauthenticated Login Page Displays Official Aura Logo (Desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/admin/login')
    await page.waitForLoadState('networkidle')

    // Verify official Aura logo elements are present and unclipped
    const logo = page.locator('.aura-admin-logo')
    await expect(logo).toBeVisible()
    const symbolImg = logo.locator('img[alt="Aura Symbol"]')
    await expect(symbolImg).toBeVisible()

    // Verify image natural and rendered size
    const box = await symbolImg.boundingBox()
    expect(box?.width).toBeCloseTo(28, 1)
    expect(box?.height).toBeCloseTo(28, 1)

    await page.screenshot({ path: 'admin-login-desktop.png', fullPage: true })
  })

  test('2. Unauthenticated Login Page Displays Official Aura Logo (Mobile 390px)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    })
    const page = await context.newPage()
    await page.goto('http://localhost:3000/admin/login')
    await page.waitForLoadState('networkidle')

    const logo = page.locator('.aura-admin-logo')
    await expect(logo).toBeVisible()
    const symbolImg = logo.locator('img[alt="Aura Symbol"]')
    await expect(symbolImg).toBeVisible()

    await page.screenshot({ path: 'admin-login-mobile.png', fullPage: true })
    await context.close()
  })

  test('3. Dashboard with Authorized Session at Desktop (1440px)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })

    const token = await getAdminToken()
    await context.addCookies([
      {
        name: 'payload-token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ])

    const page = await context.newPage()
    await page.goto('http://localhost:3000/admin')
    await page.waitForLoadState('networkidle')

    // Verify Store Management Header
    const title = page.locator('.aura-dashboard-title')
    await expect(title).toHaveText('Store Management')

    // Verify accurate environment, currency, and storage indicators
    await expect(page.locator('.aura-pill:has-text("Environment: Development")')).toBeVisible()
    await expect(page.locator('.aura-pill:has-text("Currency: NPR (Rs.)")')).toBeVisible()
    await expect(page.locator('.aura-pill:has-text("Storage: Local R2 Emulator")')).toBeVisible()

    // Verify no redundant cards grid exists
    await expect(page.locator('.aura-dashboard-grid')).toHaveCount(0)

    // Verify Operational Policy Notice Box
    const notice = page.locator('.aura-notice-box')
    await expect(notice).toBeVisible()
    await expect(notice).toContainText('Currency Policy')
    await expect(notice).toContainText('Color Variant Notice')

    // Verify Payload native grouped navigation sections are present and single-source
    await expect(page.locator('h2:has-text("Catalog")')).toBeVisible()
    await expect(page.locator('h2:has-text("Store")')).toBeVisible()
    await expect(page.locator('h2:has-text("Content")')).toBeVisible()
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible()

    // Verify Sidebar Navigation contains grouped areas
    const nav = page.locator('.nav')
    await expect(nav.locator('button:has-text("Catalog")')).toBeVisible()
    await expect(nav.locator('button:has-text("Store")')).toBeVisible()
    await expect(nav.locator('button:has-text("Content")')).toBeVisible()
    await expect(nav.locator('button:has-text("Settings")')).toBeVisible()

    await page.screenshot({ path: 'admin-dashboard-desktop-1440.png', fullPage: true })
    await context.close()
  })

  test('4. Dashboard at Mobile Width (390px)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    })

    const token = await getAdminToken()
    await context.addCookies([
      {
        name: 'payload-token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ])

    const page = await context.newPage()
    await page.goto('http://localhost:3000/admin')
    await page.waitForLoadState('networkidle')

    // Verify responsive header and pills render properly on mobile
    const title = page.locator('.aura-dashboard-title')
    await expect(title).toBeVisible()
    await expect(page.locator('.aura-pill:has-text("Environment: Development")')).toBeVisible()

    await page.screenshot({ path: 'admin-dashboard-mobile-390.png', fullPage: true })
    await context.close()
  })

  test('5. Product Edit Form (Numakers PLA) Operational Inspection', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
    })

    const token = await getAdminToken()
    await context.addCookies([
      {
        name: 'payload-token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ])

    const page = await context.newPage()
    await page.goto('http://localhost:3000/admin/collections/products/3')
    await page.waitForLoadState('networkidle')

    // Wait for client-side relationship sub-queries and variant table to populate
    await page.waitForSelector('text=Loading', { state: 'detached', timeout: 10000 }).catch(() => {})

    // Verify Title input has Numakers PLA
    const titleInput = page.locator('#field-title')
    await expect(titleInput).toHaveValue('Numakers PLA')

    // Verify Variant Types have Color selected
    await expect(page.locator('text=Color').first()).toBeVisible()

    // Verify Material in Filament Details has PLA selected
    await expect(page.locator('text=PLA').first()).toBeVisible()

    // Verify real color variants are listed in the table
    await expect(page.locator('text=Numakers PLA — Pure White').first()).toBeVisible()
    await expect(page.locator('text=Numakers PLA — Pitch Black').first()).toBeVisible()

    // Verify "Enable NPR price" checkbox is unchecked (expected for variant-priced products)
    const enablePriceCheckbox = page.locator('#field-enablePriceInNPR')
    if (await enablePriceCheckbox.count() > 0) {
      await expect(enablePriceCheckbox).not.toBeChecked()
    }

    await page.screenshot({ path: 'admin-product-edit-desktop.png', fullPage: true })
    await context.close()
  })

  test('6. Media Library Collection View with Human-Readable File Sizes', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })

    const token = await getAdminToken()
    await context.addCookies([
      {
        name: 'payload-token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ])

    const page = await context.newPage()
    await page.goto('http://localhost:3000/admin/collections/media')
    await page.waitForLoadState('networkidle')

    // Verify media list view heading
    const heading = page.locator('h1:has-text("Media")')
    await expect(heading).toBeVisible()

    // Verify human-readable file sizes are rendered (e.g. "KB" format instead of raw bytes)
    await expect(page.locator('text=/\\d+(\\.\\d+)?\\s*(KB|MB|B)/').first()).toBeVisible()

    await page.screenshot({ path: 'admin-media-list-desktop.png', fullPage: true })
    await context.close()
  })

  test('7. Homepage Global Edit Form with Collapsible Sections', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })

    const token = await getAdminToken()
    await context.addCookies([
      {
        name: 'payload-token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ])

    const page = await context.newPage()
    await page.goto('http://localhost:3000/admin/globals/homepage')
    await page.waitForLoadState('networkidle')

    // Verify Collapsible sections are rendered
    await expect(page.locator('text=1. Hero Section')).toBeVisible()
    await expect(page.locator('text=2. Shop Categories')).toBeVisible()
    await expect(page.locator('text=3. Popular Products')).toBeVisible()

    // Verify Hero Heading has "Form meets function."
    const heroHeading = page.locator('#field-hero__heading')
    await expect(heroHeading).toHaveValue('Form meets function.')

    await page.screenshot({ path: 'admin-homepage-global-desktop.png', fullPage: true })
    await context.close()
  })
})

import { test, expect } from '@playwright/test'

test.use({ channel: 'chrome' })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
]

for (const vp of VIEWPORTS) {
  test.describe(`Filaments & Variant Photography Verification at ${vp.name}px`, () => {
    test.setTimeout(90000)

    test(`1. Verify / (Homepage) at ${vp.name}px`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      })
      const page = await context.newPage()
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto('http://localhost:3000/')
      await page.waitForLoadState('networkidle')

      // Check hero section elements
      const heroHeading = page.locator('h1').first()
      await expect(heroHeading).toBeVisible()

      // Hero image is rendered
      const heroImg = page.locator('section img').first()
      await expect(heroImg).toBeVisible()

      // Check no hydration errors
      const hydrationErrors = consoleErrors.filter((err) =>
        /hydration|did not match|react-dom/i.test(err),
      )
      expect(hydrationErrors).toHaveLength(0)

      await context.close()
    })

    test(`2. Verify /filaments catalog default at ${vp.name}px`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      })
      const page = await context.newPage()
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto('http://localhost:3000/filaments')
      await page.waitForLoadState('networkidle')

      // Product card title is Numakers PLA
      const productCardTitle = page.locator('text=Numakers PLA').first()
      await expect(productCardTitle).toBeVisible()

      // No customer-facing PLA+ exists
      const plaPlus = page.locator('text=PLA+')
      expect(await plaPlus.count()).toBe(0)
      const numakersPlaPlus = page.locator('text=Numakers PLA+')
      expect(await numakersPlaPlus.count()).toBe(0)

      // No Packaging filter is rendered
      const packagingHeading = page.locator('button:has-text("Packaging")')
      expect(await packagingHeading.count()).toBe(0)

      // Default card image should be pure-white (or variant spool image)
      const cardImg = page.locator('article img[alt="Numakers PLA"]').first()
      await expect(cardImg).toBeVisible()
      const src = await cardImg.getAttribute('src')
      expect(src).toContain('numakers-pla-pure-white')
      expect(src).not.toContain('homepage-staff-pick-temp')
      expect(src).not.toContain('homepage-category-filaments-temp')

      // Check hydration errors
      const hydrationErrors = consoleErrors.filter((err) =>
        /hydration|did not match|react-dom/i.test(err),
      )
      expect(hydrationErrors).toHaveLength(0)

      await context.close()
    })

    test(`3. Verify /filaments?color=forest-green at ${vp.name}px`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      })
      const page = await context.newPage()
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto('http://localhost:3000/filaments?color=forest-green')
      await page.waitForLoadState('networkidle')

      // Numakers PLA card must be visible
      const productCardTitle = page.locator('text=Numakers PLA').first()
      await expect(productCardTitle).toBeVisible()

      // Card image MUST be forest-green
      const cardImg = page.locator('article img[alt="Numakers PLA"]').first()
      await expect(cardImg).toBeVisible()
      const src = await cardImg.getAttribute('src')
      expect(src).toContain('numakers-pla-forest-green')

      // Check hydration errors
      const hydrationErrors = consoleErrors.filter((err) =>
        /hydration|did not match|react-dom/i.test(err),
      )
      expect(hydrationErrors).toHaveLength(0)

      await context.close()
    })

    test(`4. Verify /filaments?color=transparent at ${vp.name}px`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      })
      const page = await context.newPage()
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto('http://localhost:3000/filaments?color=transparent')
      await page.waitForLoadState('networkidle')

      // Numakers PLA card must be visible
      const productCardTitle = page.locator('text=Numakers PLA').first()
      await expect(productCardTitle).toBeVisible()

      // Card image MUST be transparent
      const cardImg = page.locator('article img[alt="Numakers PLA"]').first()
      await expect(cardImg).toBeVisible()
      const src = await cardImg.getAttribute('src')
      expect(src).toContain('numakers-pla-transparent')

      // Check hydration errors
      const hydrationErrors = consoleErrors.filter((err) =>
        /hydration|did not match|react-dom/i.test(err),
      )
      expect(hydrationErrors).toHaveLength(0)

      await context.close()
    })

    test(`5. Verify /product/numakers-pla interactive image switching at ${vp.name}px`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      })
      const page = await context.newPage()
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto('http://localhost:3000/product/numakers-pla')
      await page.waitForLoadState('networkidle')

      // Heading check
      const heading = page.locator('h1:has-text("Numakers PLA")')
      await expect(heading).toBeVisible()

      // Main image element
      const mainImg = page.locator('[data-testid="product-gallery-main-image"]')
      await expect(mainImg).toBeVisible()

      // Initial state: Pure White image
      let currentSrc = await mainImg.getAttribute('src')
      expect(currentSrc).toContain('numakers-pla-pure-white')

      // Test color switching across all variants
      const colorVariants = [
        { label: 'Pitch Black', key: 'pitch-black', file: 'numakers-pla-pitch-black' },
        { label: 'Forest Green', key: 'forest-green', file: 'numakers-pla-forest-green' },
        { label: 'Nuclear Red', key: 'nuclear-red', file: 'numakers-pla-nuclear-red' },
        { label: 'Royal Blue', key: 'royal-blue', file: 'numakers-pla-royal-blue' },
        { label: 'Lemon Yellow', key: 'lemon-yellow', file: 'numakers-pla-lemon-yellow' },
        { label: 'Transparent', key: 'transparent', file: 'numakers-pla-transparent' },
        { label: 'Pure White', key: 'pure-white', file: 'numakers-pla-pure-white' },
      ]

      for (const variant of colorVariants) {
        const btn = page.locator(`[data-testid="variant-color-${variant.key}"]`)
        await expect(btn).toBeVisible()
        await btn.click()

        // Verify main image switched without full page reload
        await expect(async () => {
          const src = await mainImg.getAttribute('src')
          expect(src).toContain(variant.file)
        }).toPass({ timeout: 5000 })

        // Check aria-pressed
        await expect(btn).toHaveAttribute('aria-pressed', 'true')
      }

      // Check no obsolete placeholder image appears anywhere
      const allPageImages = await page.locator('img').evaluateAll((imgs) =>
        imgs.map((img) => (img as HTMLImageElement).src)
      )
      for (const imgUrl of allPageImages) {
        expect(imgUrl).not.toContain('homepage-staff-pick-temp')
        expect(imgUrl).not.toContain('homepage-category-filaments-temp')
      }

      // Check hydration errors
      const hydrationErrors = consoleErrors.filter((err) =>
        /hydration|did not match|react-dom/i.test(err),
      )
      expect(hydrationErrors).toHaveLength(0)

      await context.close()
    })
  })
}

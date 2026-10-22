import { expect, test } from '@playwright/test'
import path from 'node:path'

const reviewDir = path.join('docs', 'm4b-review')

async function waitForCover(page: import('@playwright/test').Page) {
  const cover = page.locator('article figure img').first()
  await expect(cover).toBeVisible()
  await expect
    .poll(async () => cover.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0)
}

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    return doc.scrollWidth > doc.clientWidth + 1
  })
  expect(overflow).toBe(false)
}

test.describe('M4b visual review captures', () => {
  for (const width of [390, 768, 1280, 1440] as const) {
    test(`case study preview full page @ ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/work/map-areas')
      await expect(
        page.getByRole('heading', { level: 1, name: 'Map Areas' }),
      ).toBeVisible()
      await waitForCover(page)
      await assertNoHorizontalOverflow(page)
      await page.screenshot({
        path: path.join(reviewDir, `case-study-preview-${width}.png`),
        fullPage: true,
      })
    })
  }

  test('404 full page @ 390', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/work/does-not-exist')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeVisible()
    await assertNoHorizontalOverflow(page)
    await page.screenshot({
      path: path.join(reviewDir, 'not-found-390.png'),
      fullPage: true,
    })
  })

  test('case study preview reduced-motion @ 1280', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1280, height: 900 },
    })
    const page = await context.newPage()
    await page.goto('/work/map-areas')
    await expect(page.getByText('Project preview')).toBeVisible()
    await waitForCover(page)
    await page.screenshot({
      path: path.join(reviewDir, 'case-study-reduced-1280.png'),
      fullPage: true,
    })
    await context.close()
  })
})

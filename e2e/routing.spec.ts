import { expect, test } from '@playwright/test'
import path from 'node:path'

const reviewDir = path.join('docs', 'm4b-review')

test.describe('M4b routing', () => {
  test('home loads and withholds case-study CTA for preview projects', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'André Arcodaci' }),
    ).toBeVisible()
    await expect(page.getByText('Case study soon')).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Case study' }),
    ).toHaveCount(0)
    await page.screenshot({
      path: path.join(reviewDir, 'home-1280.png'),
      fullPage: false,
    })
  })

  test('direct URL and refresh serve Map Areas preview via SPA fallback', async ({
    page,
  }) => {
    await page.goto('/work/map-areas')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Map Areas' }),
    ).toBeVisible()
    await expect(page.getByText('Project preview')).toBeVisible()
    await expect(page.getByText(/2025–2026/)).toBeVisible()
    await expect(
      page.getByText(/learn and apply foundational GIS concepts/i),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Repository' })).toHaveCount(0)
    await expect(page.getByText(/Problem statement TBD/i)).toHaveCount(0)
    const cover = page.locator('article figure.cover img, article figure img').first()
    await expect(cover).toBeVisible()
    await expect
      .poll(async () => cover.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0)

    await page.reload()
    await expect(
      page.getByRole('heading', { level: 1, name: 'Map Areas' }),
    ).toBeVisible()
    await expect(page.getByText('Project preview')).toBeVisible()
  })

  test('unknown slug shows in-app not found', async ({ page }) => {
    await page.goto('/work/does-not-exist')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeVisible()
    await page.screenshot({
      path: path.join(reviewDir, 'not-found-1280.png'),
      fullPage: false,
    })
  })

  test('browser back and forward between home and preview', async ({
    page,
  }) => {
    await page.goto('/')
    await page.goto('/work/map-areas')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Map Areas' }),
    ).toBeVisible()

    await page.goBack()
    await expect(
      page.getByRole('heading', { level: 1, name: 'André Arcodaci' }),
    ).toBeVisible()

    await page.goForward()
    await expect(
      page.getByRole('heading', { level: 1, name: 'Map Areas' }),
    ).toBeVisible()
  })

  test('reduced-motion still shows preview content', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await page.goto('/work/map-areas')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Map Areas' }),
    ).toBeVisible()
    await expect(page.getByText('Project preview')).toBeVisible()
    await context.close()
  })
})


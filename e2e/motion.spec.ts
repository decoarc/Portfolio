import { expect, test } from '@playwright/test'

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('homepage stays visible without entrance motion', async ({ page }) => {
    await page.goto('/')
    const hero = page.locator('h1 span').first()
    await expect(hero).toBeVisible()
    await expect(hero).toHaveCSS('opacity', '1')
    await expect(hero).toHaveCSS('animation-name', 'none')
    await expect(page.getByRole('heading', { name: 'Selected work' })).toBeVisible()
    await expect(page.locator('#work')).toHaveCSS('opacity', '1')
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior))
      .toBe('auto')
  })
})

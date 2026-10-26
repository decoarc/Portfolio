import { expect, test } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'

/** Os dois CTAs do hero cabem inteiros na primeira dobra, abaixo da barra superior. */
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
] as const

const ROUTES = [
  { path: '/', locale: 'en' },
  { path: '/pt', locale: 'pt' },
] as const

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`CTAs na primeira dobra · ${viewport.name} · ${route.locale}`, async ({
      page,
    }) => {
      const { site } = contentByLocale[route.locale]
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await page.goto(route.path)
      await page.evaluate(() => document.fonts.ready.then(() => true))

      const hero = page.getByRole('region', { name: site.person.name })
      for (const label of [site.hero.ctaPrimary, site.hero.ctaSecondary]) {
        const box = await hero.getByRole('link', { name: label }).boundingBox()
        expect(box, label).not.toBeNull()
        if (!box) continue
        expect(box.y, label).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, label).toBeLessThanOrEqual(viewport.height)
      }
    })
  }
}

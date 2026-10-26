import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** Cada comp novo entra aqui e herda a matriz inteira de verificação. */
const COMPS = ['01-inspection-slot', '02-editorial-rolodex'] as const

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

const LOCALES = ['en', 'pt'] as const

for (const comp of COMPS) {
  for (const viewport of VIEWPORTS) {
    for (const locale of LOCALES) {
      test(`${comp} · ${viewport.name} · ${locale}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await page.goto(`/design/comps/${comp}.html?locale=${locale}&chrome=0`)
        await page.evaluate(() => document.fonts.ready.then(() => true))

        await expect(page.locator('[data-region="hero"]')).toBeVisible()
        await expect(page.locator('[data-region="work"]')).toBeVisible()

        // A copy veio do módulo compartilhado, não ficou placeholder vazio.
        await expect(page.locator('[data-copy="person.name"]')).toHaveText(
          'André Arcodaci',
        )
        await expect(page.locator('[data-work-list] > li')).toHaveCount(4)

        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        )
        expect(overflow, 'sem overflow horizontal').toBeLessThanOrEqual(1)

        const animations = await page.evaluate(() => document.getAnimations().length)
        expect(animations, 'comp estático: nenhuma animação declarada').toBe(0)

        const results = await new AxeBuilder({ page })
          .withRules(['color-contrast'])
          .analyze()
        expect(
          results.violations,
          'contraste WCAG AA em todo texto do comp',
        ).toEqual([])
      })
    }
  }
}

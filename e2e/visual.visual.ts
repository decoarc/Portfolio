import { expect, test, type Page } from '@playwright/test'
import { VIEWPORTS } from './routes.ts'

/**
 * Regressão visual: hero, #work, #contact e o case /work/map-areas, nos dois
 * idiomas e nos três viewports. Baselines em e2e/visual.visual.ts-snapshots/.
 * Regrave com `pnpm test:visual:update` só quando a mudança visual for pedida.
 */
const LOCALES = [
  { locale: 'en', home: '/', caseStudy: '/work/map-areas' },
  { locale: 'pt', home: '/pt', caseStudy: '/pt/work/map-areas' },
] as const

const PARTS = [
  { part: 'hero', selector: 'section[aria-labelledby="hero-name"]' },
  { part: 'trajectory', selector: '#trajectory' },
  { part: 'tools', selector: '#tools' },
  { part: 'work', selector: '#work' },
  { part: 'contact', selector: '#contact' },
] as const

async function settle(page: Page) {
  // Hidratou de verdade: o React marca os nós do #root (o masthead) com `__reactFiber$`.
  // Sem isso a espera de fontes e de entrada passa sobre o HTML estático.
  await page.waitForFunction(() => {
    const node = document.querySelector('#root header')
    return (
      node !== null &&
      Object.keys(node).some((key) => key.startsWith('__reactFiber$'))
    )
  })
  await page.evaluate(() => document.fonts.ready.then(() => true))
  // Sem entrada nem texto que acende: a captura é do estado final.
  await expect(page.locator('[data-entrance]')).toHaveCount(0)
  await expect(page.locator('[data-lit]')).toHaveCount(0)
}

for (const viewport of VIEWPORTS) {
  for (const { locale, home, caseStudy } of LOCALES) {
    test.describe(`${viewport.width}x${viewport.height} · ${locale}`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } })

      for (const { part, selector } of PARTS) {
        test(part, async ({ page }) => {
          await page.goto(home)
          await settle(page)
          await expect(page.locator(selector)).toHaveScreenshot(
            `${part}-${viewport.name}-${locale}.png`,
          )
        })
      }

      test('case map-areas', async ({ page }) => {
        await page.goto(caseStudy)
        await settle(page)
        await expect(page).toHaveScreenshot(
          `case-${viewport.name}-${locale}.png`,
          { fullPage: true },
        )
      })
    })
  }
}

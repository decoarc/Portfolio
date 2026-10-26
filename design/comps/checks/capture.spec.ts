import { test } from '@playwright/test'

const COMPS = [
  '01-inspection-slot',
  '02-editorial-rolodex',
  '03-spatial-gallery',
] as const

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

const LOCALES = ['en', 'pt'] as const

for (const comp of COMPS) {
  for (const viewport of VIEWPORTS) {
    for (const locale of LOCALES) {
      test(`captura ${comp} · ${viewport.name} · ${locale}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await page.goto(`/design/comps/${comp}.html?locale=${locale}&chrome=0`)
        await page.evaluate(() => document.fonts.ready.then(() => true))
        await page.screenshot({
          path: `docs/gate-1/${comp}-${viewport.name}-${locale}.png`,
          fullPage: true,
        })
      })
    }
  }
}

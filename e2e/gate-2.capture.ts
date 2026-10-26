import { test } from '@playwright/test'

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

const LOCALES = [
  { name: 'en', path: '/' },
  { name: 'pt', path: '/pt' },
] as const

for (const viewport of VIEWPORTS) {
  for (const locale of LOCALES) {
    test(`gate 2 · home · ${viewport.name} · ${locale.name}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await page.goto(locale.path)
      await page.evaluate(() => document.fonts.ready.then(() => true))
      /**
       * Caminho ancorado no `testDir` do projeto (`e2e`), não no cwd: rodado de
       * outro diretório, um caminho relativo gravaria as capturas numa árvore
       * errada em silêncio. Um nível acima está a raiz do repositório.
       */
      const outDir = `${testInfo.project.testDir}/../docs/gate-2`
      await page.screenshot({
        path: `${outDir}/home-${viewport.name}-${locale.name}.png`,
        fullPage: false,
      })
    })
  }
}

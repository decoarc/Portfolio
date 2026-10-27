import { test } from '@playwright/test'
import fs from 'node:fs'

/**
 * Imagens de publicação (design §6): o primeiro viewport real de `/` e `/pt`
 * em 1200 × 630, com reduced motion, e o `apple-touch-icon` a partir do
 * `favicon.svg`. Os PNGs gerados são commitados.
 */
test.use({ reducedMotion: 'reduce', viewport: { width: 1200, height: 630 } })

const outRoot = (testDir: string) => `${testDir}/../public`

for (const { locale, path } of [
  { locale: 'en', path: '/' },
  { locale: 'pt', path: '/pt' },
]) {
  test(`og · ${locale}`, async ({ page }, testInfo) => {
    await page.goto(path)
    await page.evaluate(() => document.fonts.ready.then(() => true))
    await page.screenshot({
      path: `${outRoot(testInfo.project.testDir)}/og/home-${locale}.png`,
    })
  })
}

test('apple-touch-icon', async ({ page }, testInfo) => {
  const root = outRoot(testInfo.project.testDir)
  const svg = fs.readFileSync(`${root}/favicon.svg`, 'utf8')
  await page.setViewportSize({ width: 180, height: 180 })
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:180px;height:180px}</style>${svg}`,
  )
  await page.screenshot({ path: `${root}/apple-touch-icon.png` })
})

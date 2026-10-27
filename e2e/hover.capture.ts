import { test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'

const { site } = contentByLocale.en

/** Caminho ancorado no `testDir` do projeto (`e2e`), como em `gate-3.capture.ts`. */
function outDir(testInfo: { project: { testDir: string } }) {
  return `${testInfo.project.testDir}/../docs/fase-3/segunda-leva`
}

async function open(page: Page) {
  await page.goto('/')
  await page.waitForSelector('[data-entrance="done"]')
  await page.evaluate(() => document.fonts.ready.then(() => true))
}

test.describe('hover · com motion', () => {
  test.use({ reducedMotion: 'no-preference' })

  test.describe('desktop 1440×900', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('hover no CTA primário', async ({ page }, testInfo) => {
      await open(page)
      await page
        .getByRole('region', { name: site.person.name })
        .getByRole('link', { name: site.hero.ctaPrimary })
        .hover()
      await page.waitForTimeout(1000)
      await page.screenshot({
        path: `${outDir(testInfo)}/hero-cta-hover-1440.png`,
      })
    })

    test('foco no GitHub', async ({ page }, testInfo) => {
      await open(page)
      const github = page.getByRole('link', {
        name: `GitHub ${site.links.externalHint}`,
      })
      await github.focus()
      await page.waitForTimeout(1000)
      await page.screenshot({
        path: `${outDir(testInfo)}/contato-github-foco-1440.png`,
      })
    })

    test('hover na 2ª ficha', async ({ page }, testInfo) => {
      await open(page)
      const slip = page.locator('#work ol > li').nth(1)
      await slip.scrollIntoViewIfNeeded()
      await slip.hover()
      await page.waitForTimeout(1000)
      await page.screenshot({
        path: `${outDir(testInfo)}/lista-hover-1440.png`,
      })
    })
  })

  test.describe('mobile 390×844', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('lista com miniaturas', async ({ page }, testInfo) => {
      await open(page)
      await page.locator('#work').scrollIntoViewIfNeeded()
      await page.locator('#work ol > li').first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
      await page.screenshot({
        path: `${outDir(testInfo)}/lista-mobile-390.png`,
      })
    })
  })
})

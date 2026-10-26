import { expect, test, type Page } from '@playwright/test'

const PAGES = ['/', '/work/token-killer'] as const

async function exercise(page: Page, path: string) {
  await page.goto(path)
  await page.evaluate(() => document.fonts.ready.then(() => true))
  const title = page.locator('main h3 a, main h1').first()
  await title.hover()
  await page.getByRole('link').nth(1).focus()
  await page.keyboard.press('Tab')
}

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test.describe(`prefers-reduced-motion: ${reducedMotion}`, () => {
    test.use({ reducedMotion })

    for (const path of PAGES) {
      test(`nenhuma animação ativa · ${path}`, async ({ page }) => {
        await exercise(page, path)
        const count = await page.evaluate(() => document.getAnimations().length)
        expect(count).toBe(0)
        /**
         * `getAnimations()` só vê transições em curso; uma `transition`
         * declarada e ainda não disparada passaria. A duração calculada pega
         * a declaração em si.
         */
        const timed = await page.evaluate(() => {
          const durations = (value: string) =>
            value.split(',').some((part) => parseFloat(part) > 0)
          for (const el of document.querySelectorAll('*')) {
            const style = getComputedStyle(el)
            if (
              durations(style.transitionDuration) ||
              durations(style.animationDuration)
            ) {
              return el.tagName.toLowerCase() + '.' + String(el.className)
            }
          }
          return null
        })
        expect(timed).toBeNull()
      })
    }
  })
}

test('a Fraunces completa foi carregada', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready.then(() => true))
  const names = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name),
  )
  expect(
    names.some((name) => name.includes('fraunces-latin-full-normal')),
    names.join('\n'),
  ).toBe(true)
})

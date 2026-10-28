import { test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'
import { freezeAt, release } from './title-flight.helpers.ts'

const en = contentByLocale.en.site
const SLUG = 'local-email-client'

/** Caminho ancorado no `testDir` do projeto (`e2e`), como em `hover.capture.ts`. */
function outDir(testInfo: { project: { testDir: string } }) {
  return `${testInfo.project.testDir}/../docs/fase-3/segunda-leva`
}

async function open(page: Page) {
  await page.goto('/')
  await page.waitForSelector('[data-entrance="done"]')
  await page.evaluate(() => document.fonts.ready.then(() => true))
}

/** Instantes congelados: começo, metade do título e fim de tudo (ms desde o início). */
const IDA = [
  ['0', 0],
  ['50', 400],
  ['100', 1050],
] as const
const VOLTA = [
  ['0', 0],
  ['50', 375],
  ['100', 750],
] as const

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
] as const

test.describe('título que viaja · capturas', () => {
  test.use({ reducedMotion: 'no-preference' })

  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name}`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } })

      for (const [dir, frames] of [
        ['ida', IDA],
        ['volta', VOLTA],
      ] as const) {
        for (const [label, ms] of frames) {
          test(`${dir} ${label}`, async ({ page }, testInfo) => {
            await open(page)
            const slip = page.locator(`#work-${SLUG} a[data-anchor-focus]`)
            if (dir === 'ida') {
              await slip.scrollIntoViewIfNeeded()
              await page.waitForTimeout(300)
              await slip.click()
            } else {
              await slip.click()
              await page.waitForURL(new RegExp(`/work/${SLUG}$`))
              await page.waitForFunction(() =>
                document
                  .getAnimations()
                  .every(
                    (a) =>
                      !(
                        a.effect as KeyframeEffect | null
                      )?.pseudoElement?.includes('view-transition'),
                  ),
              )
              await page
                .getByRole('link', { name: en.caseStudy.backToWork })
                .click()
            }
            await freezeAt(page, ms)
            await page.screenshot({
              path: `${outDir(testInfo)}/titulo-viaja-${viewport.name}-${dir}-${label}.png`,
            })
            await release(page)
          })
        }
      }
    })
  }
})

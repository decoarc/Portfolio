import { test, type Page } from '@playwright/test'
import { VIEWPORTS } from './routes.ts'

const LOCALES = [
  { name: 'en', path: '/' },
  { name: 'pt', path: '/pt' },
] as const

/** Progresso da abertura em que cada captura é feita (fração da altura da tela). */
const PROGRESS = [0, 0.5, 1] as const

/** Espera o scroll parar de mudar e mais um frame, para as `--opening-*` assentarem. */
async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = -1
        let still = 0
        const tick = () => {
          if (window.scrollY === last) still += 1
          else still = 0
          last = window.scrollY
          if (still >= 10) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )
}

async function scrollToProgress(page: Page, progress: number) {
  await page.evaluate(
    (progress) => window.scrollTo(0, Math.round(progress * innerHeight)),
    progress,
  )
  await settle(page)
}

for (const viewport of VIEWPORTS) {
  for (const locale of LOCALES) {
    test.describe(`gate 3 · ${viewport.name} · ${locale.name}`, () => {
      test.describe('com motion', () => {
        test.use({ reducedMotion: 'no-preference' })

        test('abertura em p = 0, 50 e 100', async ({ page }, testInfo) => {
          await page.setViewportSize(viewport)
          await page.goto(locale.path)
          await page.waitForSelector('[data-entrance="done"]')
          /**
           * Caminho ancorado no `testDir` do projeto (`e2e`), não no cwd, como
           * em `gate-2.capture.ts`.
           */
          const outDir = `${testInfo.project.testDir}/../docs/gate-3`
          for (const progress of PROGRESS) {
            await scrollToProgress(page, progress)
            await page.screenshot({
              path: `${outDir}/home-${viewport.name}-${locale.name}-p${progress * 100}.png`,
            })
          }
        })
      })

      test.describe('com reduced motion', () => {
        test.use({ reducedMotion: 'reduce' })

        test('meio da abertura, sem motion', async ({ page }, testInfo) => {
          await page.setViewportSize(viewport)
          await page.goto(locale.path)
          await page.evaluate(() => document.fonts.ready.then(() => true))
          await scrollToProgress(page, 0.5)
          const outDir = `${testInfo.project.testDir}/../docs/gate-3`
          await page.screenshot({
            path: `${outDir}/home-${viewport.name}-${locale.name}-reduce-p50.png`,
          })
        })
      })
    })
  }
}

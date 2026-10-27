import { expect, test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'

const en = contentByLocale.en.site
const pt = contentByLocale.pt.site

/** Espera o scroll parar de mudar (o Lenis interpola por alguns frames). */
async function settledScrollY(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let last = -1
        let still = 0
        const tick = () => {
          if (window.scrollY === last) still += 1
          else still = 0
          last = window.scrollY
          if (still >= 10) resolve(last)
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )
}

test.describe('sem preferência de movimento', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('o scroll suave está ligado', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/\blenis\b/)
  })

  test('depois de trocar de idioma duas vezes, a roda rola a distância certa', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: en.shell.localeSwitch }).click()
    await expect(page).toHaveURL(/\/pt$/)
    await page.getByRole('link', { name: pt.shell.localeSwitch }).click()
    await expect.poll(() => new URL(page.url()).pathname).toBe('/')
    await settledScrollY(page)

    await page.mouse.move(400, 400)
    await page.mouse.wheel(0, 400)
    const y = await settledScrollY(page)
    expect(y).toBeGreaterThan(300)
    expect(y).toBeLessThan(500)
  })

  test('link de âncora rola suave, sem salto, e termina na seção', async ({
    page,
  }) => {
    await page.goto('/')
    await page
      .getByRole('region', { name: en.person.name })
      .getByRole('link', { name: en.hero.ctaSecondary })
      .click()
    // Logo depois do clique a página ainda está a caminho: um salto nativo já
    // estaria no destino.
    const early = await page.evaluate(() => window.scrollY)
    const final = await settledScrollY(page)
    expect(final).toBeGreaterThan(0)
    expect(early).toBeLessThan(final)
    await expect(page).toHaveURL(/#contact$/)
    await expect(page.locator('#contact')).toBeInViewport()
    await expect(page.locator('#contact')).toBeFocused()
  })

  test('o case study abre no topo mesmo com a home rolada', async ({
    page,
  }) => {
    await page.goto('/#about')
    expect(await settledScrollY(page)).toBeGreaterThan(0)
    await page.getByRole('link', { name: /Token Killer/ }).click()
    await expect(page).toHaveURL(/\/work\/token-killer$/)
    await expect.poll(() => settledScrollY(page)).toBe(0)
  })
})

test.describe('com reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('o scroll suave fica desligado', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('html')).not.toHaveClass(/\blenis\b/)
  })
})

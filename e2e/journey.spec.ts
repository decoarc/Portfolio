import { expect, test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'

const en = contentByLocale.en.site
const pt = contentByLocale.pt.site

async function openCaseAndGoBack(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: /Local Email Client/ }).click()
  await expect(page).toHaveURL(/\/work\/local-email-client$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Local Email Client' }),
  ).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.tagName))
    .toBe('H1')

  await page.getByRole('link', { name: en.caseStudy.backToWork }).click()
  await expect
    .poll(() => {
      const url = new URL(page.url())
      return `${url.pathname}${url.hash}`
    })
    .toBe('/#work-local-email-client')
  await expect(page.locator('#work-local-email-client')).toBeInViewport({
    ratio: 1,
  })
  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.activeElement
        return {
          anchorFocus: active?.hasAttribute('data-anchor-focus') ?? false,
          text: active?.textContent ?? '',
        }
      }),
    )
    .toMatchObject({
      anchorFocus: true,
      text: expect.stringContaining('Local Email Client'),
    })
}

test('home → case study → de volta à ficha, com foco no título', async ({
  page,
}) => {
  await openCaseAndGoBack(page)
})

test('no celular, a volta deixa a ficha em viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openCaseAndGoBack(page)
})

test('botão voltar do navegador: home e foco em #main', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Local Email Client/ }).click()
  await expect(page).toHaveURL(/\/work\/local-email-client$/)
  await page.goBack()
  await expect
    .poll(() => {
      const url = new URL(page.url())
      return `${url.pathname}${url.hash}`
    })
    .toBe('/')
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id))
    .toBe('main')
})

/** Espera a rolagem parar (o Lenis interpola por alguns frames) e a devolve. */
function settledScroll(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let last = -1
        let still = 0
        const tick = () => {
          if (window.scrollY === last) still += 1
          else still = 0
          last = window.scrollY
          if (still >= 10) resolve(Math.round(last))
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )
}

// O router repete a View Transition no voltar entre páginas que já viajaram,
// e a troca de página fica para dentro dela: a restauração nativa do
// navegador acontece antes, ainda sobre o case (mais curto), e corta a
// posição. Vale apertar na hora e depois da viagem.
for (const wait of [0, 1200]) {
  test(`botão voltar do navegador devolve a home na posição de antes (${wait} ms)`, async ({
    page,
  }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: /Local Email Client/ })
    await link.scrollIntoViewIfNeeded()
    const before = await settledScroll(page)
    expect(before).toBeGreaterThan(0)
    await link.click()
    await expect(page).toHaveURL(/\/work\/local-email-client$/)
    if (wait) await page.waitForTimeout(wait)
    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
    await expect.poll(() => settledScroll(page)).toBe(before)
  })
}

test('trocar o idioma num case study preserva o projeto', async ({ page }) => {
  await page.goto('/work/local-email-client')
  await page.getByRole('link', { name: en.shell.localeSwitch }).click()
  await expect(page).toHaveURL(/\/pt\/work\/local-email-client$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Local Email Client' }),
  ).toBeVisible()

  await page.getByRole('link', { name: pt.shell.localeSwitch }).click()
  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe('/work/local-email-client')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('trocar o idioma em /pt#contact leva a /#contact', async ({ page }) => {
  await page.goto('/pt#contact')
  await page.getByRole('link', { name: pt.shell.localeSwitch }).click()
  await expect
    .poll(() => {
      const url = new URL(page.url())
      return `${url.pathname}${url.hash}`
    })
    .toBe('/#contact')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

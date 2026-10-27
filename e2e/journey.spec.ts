import { expect, test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'

const en = contentByLocale.en.site
const pt = contentByLocale.pt.site

async function openCaseAndGoBack(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: /Token Killer/ }).click()
  await expect(page).toHaveURL(/\/work\/token-killer$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Token Killer' }),
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
    .toBe('/#work-token-killer')
  await expect(page.locator('#work-token-killer')).toBeInViewport({
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
      text: expect.stringContaining('Token Killer'),
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
  await page.getByRole('link', { name: /Token Killer/ }).click()
  await expect(page).toHaveURL(/\/work\/token-killer$/)
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

test('trocar o idioma num case study preserva o projeto', async ({ page }) => {
  await page.goto('/work/token-killer')
  await page.getByRole('link', { name: en.shell.localeSwitch }).click()
  await expect(page).toHaveURL(/\/pt\/work\/token-killer$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Token Killer' }),
  ).toBeVisible()

  await page.getByRole('link', { name: pt.shell.localeSwitch }).click()
  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe('/work/token-killer')
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

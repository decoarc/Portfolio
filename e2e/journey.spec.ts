import { expect, test } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'

const en = contentByLocale.en.site
const pt = contentByLocale.pt.site

test('home → case study → de volta a #work, com foco na seção', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Token Killer/ }).click()
  await expect(page).toHaveURL(/\/work\/token-killer$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Token Killer' }),
  ).toBeVisible()

  await page.getByRole('link', { name: en.caseStudy.backToWork }).click()
  await expect
    .poll(() => {
      const url = new URL(page.url())
      return `${url.pathname}${url.hash}`
    })
    .toBe('/#work')
  await expect(page.locator('#work')).toBeInViewport()
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id))
    .toBe('work')
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

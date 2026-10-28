import { expect, test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'

const site = contentByLocale.en.site

/** Descreve o elemento focado: href, id e o estilo de contorno. */
async function focused(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    return {
      tag: el.tagName,
      id: el.id,
      href: el.getAttribute('href'),
      outlineStyle: getComputedStyle(el).outlineStyle,
    }
  })
}

test('skip link primeiro; Enter leva o foco a #main', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const first = await focused(page)
  expect(first?.href).toBe('#main')
  expect(first?.outlineStyle).not.toBe('none')

  await page.keyboard.press('Enter')
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id))
    .toBe('main')
})

test('Tab alcança CTA, Release e título publicado, em ordem, com contorno', async ({
  page,
}) => {
  await page.goto('/')
  const ctaHref = '#work'
  const releaseFirst = await page
    .getByRole('navigation', { name: site.release.label })
    .getByRole('link')
    .first()
    .getAttribute('href')

  const seen: string[] = []
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab')
    const el = await focused(page)
    if (el?.href) seen.push(el.href)
    if (el?.href === '/work/local-email-client') {
      expect(el.outlineStyle).not.toBe('none')
      break
    }
  }
  const cta = seen.indexOf(ctaHref)
  const release = seen.indexOf(releaseFirst ?? '', cta + 1)
  const title = seen.indexOf('/work/local-email-client')
  expect(cta, `CTA em ${seen.join(' ')}`).toBeGreaterThanOrEqual(0)
  expect(release, 'Release depois do CTA').toBeGreaterThan(cta)
  expect(title, 'título depois do Release').toBeGreaterThan(release)
})

test('cada alvo da ordem de Tab mostra contorno', async ({ page }) => {
  await page.goto('/')
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const el = await focused(page)
    expect(el?.outlineStyle, `foco ${i} (${el?.href})`).not.toBe('none')
  }
})

test('Enter no CTA primário leva #work ao viewport', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('region', { name: contentByLocale.en.site.person.name })
    .getByRole('link', { name: site.hero.ctaPrimary })
    .focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#work')).toBeInViewport()
})

// O alvo da âncora recebe foco programático (tabindex -1), como o `main` do
// skip link e o h1 do case: sem contorno, ou a seção inteira ganha um filete
// vermelho em cima e embaixo enquanto o foco fica nela.
test('Enter no CTA foca #work sem contorno', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('region', { name: site.person.name })
    .getByRole('link', { name: site.hero.ctaPrimary })
    .focus()
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await focused(page))?.id).toBe('work')
  expect((await focused(page))?.outlineStyle).toBe('none')
})

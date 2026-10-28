import { expect, test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'

/**
 * A home com Trajetória e Ferramentas no topo: links diretos para as seções
 * novas e para a antiga #work, e o botão "Personal projects" do hero.
 */

/**
 * A seção chegou: o título dela está no alto da janela, visível abaixo do
 * masthead. Mede o h2, não a caixa: o site já rola as seções com o topo um
 * pouco acima da janela (#work fica em −17 px desde a Fase 3).
 */
async function atTop(page: Page, selector: string) {
  const heading = page.locator(`${selector} h2`)
  await expect
    .poll(() =>
      heading.evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBeLessThanOrEqual(200)
  await expect(heading).toBeInViewport()
}

for (const [route, id] of [
  ['/#trajectory', 'trajectory'],
  ['/pt#tools', 'tools'],
  ['/#work', 'work'],
] as const) {
  test(`link direto ${route} para na seção`, async ({ page }) => {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    await atTop(page, `#${id}`)
  })
}

test('o botão "Personal projects" do hero leva a #work, não à trajetória', async ({
  page,
}) => {
  const { site } = contentByLocale.en
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page
    .getByRole('region', { name: site.person.name })
    .getByRole('link', { name: site.hero.ctaPrimary })
    .click()
  await expect.poll(() => new URL(page.url()).hash).toBe('#work')
  await atTop(page, '#work')
  await expect(page.locator('#trajectory')).not.toBeInViewport()
})

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { GATE_ROUTES } from './routes.ts'

for (const route of GATE_ROUTES) {
  test(`axe sem violações · ${route}`, async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready.then(() => true))
    // Na home, a entrada do nome esconde e desloca as palavras: o axe não
    // consegue medir o contraste no meio dela. Audita o estado final.
    await expect(
      page.locator('[data-entrance]:not([data-entrance="done"])'),
    ).toHaveCount(0)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const summary = (list: typeof results.violations) =>
      list.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
      )
    expect(summary(results.violations)).toEqual([])
    expect(
      summary(results.incomplete.filter((v) => v.id === 'color-contrast')),
    ).toEqual([])
  })
}

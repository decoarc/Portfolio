import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { GATE_ROUTES } from './routes.ts'

for (const route of GATE_ROUTES) {
  test(`axe sem violações · ${route}`, async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready.then(() => true))
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

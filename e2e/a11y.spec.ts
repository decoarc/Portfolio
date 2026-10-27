import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { GATE_ROUTES } from './routes.ts'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

type Results = Awaited<ReturnType<AxeBuilder['analyze']>>

const summary = (list: Results['violations']) =>
  list.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
  )

const contrastIncomplete = (results: Results) =>
  results.incomplete.filter((v) => v.id === 'color-contrast')

for (const route of GATE_ROUTES) {
  test(`axe sem violações · ${route}`, async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready.then(() => true))
    // Na home, a entrada do nome esconde e desloca as palavras: o axe não
    // consegue medir o contraste no meio dela. Audita o estado final.
    await expect(
      page.locator('[data-entrance]:not([data-entrance="done"])'),
    ).toHaveCount(0)
    // As palavras do texto que acende começam apagadas (0,2) de propósito:
    // exceção de contraste aceita pelo dono em 2026-10-27
    // (docs/superpowers/specs/2026-10-27-fase-3-texto-acende-design.md §3.3).
    // Saem desta auditoria e são auditadas acesas logo abaixo.
    const results = await new AxeBuilder({ page })
      .withTags(TAGS)
      .exclude('p[data-lit] [aria-hidden="true"]')
      .analyze()
    expect(summary(results.violations)).toEqual([])
    expect(summary(contrastIncomplete(results))).toEqual([])

    const litCount = await page.locator('p[data-lit]').count()
    if (litCount === 0) return
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    )
    await expect
      .poll(() =>
        page
          .locator('p[data-lit] [aria-hidden="true"] span')
          .evaluateAll((words) =>
            words.every((w) => getComputedStyle(w).opacity === '1'),
          ),
      )
      .toBe(true)
    const lit = await new AxeBuilder({ page })
      .withTags(TAGS)
      .include('p[data-lit]')
      .analyze()
    expect(summary(lit.violations)).toEqual([])
    expect(summary(contrastIncomplete(lit))).toEqual([])
  })
}

import { expect, test } from '@playwright/test'
import { flight } from './title-flight.helpers.ts'

/**
 * Achados da auditoria WCAG 2.2 AA da Fase 4 (docs/gate-4/A11Y_AUDIT.md).
 * Cada teste repete a medida da auditoria que falhou antes da correção.
 */

test.describe('reduced motion ligado no meio da sessão', () => {
  test('voltar do case não anima a View Transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready.then(() => true))
    await expect(
      page.locator('[data-entrance]:not([data-entrance="done"])'),
    ).toHaveCount(0)
    await page.locator('#work-token-killer a[data-anchor-focus]').click()
    await expect(page).toHaveURL(/\/work\/token-killer$/)
    await expect.poll(async () => (await flight(page)).length).toBe(0)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    // Conta, quadro a quadro, as animações de View Transition durante a volta.
    const seen = page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let max = 0
          const start = performance.now()
          const tick = () => {
            const count = document
              .getAnimations()
              .filter((animation) =>
                (
                  animation.effect as KeyframeEffect | null
                )?.pseudoElement?.includes('view-transition'),
              ).length
            max = Math.max(max, count)
            if (performance.now() - start < 1000) requestAnimationFrame(tick)
            else resolve(max)
          }
          requestAnimationFrame(tick)
        }),
    )
    await page.goBack()
    expect(await seen).toBe(0)
    await expect(page).toHaveURL(/\/$/)
  })
})

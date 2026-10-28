import { expect, test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'
import { VIEWPORTS } from './routes.ts'

const site = contentByLocale.en.site

/** Espera o scroll parar de mudar (o Lenis interpola por alguns frames). */
async function settle(page: Page): Promise<number> {
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

/** Deslocamento horizontal (px) de cada palavra do nome, na ordem -1, 1. */
async function drifts(page: Page): Promise<[number, number]> {
  return page.evaluate(() => {
    const x = (selector: string) => {
      const el = document.querySelector(selector)
      if (!el) throw new Error(`sem ${selector}`)
      return new DOMMatrixReadOnly(getComputedStyle(el).transform).m41
    }
    return [x('[data-drift="-1"]'), x('[data-drift="1"]')]
  })
}

/** O deslocamento que a posição atual pede, pelas fórmulas aprovadas. */
async function expectedDrift(page: Page): Promise<number> {
  return page.evaluate(() => {
    const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
    const distance = window.innerWidth <= 767 ? 0.4 : 0.25
    return (1 - (1 - p) ** 3) * distance * window.innerWidth
  })
}

test.describe('abertura da home', () => {
  test.use({ reducedMotion: 'no-preference' })

  for (const viewport of VIEWPORTS) {
    test(`uma tela rolada: nome afastado e folha no topo · ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto('/')
      await expect(page.locator('[data-entrance]')).toHaveAttribute(
        'data-entrance',
        'done',
      )
      await page.mouse.move(viewport.width / 2, viewport.height / 2)
      await page.mouse.wheel(0, viewport.height)
      await settle(page)

      const [left, right] = await drifts(page)
      const distance = viewport.width < 768 ? 0.4 : 0.25
      const expected = await page.evaluate(
        (distance) => distance * window.innerWidth,
        distance,
      )
      expect(left).toBeLessThan(0)
      expect(right).toBeGreaterThan(0)
      expect(Math.abs(Math.abs(left) - expected)).toBeLessThanOrEqual(2)
      expect(Math.abs(right - expected)).toBeLessThanOrEqual(2)

      const sheetTop = await page
        .getByRole('navigation', { name: site.release.label })
        .evaluate(
          (nav) => nav.closest('section')?.getBoundingClientRect().top ?? 99,
        )
      expect(sheetTop).toBeLessThanOrEqual(1)
    })
  }

  test('aberta já rolada: sem entrada; no topo, o nome está no lugar', async ({
    page,
  }) => {
    await page.goto('/#work')
    await settle(page)
    expect(await page.locator('[data-entrance]').count()).toBe(0)
    await page.evaluate(() => window.scrollTo(0, 0))
    await settle(page)
    const transforms = await page
      .locator('h1 [data-drift] > span')
      .evaluateAll((words) => words.map((w) => getComputedStyle(w).transform))
    expect(transforms).toEqual(['none', 'none'])
  })

  test('atravessar 768 px troca a distância do afastamento', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.locator('[data-entrance]')).toHaveAttribute(
      'data-entrance',
      'done',
    )
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, 450)
    await settle(page)
    const [, before] = await drifts(page)
    expect(Math.abs(before - (await expectedDrift(page)))).toBeLessThanOrEqual(
      2,
    )

    await page.setViewportSize({ width: 390, height: 844 })
    await settle(page)
    const [, after] = await drifts(page)
    expect(Math.abs(after - (await expectedDrift(page)))).toBeLessThanOrEqual(2)
  })

  test('Shift+Tab do índice para o CTA do hero traz o CTA à vista', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: site.release.label })
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, 900)
    await settle(page)
    await nav.getByRole('link').first().focus()
    await page.keyboard.press('Shift+Tab')

    const cta = page
      .getByRole('region', { name: site.person.name })
      .getByRole('link', { name: site.hero.ctaSecondary })
    await expect(cta).toBeFocused()
    await expect
      .poll(() =>
        cta.evaluate((el) => {
          const box = el.getBoundingClientRect()
          const hit = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + box.height / 2,
          )
          return hit !== null && el.contains(hit)
        }),
      )
      .toBe(true)
  })

  test('clicar no CTA com a página um pouco rolada navega', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.locator('[data-entrance]')).toHaveAttribute(
      'data-entrance',
      'done',
    )
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, 150)
    await settle(page)
    await page
      .getByRole('region', { name: site.person.name })
      .getByRole('link', { name: site.hero.ctaPrimary })
      .click()
    await expect.poll(() => new URL(page.url()).hash).toBe('#work')
  })

  test('voltar do navegador para a home rolada não repete a entrada', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.locator('[data-entrance]')).toHaveAttribute(
      'data-entrance',
      'done',
    )
    await page.mouse.move(700, 400)
    await page.mouse.wheel(0, 300)
    await settle(page)
    await page.getByRole('link', { name: /Local Email Client/ }).click()
    await expect(page).toHaveURL(/\/work\/local-email-client$/)
    await page.goBack()
    await expect.poll(() => settle(page)).toBeGreaterThan(0)
    expect(await page.locator('[data-entrance]').count()).toBe(0)
  })
})

/** Tela baixa: celular deitado, ou zoom de 200 % num notebook de 1280 × 720. */
for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`tela baixa · ${reducedMotion}`, () => {
    test.use({ reducedMotion, viewport: { width: 640, height: 360 } })

    test('o mouse alcança os CTAs rolando', async ({ page }) => {
      await page.goto('/')
      const cta = page
        .getByRole('region', { name: site.person.name })
        .getByRole('link', { name: site.hero.ctaSecondary })
      let seen = false
      for (let y = 0; y <= 1200 && !seen; y += 40) {
        await page.evaluate((y) => window.scrollTo(0, y), y)
        await settle(page)
        seen = await cta.evaluate((el) => {
          const box = el.getBoundingClientRect()
          const hit = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + box.height / 2,
          )
          return hit !== null && el.contains(hit)
        })
      }
      expect(seen).toBe(true)
    })

    test('Tab até o CTA o traz à vista', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready.then(() => true))
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab')
        const label = await page.evaluate(
          () => document.activeElement?.textContent,
        )
        if (label === site.hero.ctaSecondary) break
      }
      const cta = page
        .getByRole('region', { name: site.person.name })
        .getByRole('link', { name: site.hero.ctaSecondary })
      await expect(cta).toBeFocused()
      await expect
        .poll(() =>
          cta.evaluate((el) => {
            const box = el.getBoundingClientRect()
            const hit = document.elementFromPoint(
              box.left + box.width / 2,
              box.top + box.height / 2,
            )
            return hit !== null && el.contains(hit)
          }),
        )
        .toBe(true)
    })
  })
}

test.describe('abertura com reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('o nome está no lugar desde o primeiro frame', async ({ page }) => {
    await page.goto('/')
    const transforms = await page
      .locator('h1 [data-drift] > span')
      .evaluateAll((words) => words.map((w) => getComputedStyle(w).transform))
    expect(transforms).toEqual(['none', 'none'])
    expect(await page.locator('[data-entrance]').count()).toBe(0)
  })

  test('Shift+Tab do índice para o CTA do hero o deixa à vista', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, 900))
    await settle(page)
    await page
      .getByRole('navigation', { name: site.release.label })
      .getByRole('link')
      .first()
      .focus()
    await page.keyboard.press('Shift+Tab')
    const cta = page
      .getByRole('region', { name: site.person.name })
      .getByRole('link', { name: site.hero.ctaSecondary })
    await expect(cta).toBeFocused()
    await expect
      .poll(() =>
        cta.evaluate((el) => {
          const box = el.getBoundingClientRect()
          const hit = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + box.height / 2,
          )
          return hit !== null && el.contains(hit)
        }),
      )
      .toBe(true)
  })
})

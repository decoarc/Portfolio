import { expect, test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'
import { VIEWPORTS } from './routes.ts'

const en = contentByLocale.en.site
const pt = contentByLocale.pt.site
const mobile = VIEWPORTS.find((v) => v.name === 'mobile')!

/** Os dois parágrafos que acendem, pela frase da cópia para leitor de tela. */
const PARAGRAPHS = [
  { name: 'lead do Sobre', text: en.about.lead },
  { name: 'intro da Abordagem', text: en.approach.intro },
] as const

function lit(page: Page, text: string) {
  return page.locator('p[data-lit]', {
    has: page.locator('.visually-hidden', { hasText: text }),
  })
}

/** Opacidade calculada de cada palavra visível do parágrafo. */
function wordOpacities(page: Page, text: string): Promise<number[]> {
  return lit(page, text)
    .locator('[aria-hidden="true"] span')
    .evaluateAll((words) =>
      words.map((w) => Number(getComputedStyle(w).opacity)),
    )
}

/** Espera o scroll parar de mudar (o Lenis interpola por alguns frames). */
async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = -1
        let still = 0
        const tick = () => {
          if (window.scrollY === last) still += 1
          else still = 0
          last = window.scrollY
          if (still >= 10) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )
}

/** Rola até o fim do parágrafo ficar na fração `at` da altura da janela. */
async function scrollBottomTo(page: Page, text: string, at: number) {
  await lit(page, text).evaluate((p, at) => {
    const y = window.scrollY + p.getBoundingClientRect().bottom
    window.scrollTo(0, y - at * window.innerHeight)
  }, at)
  await settle(page)
}

async function open(page: Page, path = '/') {
  await page.goto(path)
  await page.evaluate(() => document.fonts.ready.then(() => true))
  await expect(
    page.locator('[data-entrance="run"], [data-entrance="pending"]'),
  ).toHaveCount(0)
  await settle(page)
}

const all = (values: number[], expected: number) =>
  values.length > 0 && values.every((v) => Math.abs(v - expected) < 0.01)

test.describe('sem preferência de movimento', () => {
  test.use({ reducedMotion: 'no-preference' })

  for (const { name, text } of PARAGRAPHS) {
    test(`apagado embaixo, aceso depois, apagado de novo · ${name}`, async ({
      page,
    }) => {
      await open(page)
      expect(all(await wordOpacities(page, text), 0.2)).toBe(true)
      await scrollBottomTo(page, text, 0.4)
      expect(all(await wordOpacities(page, text), 1)).toBe(true)
      await page.evaluate(() => window.scrollTo(0, 0))
      await settle(page)
      expect(all(await wordOpacities(page, text), 0.2)).toBe(true)
    })
  }

  test('no meio, acende em ordem', async ({ page }) => {
    await open(page)
    // Entre as linhas: topo abaixo de 50% e fim acima de 80%, no lead curto.
    await lit(page, en.about.lead).evaluate((p) => {
      const box = p.getBoundingClientRect()
      const middle = (box.top + box.bottom) / 2
      window.scrollTo(0, window.scrollY + middle - 0.65 * window.innerHeight)
    })
    await settle(page)
    const values = await wordOpacities(page, en.about.lead)
    expect(
      values.some((v) => v > 0.21 && v < 0.99),
      values.join(),
    ).toBe(true)
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeLessThanOrEqual(values[i - 1] + 1e-6)
    }
  })

  test('fim da página numa tela alta: tudo aceso', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 2400 })
    await open(page)
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    )
    await settle(page)
    for (const { text } of PARAGRAPHS) {
      expect(all(await wordOpacities(page, text), 1)).toBe(true)
    }
  })

  test('abrir em /#about: o lead já aparece aceso', async ({ page }) => {
    await page.goto('/#about')
    await page.evaluate(() => document.fonts.ready.then(() => true))
    await settle(page)
    await expect
      .poll(async () => all(await wordOpacities(page, en.about.lead), 1))
      .toBe(true)
  })

  test('trocar de idioma refaz as palavras', async ({ page }) => {
    await open(page)
    await scrollBottomTo(page, en.about.lead, 0.65)
    await page.getByRole('link', { name: en.shell.localeSwitch }).click()
    await expect(page).toHaveURL(/\/pt/)
    await expect(lit(page, pt.about.lead)).toHaveCount(1)
    const words = lit(page, pt.about.lead).locator('[aria-hidden="true"] span')
    const expected = pt.about.lead.trim().split(/\s+/)
    await expect(words).toHaveText(expected)
    expect(
      await words.evaluateAll((spans) =>
        spans.map((s) => (s as HTMLElement).style.getPropertyValue('--i')),
      ),
    ).toEqual(expected.map((_, i) => String(i)))
    await scrollBottomTo(page, pt.about.lead, 0.4)
    expect(all(await wordOpacities(page, pt.about.lead), 1)).toBe(true)
  })

  test('celular: apagado embaixo e aceso depois', async ({ page }) => {
    await page.setViewportSize({ width: mobile.width, height: mobile.height })
    await open(page)
    expect(all(await wordOpacities(page, en.about.lead), 0.2)).toBe(true)
    await scrollBottomTo(page, en.about.lead, 0.4)
    expect(all(await wordOpacities(page, en.about.lead), 1)).toBe(true)
  })

  for (const { name, text } of PARAGRAPHS) {
    test(`leitor de tela e cópia trazem a frase uma vez · ${name}`, async ({
      page,
    }) => {
      await open(page)
      const snapshot = await lit(page, text).ariaSnapshot()
      expect(snapshot.split(text).length - 1, snapshot).toBe(1)
      const selected = await lit(page, text).evaluate((p) => {
        const range = document.createRange()
        range.selectNodeContents(p)
        const selection = window.getSelection()!
        selection.removeAllRanges()
        selection.addRange(range)
        return selection.toString().replace(/\s+/g, ' ').trim()
      })
      expect(selected).toBe(text)
    })
  }
})

test.describe('prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' })

  test('sem efeito: texto simples e aceso', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready.then(() => true))
    await expect(page.locator('[data-lit]')).toHaveCount(0)
    for (const text of [en.about.lead, en.approach.intro]) {
      const p = page.locator('p', { hasText: text }).first()
      expect(await p.evaluate((el) => el.children.length)).toBe(0)
      expect(await p.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    }
  })
})

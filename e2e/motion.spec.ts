import { expect, test, type Page } from '@playwright/test'

const PAGES = ['/', '/work/token-killer'] as const

async function visit(page: Page, path: string) {
  await page.goto(path)
  await page.evaluate(() => document.fonts.ready.then(() => true))
}

/** Passa por hover e foco: o título (ficha ou case study), um link e um Tab. */
async function interact(page: Page) {
  const title = page.locator('main h3 a, main h1').first()
  await title.hover()
  await page.getByRole('link').nth(1).focus()
  await page.keyboard.press('Tab')
}

async function exercise(page: Page, path: string) {
  await visit(page, path)
  await interact(page)
}

/** Primeiro elemento com duração de transição ou animação; `allowMarked` ignora os que levam `data-motion`. */
async function firstTimed(page: Page, allowMarked: boolean) {
  return page.evaluate((allowMarked) => {
    const durations = (value: string) =>
      value.split(',').some((part) => parseFloat(part) > 0)
    for (const el of document.querySelectorAll('*')) {
      if (allowMarked && el.hasAttribute('data-motion')) continue
      const style = getComputedStyle(el)
      if (
        durations(style.transitionDuration) ||
        durations(style.animationDuration)
      ) {
        return el.tagName.toLowerCase() + '.' + String(el.className)
      }
    }
    return null
  }, allowMarked)
}

test.describe('prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const path of PAGES) {
    test(`nenhuma animação ativa · ${path}`, async ({ page }) => {
      await exercise(page, path)
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
      /**
       * `getAnimations()` só vê transições em curso; uma `transition`
       * declarada e ainda não disparada passaria. A duração calculada pega
       * a declaração em si.
       */
      expect(await firstTimed(page, false)).toBeNull()
      expect(await page.locator('[data-entrance]').count()).toBe(0)
      await expect(page.locator('html')).not.toHaveClass(/\blenis\b/)
    })
  }
})

test.describe('prefers-reduced-motion: no-preference', () => {
  test.use({ reducedMotion: 'no-preference' })

  /**
   * Na home, as transições de saída (o esmaecimento desfazendo, o magnético
   * voltando) precisam estar declaradas também em repouso: a guarda passa de
   * "não existe motion" para "todo motion é declarado e marcado".
   */
  test('só elementos com data-motion têm duração · /', async ({ page }) => {
    await visit(page, '/')
    expect(await firstTimed(page, true)).toBeNull()
    await expect(page.locator('[data-entrance]')).toHaveAttribute(
      'data-entrance',
      'done',
    )
    // Em repouso, sem hover nem foco, nada anda.
    await page.mouse.move(0, 0)
    await expect
      .poll(() => page.evaluate(() => document.getAnimations().length))
      .toBe(0)
    await interact(page)
    expect(await firstTimed(page, true)).toBeNull()
    expect(
      await page.evaluate(() =>
        document
          .getAnimations()
          .every((a) =>
            (a.effect as KeyframeEffect | null)?.target?.closest(
              '[data-motion]',
            ),
          ),
      ),
    ).toBe(true)
  })

  test('só a abertura tem motion · /work/token-killer', async ({ page }) => {
    await exercise(page, '/work/token-killer')
    expect(await firstTimed(page, true)).toBeNull()
    expect(await firstTimed(page, false)).toBeNull()
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  })

  test('durante a entrada, só o nome tem transição', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-entrance]')).toHaveAttribute(
      'data-entrance',
      'run',
    )
    expect(await firstTimed(page, true)).toBeNull()
    expect(
      await page
        .locator('[data-motion="entrance"]')
        .evaluateAll((words) =>
          words.map((w) => getComputedStyle(w).transitionDuration),
        ),
    ).toEqual(['1.1s', '1.1s'])
  })
})

test('a Fraunces completa foi carregada', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready.then(() => true))
  const names = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name),
  )
  expect(
    names.some((name) => name.includes('fraunces-latin-full-normal')),
    names.join('\n'),
  ).toBe(true)
})

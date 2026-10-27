import { expect, test, type Page } from '@playwright/test'
import { GATE_ROUTES } from './routes.ts'
import { flight } from './title-flight.helpers.ts'

/**
 * Achados da auditoria WCAG 2.2 AA da Fase 4 (docs/gate-4/A11Y_AUDIT.md).
 * Cada teste repete a medida da auditoria que falhou antes da correção.
 */

/** Texto a 200%: a fonte raiz dobra (o zoom só de texto do navegador). */
const TEXT_200 = 'html { font-size: 32px !important }'

/** Espaçamento de texto do 1.4.12 (o bookmarklet da WCAG). */
const TEXT_SPACING =
  '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important } p { margin-bottom: 2em !important }'

async function open(page: Page, route: string, width: number, style?: string) {
  await page.setViewportSize({ width, height: 844 })
  await page.goto(route)
  await page.evaluate(() => document.fonts.ready.then(() => true))
  await expect(
    page.locator('[data-entrance]:not([data-entrance="done"])'),
  ).toHaveCount(0)
  if (style) await page.addStyleTag({ content: style })
}

function scrollWidth(page: Page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
}

/**
 * Trechos de texto visíveis que passam da borda direita (ou esquerda) de
 * `limit`, ou da janela. Mede o texto (`Range`), não a caixa: uma palavra
 * longa passa da caixa do parágrafo sem alargá-la. Ignora o que está fora da
 * árvore de acessibilidade e o que está escondido.
 */
function textPastEdge(page: Page, limitSelector?: string) {
  return page.evaluate((limitSelector) => {
    const scope = limitSelector
      ? document.querySelector(limitSelector)
      : document.body
    const limit = limitSelector ? scope?.getBoundingClientRect() : null
    const left = limit?.left ?? 0
    const right = limit?.right ?? document.documentElement.clientWidth
    const out: string[] = []
    if (!scope) return ['sem escopo']
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      const el = node.parentElement
      if (!el || !node.textContent?.trim()) continue
      if (el.closest('[aria-hidden="true"], .visually-hidden')) continue
      if (getComputedStyle(el).visibility === 'hidden') continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) {
        if (rect.width === 0) continue
        if (rect.right > right + 0.5 || rect.left < left - 0.5) {
          out.push(
            `${el.tagName.toLowerCase()} "${node.textContent.trim().slice(0, 30)}" ${Math.round(rect.left)}–${Math.round(rect.right)}`,
          )
          break
        }
      }
    }
    return out
  }, limitSelector)
}

test.describe('1.4.10 · 320 px sem rolagem horizontal', () => {
  for (const route of ['/', '/pt', '/pt/work/map-areas']) {
    test(`texto normal · ${route}`, async ({ page }) => {
      await open(page, route, 320)
      const { scrollWidth: sw, clientWidth } = await scrollWidth(page)
      expect(sw).toBeLessThanOrEqual(clientWidth)
    })
  }
})

test.describe('1.4.10 / 1.4.12 · a stack do case quebra', () => {
  for (const [width, style] of [
    [320, undefined],
    [320, TEXT_SPACING],
    [390, TEXT_SPACING],
    [320, TEXT_200],
  ] as const) {
    test(`${width} px ${style === TEXT_200 ? '· texto a 200%' : style ? '· espaçamento' : ''}`, async ({
      page,
    }) => {
      await open(page, '/pt/work/map-areas', width, style)
      expect(await textPastEdge(page, 'main dl')).toEqual([])
      expect(await textPastEdge(page)).toEqual([])
      const { scrollWidth: sw, clientWidth } = await scrollWidth(page)
      expect(sw).toBeLessThanOrEqual(clientWidth)
    })
  }
})

test.describe('1.4.10 · o cartão do contato cabe em 320 px', () => {
  for (const style of [undefined, TEXT_200]) {
    test(`LinkedIn com foco ${style ? '· texto a 200%' : ''}`, async ({
      page,
    }) => {
      await open(page, '/', 320, style)
      const linkedin = page.locator('#contact a[href*="linkedin"]')
      await linkedin.focus()
      const card = page.locator('#contact a[href*="linkedin"] + span')
      await expect(card).toBeVisible()
      const box = await card.boundingBox()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(320)
      expect(await textPastEdge(page, '#contact')).toEqual([])
    })
  }
})

test.describe('1.4.4 · texto a 200% em 320 px', () => {
  for (const route of ['/', '/pt']) {
    test(`o nome do hero inteiro · ${route}`, async ({ page }) => {
      await open(page, route, 320, TEXT_200)
      // O hero corta na borda (`overflow-x: clip`): o que passa dela some.
      const words = await page
        .locator('h1 [data-motion="entrance"]')
        .evaluateAll((spans) =>
          spans.map((span) => {
            const rect = span.getBoundingClientRect()
            return { text: span.textContent, right: Math.round(rect.right) }
          }),
        )
      expect(words).toHaveLength(2)
      expect(words.filter((word) => word.right > 320)).toEqual([])
    })
  }
})

test.describe('1.4.4 · texto a 200% em 320 px · PT', () => {
  test('CTA e títulos de seção cabem', async ({ page }) => {
    await open(page, '/pt', 320, TEXT_200)
    expect(await textPastEdge(page, 'main')).toEqual([])
  })
})

test.describe('1.4.4 · texto a 200% em 320 px · masthead', () => {
  for (const route of ['/work/token-killer', '/nao-existe']) {
    test(`cabe · ${route}`, async ({ page }) => {
      await open(page, route, 320, TEXT_200)
      expect(await textPastEdge(page, 'header')).toEqual([])
      const { scrollWidth: sw, clientWidth } = await scrollWidth(page)
      expect(sw).toBeLessThanOrEqual(clientWidth)
    })
  }
})

test.describe('1.4.4 / 1.4.10 / 1.4.12 · varredura', () => {
  for (const route of GATE_ROUTES) {
    test(`texto a 200% em 320 px · ${route}`, async ({ page }) => {
      await open(page, route, 320, TEXT_200)
      expect(await textPastEdge(page)).toEqual([])
      const { scrollWidth: sw, clientWidth } = await scrollWidth(page)
      expect(sw).toBeLessThanOrEqual(clientWidth)
    })

    for (const width of [320, 390, 768, 1440]) {
      test(`espaçamento de texto em ${width} px · ${route}`, async ({
        page,
      }) => {
        await open(page, route, width, TEXT_SPACING)
        expect(await textPastEdge(page)).toEqual([])
        const { scrollWidth: sw, clientWidth } = await scrollWidth(page)
        expect(sw).toBeLessThanOrEqual(clientWidth)
      })
    }
  }
})

test.describe('alto contraste do Windows (forced-colors: active)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  /**
   * Linha de `side` (`outline` ou `border-top`) de um elemento ou
   * pseudo-elemento: visível e de cor diferente do fundo da página.
   */
  function line(page: Page, selector: string, side: string, pseudo?: string) {
    return page.evaluate(
      ({ selector, side, pseudo }) => {
        const el = document.querySelector(selector)
        if (!el) return `sem ${selector}`
        const style = getComputedStyle(el, pseudo)
        const page = getComputedStyle(document.body).backgroundColor
        const lineStyle = style.getPropertyValue(`${side}-style`)
        const width = parseFloat(style.getPropertyValue(`${side}-width`))
        const color = style.getPropertyValue(`${side}-color`)
        if (lineStyle === 'none' || width < 1)
          return `${side} ${lineStyle} ${width}px`
        if (color === page || color === 'rgba(0, 0, 0, 0)')
          return `${side} da cor do fundo (${color})`
        return 'ok'
      },
      { selector, side, pseudo },
    )
  }

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready.then(() => true))
    await expect(
      page.locator('[data-entrance]:not([data-entrance="done"])'),
    ).toHaveCount(0)
  })

  test('o foco de teclado aparece', async ({ page }) => {
    await page.locator('#work-token-killer a[data-anchor-focus]').focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    expect(await line(page, ':focus-visible', 'outline')).toBe('ok')
  })

  test('os filetes da lista de trabalhos aparecem', async ({ page }) => {
    expect(await line(page, '#work-token-killer', 'border-top')).toBe('ok')
  })

  test('o placeholder "sem captura" tem moldura', async ({ page }) => {
    // A moldura é a borda da miniatura, pai do placeholder.
    expect(
      await line(
        page,
        '#work-token-killer [aria-hidden="true"]:has(> [data-motion="thumb"])',
        'border-top',
      ),
    ).toBe('ok')
  })

  test('a borda da folha aparece enquanto ela sobe sobre o hero', async ({
    page,
  }) => {
    await page.mouse.wheel(0, 450)
    await expect
      .poll(() =>
        page.evaluate(() =>
          parseFloat(
            getComputedStyle(
              document.querySelector('main section:has(> nav)')!,
              '::before',
            ).height,
          ),
        ),
      )
      .toBeGreaterThan(40)
    expect(
      await line(page, 'main section:has(> nav)', 'border-top', '::before'),
    ).toBe('ok')
  })
})

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

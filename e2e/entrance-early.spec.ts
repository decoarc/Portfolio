import { expect, test, type Page } from '@playwright/test'
import { ENTRANCE_EARLY_SCRIPT } from '../src/app/entranceEarly.ts'
import { prerenderRoutes } from '../src/app/prerenderRoutes.ts'
import { contentByLocale } from '../src/content/index.ts'

/**
 * A entrada do nome sobre o HTML pré-renderizado (design §5.3). O nome é
 * escondido por `transform` dentro da fenda (`overflow-y: clip`), não por
 * opacidade: a medida de "visível" é a fração da altura da primeira palavra
 * que cabe na sua linha (1 = no lugar, 0 = abaixo da fenda).
 *
 * O gravador entra por `addInitScript`, antes de qualquer script da página:
 * guarda essa fração a cada frame e cada valor que `data-entrance-early`
 * assume no `<html>` (inclusive os que o `Opening` tira logo depois).
 */
declare global {
  interface Window {
    __frames: { t: number; v: number }[]
    __marks: { t: number; v: string | null }[]
  }
}

function record() {
  window.__frames = []
  window.__marks = []
  const visible = () => {
    const word = document.querySelector('h1 [data-motion="entrance"]')
    const line = word?.parentElement?.parentElement
    if (!word || !line) return null
    const w = word.getBoundingClientRect()
    const l = line.getBoundingClientRect()
    if (w.height === 0) return null
    const inside = Math.min(w.bottom, l.bottom) - Math.max(w.top, l.top)
    return Math.max(0, Math.min(1, Math.round((inside / w.height) * 100) / 100))
  }
  const tick = () => {
    const v = visible()
    if (v !== null) window.__frames.push({ t: performance.now(), v })
    if (performance.now() < 10_000) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  new MutationObserver((records) => {
    for (const r of records) {
      const el = r.target as Element
      window.__marks.push({
        t: performance.now(),
        v: el.getAttribute('data-entrance-early'),
      })
    }
  }).observe(document, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-entrance-early'],
  })
}

const frames = (page: Page) => page.evaluate(() => window.__frames)
const marks = (page: Page) =>
  page.evaluate(() => window.__marks.map((m) => m.v))

/** Fração visível agora (mesma medida do gravador). */
const visibleNow = (page: Page) =>
  page.evaluate(() => {
    const word = document.querySelector('h1 [data-motion="entrance"]')!
    const line = word.parentElement!.parentElement!
    const w = word.getBoundingClientRect()
    const l = line.getBoundingClientRect()
    const inside = Math.min(w.bottom, l.bottom) - Math.max(w.top, l.top)
    return Math.round((inside / w.height) * 100) / 100
  })

/** Uma queda: um frame com o nome visível seguido de um escondido. */
function blinks(values: number[]): boolean {
  let seen = false
  for (const v of values) {
    if (v > 0.5) seen = true
    else if (seen && v < 0.5) return true
  }
  return false
}

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

test('o script vai exato e só no head das duas homes; a marca nunca no HTML', async ({
  request,
}) => {
  const tag = `<script>${ENTRANCE_EARLY_SCRIPT}</script>`
  for (const route of prerenderRoutes(contentByLocale)) {
    if (route.key.page === 'notFound') continue
    const html = await (await request.get(route.url)).text()
    const head = html.slice(0, html.indexOf('</head>'))
    const count = head.split(tag).length - 1
    expect(count, route.url).toBe(route.key.page === 'home' ? 1 : 0)
    expect(html, route.url).not.toContain('data-entrance-early=')
  }
  const notFound = await (await request.get('/nao-existe')).text()
  expect(notFound).not.toContain(ENTRANCE_EARLY_SCRIPT)
})

test.describe('entrada do nome sobre o HTML pré-renderizado', () => {
  test.use({ reducedMotion: 'no-preference' })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(record)
  })

  for (const path of ['/', '/pt']) {
    test(`nunca pisca: escondido desde o primeiro frame, termina no lugar · ${path}`, async ({
      page,
    }) => {
      await page.goto(path)
      await expect(page.locator('[data-entrance]')).toHaveAttribute(
        'data-entrance',
        'done',
      )
      const values = (await frames(page)).map((f) => f.v)
      expect(values.length).toBeGreaterThan(0)
      expect(values[0], 'primeiro frame com o nome').toBeLessThan(0.5)
      expect(blinks(values), values.join(' ')).toBe(false)
      expect(values.at(-1)).toBe(1)
      expect(await marks(page)).toEqual(['pending', null])
    })
  }

  test('JS lento (> 3 s): o nome aparece parado e não some quando o JS chega', async ({
    page,
  }) => {
    // Segura o bundle até o teste conferir o estado sem JS (≥ 3 s).
    let release!: () => void
    const held = new Promise<void>((resolve) => (release = resolve))
    await page.route('**/assets/index-*.js', async (route) => {
      await held
      await route.continue()
    })
    await page.goto('/', { waitUntil: 'commit' })

    await expect
      .poll(() => marks(page), { timeout: 6000 })
      .toEqual(['pending', 'expired'])
    const expiredAt = await page.evaluate(() => window.__marks[1].t)
    expect(expiredAt).toBeGreaterThanOrEqual(2900)
    await expect.poll(() => visibleNow(page)).toBe(1)
    // Ainda sem JS: o Opening não montou.
    expect(await page.locator('[data-opening]').count()).toBe(0)

    release()
    await expect(page.locator('[data-opening]')).toHaveCount(1)
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.dataset.entranceEarly ?? null,
        ),
      )
      .toBeNull()
    await page.waitForTimeout(1000)

    expect(await page.locator('[data-entrance]').count()).toBe(0)
    const after = (await frames(page))
      .filter((f) => f.t > expiredAt + 100)
      .map((f) => f.v)
    expect(after.length).toBeGreaterThan(30)
    expect(
      after.every((v) => v === 1),
      after.join(' '),
    ).toBe(true)
  })

  test('deep link com hash (/pt#contact): sem marca, nome visível, para em #contact', async ({
    page,
  }) => {
    await page.goto('/pt#contact')
    expect(await marks(page)).toEqual([])
    expect(await page.locator('[data-entrance]').count()).toBe(0)
    await expect(page.locator('#contact')).toBeInViewport()
    expect(await settle(page)).toBeGreaterThan(0)
    await expect(page.locator('#contact')).toBeInViewport()
    expect(blinks((await frames(page)).map((f) => f.v))).toBe(false)
    await page.evaluate(() => window.scrollTo(0, 0))
    await settle(page)
    expect(await visibleNow(page)).toBe(1)
  })

  test('recarga no meio da página: rolagem restaurada, nome no lugar, sem entrada', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.locator('[data-entrance]')).toHaveAttribute(
      'data-entrance',
      'done',
    )
    const half = await page.evaluate(
      () => document.documentElement.scrollHeight / 2,
    )
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, half)
    expect(await settle(page)).toBeGreaterThan(0)

    await page.reload()
    await expect.poll(() => settle(page)).toBeGreaterThan(0)
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document
              .querySelector('[data-entrance]')
              ?.getAttribute('data-entrance') ?? 'none',
        ),
      )
      .toMatch(/^(none|done)$/)
    expect(
      await page.evaluate(
        () => document.documentElement.dataset.entranceEarly ?? null,
      ),
    ).toBeNull()
    expect(await visibleNow(page)).toBe(1)
  })
})

test.describe('entrada com reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('sem marca, sem entrada, nome no lugar em todos os frames', async ({
    page,
  }) => {
    await page.addInitScript(record)
    await page.goto('/')
    await page.waitForTimeout(500)
    expect(await marks(page)).toEqual([])
    expect(await page.locator('[data-entrance]').count()).toBe(0)
    const values = (await frames(page)).map((f) => f.v)
    expect(values.length).toBeGreaterThan(0)
    expect(
      values.every((v) => v === 1),
      values.join(' '),
    ).toBe(true)
  })
})

import { expect, test, type Locator, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'
import { VIEWPORTS } from './routes.ts'

const desktop = VIEWPORTS.find((v) => v.name === 'desktop')!

test.use({ viewport: { width: desktop.width, height: desktop.height } })

/** Ficha da lista de trabalhos, na ordem da home (1 = Local Email Client, publicada). */
function slip(page: Page, index: number) {
  return page.locator('#work ol > li').nth(index)
}

/** Opacidade calculada de cada ficha, na ordem da lista. */
function opacities(page: Page) {
  return page
    .locator('#work ol > li')
    .evaluateAll((items) => items.map((li) => getComputedStyle(li).opacity))
}

function titleTransform(page: Page, index: number) {
  return slip(page, index)
    .locator('h3')
    .evaluate((h3) => getComputedStyle(h3).transform)
}

async function open(page: Page) {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready.then(() => true))
}

test.describe('reação da lista · sem reduce', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('hover numa ficha esmaece as outras e recua o título', async ({
    page,
  }) => {
    await open(page)
    await slip(page, 1).hover()
    await expect.poll(() => opacities(page)).toEqual(['0.35', '1'])
    expect(await titleTransform(page, 1)).not.toBe('none')
  })

  test('clique do mouse num link externo da ficha não deixa a lista esmaecida', async ({
    page,
    context,
  }) => {
    // O link abre nova aba: fecha a popup e segue na página da lista.
    context.on('page', (popup) => void popup.close())
    await open(page)
    // A ficha 0 (Map Areas, verificada) é a que tem links externos.
    const external = slip(page, 0).locator('a[target="_blank"]').first()
    await external.click()
    await page.mouse.move(0, 0)
    await expect.poll(() => opacities(page)).toEqual(['1', '1'])
    expect(await titleTransform(page, 1)).toBe('none')
  })

  test('foco por teclado numa ficha faz o mesmo', async ({ page }) => {
    await open(page)
    await slip(page, 1).locator('h3 a').focus()
    await expect.poll(() => opacities(page)).toEqual(['0.35', '1'])
    expect(await titleTransform(page, 1)).not.toBe('none')
  })
})

test.describe('reação da lista · reduce', () => {
  test.use({ reducedMotion: 'reduce' })

  test('com reduced motion o estado aparece na hora', async ({ page }) => {
    await open(page)
    await slip(page, 1).hover()
    // Sem poll: sem transição, o estado final já vale na primeira leitura.
    expect(await opacities(page)).toEqual(['0.35', '1'])
    expect(await titleTransform(page, 1)).not.toBe('none')
  })
})

const ROUTES = [
  { path: '/', locale: 'en' },
  { path: '/pt', locale: 'pt' },
] as const

const ACCENT = 'rgb(163, 33, 20)'
const RULE = 'rgb(168, 151, 113)'
const INK = 'rgb(22, 19, 15)'
const INK_MUTED = 'rgb(90, 83, 74)'

type Site = (typeof contentByLocale)['en']['site']

function hero(page: Page, site: Site) {
  return page.getByRole('region', { name: site.person.name })
}

function primaryCta(page: Page, site: Site = contentByLocale.en.site) {
  return hero(page, site).getByRole('link', { name: site.hero.ctaPrimary })
}

function secondaryCta(page: Page, site: Site = contentByLocale.en.site) {
  return hero(page, site).getByRole('link', { name: site.hero.ctaSecondary })
}

function channel(page: Page, label: string, site = contentByLocale.en.site) {
  return page.getByRole('link', { name: `${label} ${site.links.externalHint}` })
}

/** A prévia de um link de ação: o slot irmão do `<a>`. */
function peekOf(link: Locator) {
  return link.locator('xpath=following-sibling::*[@data-motion="peek"]')
}

function traceOf(link: Locator) {
  return link.locator('[data-motion="trace"]')
}

function style(locator: Locator, prop: string) {
  return locator.evaluate(
    (el, prop) => getComputedStyle(el).getPropertyValue(prop),
    prop,
  )
}

/** Translação (x, y) do `transform` calculado; `none` é (0, 0). */
function translation(locator: Locator) {
  return locator.evaluate((el) => {
    const transform = getComputedStyle(el).transform
    if (transform === 'none') return { x: 0, y: 0 }
    const m = new DOMMatrixReadOnly(transform)
    return { x: m.m41, y: m.m42 }
  })
}

/** Leva o mouse ao centro do link e depois ao canto direito-inferior. */
async function pullToCorner(page: Page, link: Locator) {
  const box = (await link.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.move(box.x + box.width - 2, box.y + box.height - 2, {
    steps: 4,
  })
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

function overlaps(a: Box, b: Box) {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  )
}

/** Caixa que envolve o slot e os filhos (as capas giradas saem um pouco). */
function peekBox(peek: Locator) {
  return peek.evaluate((el) => {
    const rects = [el, ...el.querySelectorAll('*')].map((node) =>
      node.getBoundingClientRect(),
    )
    const left = Math.min(...rects.map((r) => r.left))
    const top = Math.min(...rects.map((r) => r.top))
    const right = Math.max(...rects.map((r) => r.right))
    const bottom = Math.max(...rects.map((r) => r.bottom))
    return { x: left, y: top, width: right - left, height: bottom - top }
  })
}

test.describe('links de ação · repouso', () => {
  test('traços e cores do Gate 2 antes de qualquer hover', async ({ page }) => {
    await open(page)
    await page.mouse.move(0, 0)
    expect(await style(traceOf(primaryCta(page)), 'background-color')).toBe(
      ACCENT,
    )
    expect(await style(traceOf(secondaryCta(page)), 'background-color')).toBe(
      RULE,
    )
    expect(await style(primaryCta(page), 'color')).toBe(INK)
    expect(await style(secondaryCta(page), 'color')).toBe(INK_MUTED)
    for (const label of ['GitHub', 'LinkedIn']) {
      expect(await style(channel(page, label), 'color'), label).toBe(INK)
      expect(
        await style(traceOf(channel(page, label)), 'background-color'),
        label,
      ).toBe(RULE)
    }
    expect(await style(peekOf(primaryCta(page)), 'visibility')).toBe('hidden')
  })
})

test.describe('links de ação · sem reduce', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('hover no CTA primário: traço vermelho e tira visível', async ({
    page,
  }) => {
    await open(page)
    const cta = primaryCta(page)
    await cta.hover()
    expect(await style(traceOf(cta), 'background-color')).toBe(ACCENT)
    // O `@keyframes` com hash do CSS Modules, declarado dentro do @media,
    // resolve: o traço anda de fato.
    expect(await style(traceOf(cta), 'animation-name')).not.toBe('none')
    await expect.poll(() => style(peekOf(cta), 'visibility')).toBe('visible')
    await expect.poll(() => style(peekOf(cta), 'opacity')).toBe('1')
    // A cor do texto não muda: só o traço troca.
    expect(await style(cta, 'color')).toBe(INK)
  })

  test('foco num canal do contato não muda a cor do texto', async ({
    page,
  }) => {
    await open(page)
    const github = channel(page, 'GitHub')
    await github.focus()
    expect(await style(traceOf(github), 'background-color')).toBe(ACCENT)
    expect(await style(github, 'color')).toBe(INK)
  })

  test('magnético: o mouse dentro do link o puxa', async ({ page }) => {
    await open(page)
    const cta = primaryCta(page)
    await pullToCorner(page, cta)
    await expect
      .poll(async () => {
        const t = await translation(cta)
        return t.x > 0 && t.y > 0
      })
      .toBe(true)
  })

  test('teclado não ativa o magnético', async ({ page }) => {
    await open(page)
    await page.mouse.move(0, 0)
    const cta = primaryCta(page)
    await cta.focus()
    expect(await translation(cta)).toEqual({ x: 0, y: 0 })
  })
})

test.describe('links de ação · reduce', () => {
  test.use({ reducedMotion: 'reduce' })

  test('magnético não existe com reduced motion', async ({ page }) => {
    await open(page)
    const cta = primaryCta(page)
    await pullToCorner(page, cta)
    expect(await translation(cta)).toEqual({ x: 0, y: 0 })
  })

  // 1200×800: a faixa mais apertada em que a tira aparece.
  const WIDE = { name: 'wide-1200', width: 1200, height: 800 }
  for (const viewport of [...VIEWPORTS, WIDE]) {
    for (const route of ROUTES) {
      const { site } = contentByLocale[route.locale]
      const size = { width: viewport.width, height: viewport.height }

      test(`a tira não cobre o hero · ${viewport.name} · ${route.locale}`, async ({
        page,
      }) => {
        await page.setViewportSize(size)
        await page.goto(route.path)
        await page.evaluate(() => document.fonts.ready.then(() => true))
        const cta = primaryCta(page, site)
        await cta.focus()
        const strip = peekOf(cta)
        if (viewport.width >= 1200) {
          // A partir de 1200 a tira existe: o teste não pode passar vazio.
          expect(await style(strip, 'display')).not.toBe('none')
        } else {
          expect(await style(strip, 'display')).toBe('none')
          test.info().annotations.push({
            type: 'tira',
            description: `display: none em ${viewport.name} (sem espaço livre)`,
          })
          return
        }
        expect(await style(strip, 'visibility')).toBe('visible')
        const stripBox = await peekBox(strip)
        const region = hero(page, site)
        const others = {
          h1: region.getByRole('heading', { level: 1 }),
          role: region.getByText(site.person.role, { exact: true }),
          statement: region.getByText(site.hero.statement, { exact: true }),
          secondary: secondaryCta(page, site),
        }
        for (const [name, locator] of Object.entries(others)) {
          const box = (await locator.boundingBox())!
          expect(overlaps(stripBox, box), name).toBe(false)
        }
        expect(stripBox.x).toBeGreaterThanOrEqual(0)
        expect(stripBox.x + stripBox.width).toBeLessThanOrEqual(size.width)
      })
    }
  }

  // 1366×650: notebook comum, a altura em que o cartão alcançava o rodapé.
  const LAPTOP = { name: 'laptop-1366x650', width: 1366, height: 650 }
  for (const viewport of [...VIEWPORTS, WIDE, LAPTOP]) {
    for (const route of ROUTES) {
      const { site } = contentByLocale[route.locale]
      const size = { width: viewport.width, height: viewport.height }

      test(`o cartão não cobre o outro canal nem o rodapé · ${viewport.name} · ${route.locale}`, async ({
        page,
      }) => {
        await page.setViewportSize(size)
        await page.goto(route.path)
        await page.evaluate(() => document.fonts.ready.then(() => true))
        for (const [label, other] of [
          ['GitHub', 'LinkedIn'],
          ['LinkedIn', 'GitHub'],
        ]) {
          const link = channel(page, label, site)
          await link.focus()
          const card = peekOf(link)
          expect(await style(card, 'visibility'), label).toBe('visible')
          const cardBox = (await card.boundingBox())!
          const otherBox = (await channel(page, other, site).boundingBox())!
          const footerBox = (await page.locator('footer p').boundingBox())!
          expect(overlaps(cardBox, otherBox), `${label} × ${other}`).toBe(false)
          expect(overlaps(cardBox, footerBox), `${label} × rodapé`).toBe(false)
          expect(cardBox.x).toBeGreaterThanOrEqual(0)
          expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(size.width)
        }
      })
    }
  }

  test('o cursor passa do GitHub para o cartão e o cartão fica', async ({
    page,
  }) => {
    await open(page)
    const github = channel(page, 'GitHub')
    await github.scrollIntoViewIfNeeded()
    const box = (await github.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    const card = peekOf(github)
    expect(await style(card, 'visibility')).toBe('visible')
    const cardBox = (await card.boundingBox())!
    // Em linha reta, do centro do link ao centro do cartão, passando pelo vão.
    await page.mouse.move(
      cardBox.x + cardBox.width / 2,
      cardBox.y + cardBox.height / 2,
      { steps: 12 },
    )
    expect(await style(card, 'visibility')).toBe('visible')
    expect(await style(card, 'opacity')).toBe('1')
  })

  test('Escape esconde o cartão aberto pelo foco; Tab fora e de volta o reabre', async ({
    page,
  }) => {
    await open(page)
    await page.mouse.move(0, 0)
    const github = channel(page, 'GitHub')
    await github.focus()
    const card = peekOf(github)
    expect(await style(card, 'visibility')).toBe('visible')
    await page.keyboard.press('Escape')
    expect(await style(card, 'visibility')).toBe('hidden')
    await expect(github).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(github).toBeFocused()
    expect(await style(card, 'visibility')).toBe('visible')
  })

  test('Escape esconde a prévia aberta pelo hover até o cursor sair', async ({
    page,
  }) => {
    await open(page)
    const cta = primaryCta(page)
    const box = (await cta.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    const strip = peekOf(cta)
    expect(await style(strip, 'visibility')).toBe('visible')
    await page.keyboard.press('Escape')
    expect(await style(strip, 'visibility')).toBe('hidden')
    await page.mouse.move(0, 0)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    expect(await style(strip, 'visibility')).toBe('visible')
  })
})

test.describe('toque · sem hover', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
    reducedMotion: 'no-preference',
  })

  test('tap numa ficha não esmaece as outras', async ({ page }) => {
    await open(page)
    await slip(page, 1).locator('p').nth(1).tap()
    expect(await opacities(page)).toEqual(['1', '1'])
  })

  test('tap num link externo da ficha não esmaece as outras', async ({
    page,
    context,
  }) => {
    context.on('page', (popup) => void popup.close())
    await open(page)
    await slip(page, 0).locator('a[target="_blank"]').first().tap()
    await expect.poll(() => opacities(page)).toEqual(['1', '1'])
  })

  test('tap no CTA primário navega e não deixa a tira', async ({ page }) => {
    await open(page)
    const cta = primaryCta(page)
    await cta.tap()
    await expect(page).toHaveURL(/#work$/)
    expect(await style(peekOf(cta), 'visibility')).toBe('hidden')
  })
})

test.describe('miniatura sem captura', () => {
  /** Linhas ocupadas pelo trecho "sem captura" na linha mono do placeholder. */
  function noCaptureLines(page: Page, noCapture: string) {
    return page
      .locator('#work [data-motion="thumb"]:not(img)')
      .evaluateAll((placeholders, needle) => {
        const lines: number[] = []
        for (const placeholder of placeholders) {
          const walker = document.createTreeWalker(
            placeholder,
            NodeFilter.SHOW_TEXT,
          )
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const text = node as Text
            const at = text.data.toUpperCase().indexOf(needle.toUpperCase())
            if (at < 0) continue
            const range = document.createRange()
            range.setStart(text, at)
            range.setEnd(text, at + needle.length)
            const tops = new Set(
              [...range.getClientRects()].map((r) => Math.round(r.top)),
            )
            lines.push(tops.size)
          }
        }
        return lines
      }, noCapture)
  }

  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      const { site } = contentByLocale[route.locale]
      test(`"${site.work.noCapture}" não quebra no meio · ${viewport.name} · ${route.locale}`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await page.goto(route.path)
        await page.evaluate(() => document.fonts.ready.then(() => true))
        const lines = await noCaptureLines(page, site.work.noCapture)
        // Todos os projetos de hoje têm captura (BACKLOG, Fase 5).
        test.skip(lines.length === 0, 'nenhuma ficha sem captura')
        expect(
          lines.every((count) => count === 1),
          String(lines),
        ).toBe(true)
      })
    }
  }
})

import { expect, test, type Locator, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'
import { VIEWPORTS } from './routes.ts'

const desktop = VIEWPORTS.find((v) => v.name === 'desktop')!

test.use({ viewport: { width: desktop.width, height: desktop.height } })

/** Ficha da lista de trabalhos, na ordem da home (1 = Token Killer, publicada). */
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
    await expect
      .poll(() => opacities(page))
      .toEqual(['0.35', '1', '0.35', '0.35'])
    expect(await titleTransform(page, 1)).not.toBe('none')
  })

  test('foco por teclado numa ficha faz o mesmo', async ({ page }) => {
    await open(page)
    await slip(page, 1).locator('h3 a').focus()
    await expect
      .poll(() => opacities(page))
      .toEqual(['0.35', '1', '0.35', '0.35'])
    expect(await titleTransform(page, 1)).not.toBe('none')
  })
})

test.describe('reação da lista · reduce', () => {
  test.use({ reducedMotion: 'reduce' })

  test('com reduced motion o estado aparece na hora', async ({ page }) => {
    await open(page)
    await slip(page, 1).hover()
    // Sem poll: sem transição, o estado final já vale na primeira leitura.
    expect(await opacities(page)).toEqual(['0.35', '1', '0.35', '0.35'])
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

  test('abertura e magnético não se sobrescrevem', async ({ page }) => {
    await open(page)
    // 10 % e não 30 %: o Release sobe junto com o scroll e, a 30 % de
    // `innerHeight`, já cobre os CTAs em toda faixa (o mouse não os alcança).
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.1))
    const cta = primaryCta(page)
    // wrapper do ActionLink > bloco `.actions` do hero.
    const actions = cta.locator('xpath=../..')
    await expect
      .poll(async () => (await translation(actions)).y)
      .toBeLessThan(0)
    await pullToCorner(page, cta)
    await expect
      .poll(async () => {
        const t = await translation(cta)
        return t.x > 0 && t.y > 0
      })
      .toBe(true)
    expect((await translation(actions)).y).toBeLessThan(0)
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

  for (const viewport of VIEWPORTS) {
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
        if ((await style(strip, 'display')) === 'none') {
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

      test(`foco no GitHub mostra o cartão sem cobrir o LinkedIn · ${viewport.name} · ${route.locale}`, async ({
        page,
      }) => {
        await page.setViewportSize(size)
        await page.goto(route.path)
        await page.evaluate(() => document.fonts.ready.then(() => true))
        const github = channel(page, 'GitHub', site)
        await github.focus()
        const card = peekOf(github)
        expect(await style(card, 'visibility')).toBe('visible')
        const cardBox = (await card.boundingBox())!
        const linkedin = (await channel(page, 'LinkedIn', site).boundingBox())!
        expect(overlaps(cardBox, linkedin)).toBe(false)
        expect(cardBox.x).toBeGreaterThanOrEqual(0)
        expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(size.width)
      })
    }
  }
})

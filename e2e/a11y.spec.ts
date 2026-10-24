import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator } from '@playwright/test'

function channel(value: number): number {
  const s = value / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(rgb: [number, number, number]): number {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
}

function parseRgb(input: string): [number, number, number] {
  const match = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) {
    throw new Error(`Unparsed color: ${input}`)
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function contrastRatio(foreground: string, background: string): number {
  const hi = Math.max(luminance(parseRgb(foreground)), luminance(parseRgb(background)))
  const lo = Math.min(luminance(parseRgb(foreground)), luminance(parseRgb(background)))
  return (hi + 0.05) / (lo + 0.05)
}

test('routes expose distinct titles', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('André Arcodaci — Portfolio')
  await page.goto('/work/map-areas')
  await expect(page).toHaveTitle('Map Areas — André Arcodaci')
  await page.goto('/work/does-not-exist')
  await expect(page).toHaveTitle('Page not found — André Arcodaci')
})

test('preview label meets AA contrast on paper', async ({ page }) => {
  await page.goto('/work/map-areas')
  const lead = page.getByText('Project preview', { exact: true })
  const color = await lead.evaluate((el) => getComputedStyle(el).color)
  const ratio = contrastRatio(color, 'rgb(228, 231, 226)')
  expect(ratio, `computed ${color}`).toBeGreaterThanOrEqual(4.5)
  expect(color).not.toBe('rgb(184, 134, 11)')
})

async function focusRing(locator: Locator, surface: 'footer' | 'copy') {
  return locator.evaluate((el, which) => {
    if (el instanceof HTMLElement) {
      el.focus({ focusVisible: true })
    }
    const outline = getComputedStyle(el).outlineColor
    const node =
      which === 'footer'
        ? el.closest('footer')
        : (() => {
            let current = el.parentElement
            while (current) {
              if ([...current.classList].some((name) => name.includes('copy'))) {
                return current
              }
              current = current.parentElement
            }
            return null
          })()
    return {
      outline,
      background: node ? getComputedStyle(node).backgroundColor : 'rgb(0, 0, 0)',
    }
  }, surface)
}

test('focus ring is visible on charcoal and stays ink-blue on the desktop hero', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const footer = await focusRing(page.locator('footer a').first(), 'footer')
  expect(
    contrastRatio(footer.outline, footer.background),
    `footer outline ${footer.outline} on ${footer.background}`,
  ).toBeGreaterThanOrEqual(3)

  const hero = await focusRing(page.getByRole('link', { name: 'Selected work' }), 'copy')
  expect(
    contrastRatio(hero.outline, hero.background),
    `hero outline ${hero.outline} on ${hero.background}`,
  ).toBeGreaterThanOrEqual(3)

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')

  const footerDesktop = await focusRing(page.locator('footer a').first(), 'footer')
  expect(
    contrastRatio(footerDesktop.outline, footerDesktop.background),
    `desktop footer outline ${footerDesktop.outline} on ${footerDesktop.background}`,
  ).toBeGreaterThanOrEqual(3)

  const heroDesktop = await focusRing(
    page.getByRole('link', { name: 'Selected work' }),
    'copy',
  )
  expect(heroDesktop.outline).toBe('rgb(26, 69, 96)')
})

test('cover caption is the only announcement and external channels name the hint', async ({
  page,
}) => {
  const coverAlt =
    'Map Areas interface — sidebar controls beside a Leaflet map of São Paulo'

  await page.goto('/work/map-areas')
  await expect(page.getByRole('img', { name: coverAlt })).toHaveCount(0)
  await expect(page.getByText(coverAlt)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Live demo' })).toBeVisible()

  await page.goto('/')
  await expect(page.getByRole('link', { name: 'GitHub, external' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Live demo' })).toBeVisible()
  await expect(page.locator('#work img')).toHaveAttribute('loading', 'lazy')
  await expect(page.locator('#work img')).not.toHaveAttribute('fetchpriority', 'high')
})

test('case-study cover is the high-priority image', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/work/map-areas')
  const cover = page.locator('article figure img')
  await expect(cover).toHaveAttribute('fetchpriority', 'high')
  await expect(cover).toHaveAttribute('alt', '')
  await expect
    .poll(() => cover.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toContain('map-areas-800.webp')

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/work/map-areas')
  await expect
    .poll(() => cover.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toMatch(/\/map-areas\.webp$/)
})

test('hash navigation focuses the work section', async ({ page }) => {
  await page.goto('/work/map-areas')
  await page.getByRole('link', { name: 'Back to selected work' }).click()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.activeElement
        const work = document.getElementById('work')
        const header = document.querySelector('header')
        if (!active || !work || !header) {
          return false
        }
        const focused = active === work || work.contains(active)
        const clear =
          work.getBoundingClientRect().top >= header.getBoundingClientRect().bottom - 1
        return focused && clear
      }),
    )
    .toBe(true)
})

test('navigation without a hash focuses main', async ({ page }) => {
  await page.goto('/work/map-areas')
  await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? '')).toBe('main')
})

test('hero plate focus list is available to assistive tech', async ({ page }) => {
  await page.goto('/')
  // Chromium leaves the listitem name empty and exposes the line as child text.
  const focusList = page.getByRole('listitem')
  await expect(focusList.filter({ hasText: /^Interfaces$/ })).toBeVisible()
  await expect(focusList.filter({ hasText: 'APIs & automation' })).toBeVisible()
  await expect(page.getByText('APIs & automation')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'André Arcodaci' })).toHaveCount(1)
  await expect(page.locator('aside')).not.toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('aside').getByText('AA', { exact: true })).toHaveAttribute(
    'aria-hidden',
    'true',
  )
})

const axeRoutes = ['/', '/work/map-areas', '/work/does-not-exist'] as const
const axeViewports = [
  { width: 390, height: 844 },
  { width: 1280, height: 900 },
] as const

test.describe('axe on primary routes', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const viewport of axeViewports) {
    for (const path of axeRoutes) {
      test(`no serious axe violations on ${path} at ${viewport.width}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(path)
        await page.evaluate(async () => {
          await document.fonts.ready
          document.documentElement.style.scrollBehavior = 'auto'
          const step = window.innerHeight
          const max = document.documentElement.scrollHeight
          for (let y = 0; y <= max; y += step) {
            window.scrollTo(0, y)
          }
          window.scrollTo(0, 0)
        })
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
          .analyze()
        const blocking = results.violations
          .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
          .map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            nodes: violation.nodes.map((node) => ({
              target: node.target,
              summary: node.failureSummary,
            })),
          }))
        expect(blocking).toEqual([])

        if (path === '/') {
          await expect(page.getByRole('link', { name: 'Case study', exact: true })).toHaveCount(0)
          await expect(page.getByText('Case study soon')).toBeVisible()
        }

        if (path === '/work/map-areas') {
          await expect(page.getByText('Project preview', { exact: true })).toBeVisible()
          await expect(page.getByRole('link', { name: 'Repository', exact: true })).toHaveCount(0)
          await expect(page.getByRole('link', { name: 'Live demo' })).toHaveAttribute(
            'href',
            'https://geo-areas-php.onrender.com/',
          )
        }
      })
    }
  }
})

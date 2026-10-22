/**
 * M3 runtime visual/interaction validation.
 * Run after `pnpm build && pnpm preview` (default http://127.0.0.1:4173).
 *
 * Usage (from repo root):
 *   node scripts/m3-runtime-validate.mjs
 */
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const toolsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../.tools/m3-validate',
)
const { chromium } = require(
  require.resolve('playwright', { paths: [toolsRoot] }),
)

const BASE = process.env.M3_BASE_URL ?? 'http://127.0.0.1:4173/'
const OUT = path.resolve('docs/m3-review')

async function measureOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    return {
      overflowX: doc.scrollWidth > doc.clientWidth + 1,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    }
  })
}

async function heroSnapshot(page) {
  return page.evaluate(() => {
    const name = document.getElementById('home-name')
    const first = name?.querySelector('[class*="nameFirst"]')
    const rest = name?.querySelector('[class*="nameRest"]')
    const role = document.querySelector('[class*="role"]')
    const cta = document.querySelector('a[href="#work"]')
    const read = (el) => {
      if (!el) return null
      const cs = getComputedStyle(el)
      return {
        text: el.textContent?.trim() ?? '',
        opacity: Number(cs.opacity),
        visibility: cs.visibility,
        transform: cs.transform,
      }
    }
    return {
      nameText: name?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
      first: read(first),
      rest: read(rest),
      role: read(role),
      ctaOpacity: cta ? Number(getComputedStyle(cta).opacity) : null,
      ctaPointer: cta ? getComputedStyle(cta).pointerEvents : null,
    }
  })
}

async function revealStates(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[data-motion-inview]')]
    return {
      total: nodes.length,
      hidden: nodes.filter((n) => n.getAttribute('data-motion-inview') === 'false')
        .length,
      shown: nodes.filter((n) => n.getAttribute('data-motion-inview') === 'true')
        .length,
      samples: nodes.slice(0, 8).map((n) => ({
        inview: n.getAttribute('data-motion-inview'),
        opacity: getComputedStyle(n).opacity,
        tag: n.tagName,
      })),
    }
  })
}

async function waitSettled(page) {
  // Hero stagger settles by ~600ms + 4*70ms ≈ 880ms; pad for paint.
  await page.waitForTimeout(1100)
}

const report = {
  base: BASE,
  heroTimeline: {},
  settled: {},
  reduced: {},
  interactions: {},
  reveals: {},
  defects: [],
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

// —— Hero timeline (desktop) ——
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })

  await page.screenshot({
    path: path.join(OUT, 'hero-t0-1280.png'),
    fullPage: false,
  })
  report.heroTimeline.t0 = await heroSnapshot(page)

  await page.waitForTimeout(350)
  await page.screenshot({
    path: path.join(OUT, 'hero-t350-1280.png'),
    fullPage: false,
  })
  report.heroTimeline.t350 = await heroSnapshot(page)

  await waitSettled(page)
  await page.screenshot({
    path: path.join(OUT, 'hero-settled-1280.png'),
    fullPage: false,
  })
  report.heroTimeline.settled = await heroSnapshot(page)
  report.heroTimeline.overflow = await measureOverflow(page)

  await context.close()
}

// Opacity must stay readable throughout (transform-only entrance)
for (const [key, snap] of Object.entries(report.heroTimeline)) {
  if (!snap || typeof snap !== 'object' || !('first' in snap)) continue
  const op = snap.first?.opacity
  if (typeof op === 'number' && op < 0.95) {
    report.defects.push(`Hero first-name opacity low at ${key}: ${op}`)
  }
  if (snap.rest && snap.rest.opacity < 0.95) {
    report.defects.push(`Hero surname opacity low at ${key}: ${snap.rest.opacity}`)
  }
}

// —— Settled + reduced across widths ——
for (const width of [390, 768, 1280, 1440]) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await waitSettled(page)
  await page.screenshot({
    path: path.join(OUT, `settled-${width}.png`),
    fullPage: false,
  })
  report.settled[width] = {
    hero: await heroSnapshot(page),
    overflow: await measureOverflow(page),
  }
  await context.close()
}

for (const width of [390, 1280]) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(200)
  await page.screenshot({
    path: path.join(OUT, `reduced-${width}.png`),
    fullPage: false,
  })
  const hero = await heroSnapshot(page)
  const reveals = await revealStates(page)
  report.reduced[width] = { hero, reveals, overflow: await measureOverflow(page) }
  if (reveals.hidden > 0) {
    report.defects.push(
      `Reduced-motion ${width}: ${reveals.hidden} reveals still hidden`,
    )
  }
  await context.close()
}

// —— Section reveals: scroll + reverse + anchors + fallback ——
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await waitSettled(page)

  const afterLoad = await revealStates(page)

  for (const id of ['work', 'about', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(450)
  }
  const afterScrollDown = await revealStates(page)

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  const afterScrollTop = await revealStates(page)

  await page.goto(`${BASE}#about`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const aboutReveal = await page.evaluate(() => {
    const about = document.getElementById('about')
    const pending = about
      ? [...about.querySelectorAll('[data-motion-inview="false"]')].length
      : -1
    return {
      pending,
      aboutOpacity: about ? getComputedStyle(about).opacity : null,
    }
  })

  // Fast scroll stress
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight
    for (let y = 0; y <= max; y += Math.ceil(max / 8)) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 30))
    }
    window.scrollTo(0, max)
  })
  await page.waitForTimeout(1300) // allow fallback if IO missed
  const afterFastScroll = await revealStates(page)

  report.reveals = {
    afterLoad,
    afterScrollDown,
    afterScrollTop,
    aboutReveal,
    afterFastScroll,
  }

  if (afterScrollDown.hidden > 0) {
    report.defects.push(
      `After scrolling all sections, ${afterScrollDown.hidden} reveals still hidden`,
    )
  }
  if (afterScrollTop.hidden > afterScrollDown.hidden) {
    report.defects.push('Reverse scroll un-revealed content (should stay visible)')
  }
  if (afterFastScroll.hidden > 0) {
    report.defects.push(
      `After fast scroll + fallback window, ${afterFastScroll.hidden} reveals still hidden`,
    )
  }
  if (aboutReveal.pending > 0) {
    report.defects.push(
      `Direct #about navigation left ${aboutReveal.pending} nested reveals hidden`,
    )
  }

  await context.close()
}

// —— Interactions ——
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await waitSettled(page)
  await page.locator('#work').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)

  const project = page.locator('#work li').first()
  const img = project.locator('img').first()
  const before = await img.evaluate((el) => getComputedStyle(el).transform)
  await project.hover()
  await page.waitForTimeout(350)
  const afterHover = await img.evaluate((el) => getComputedStyle(el).transform)

  await page.locator('a[href="#contact"]').first().focus()
  const focusStyles = await page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    const cs = getComputedStyle(el)
    return {
      tag: el.tagName,
      outlineStyle: cs.outlineStyle,
      outlineWidth: cs.outlineWidth,
      boxShadow: cs.boxShadow,
    }
  })

  await page.locator('a[href="#about"]').first().click()
  await page.waitForTimeout(600)
  const activeNav = await page.evaluate(() => {
    const current = document.querySelector('nav a[aria-current]')
    return current?.getAttribute('href') ?? null
  })

  // Keyboard focus-within parity: tab to Live demo inside project
  await page.goto(`${BASE}#work`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.locator('#work a').first().focus()
  const focusWithinScale = await page.evaluate(() => {
    const li = document.querySelector('#work li')
    const imgEl = li?.querySelector('img')
    return imgEl ? getComputedStyle(imgEl).transform : null
  })

  report.interactions = {
    hoverTransformBefore: before,
    hoverTransformAfter: afterHover,
    hoverChanged: before !== afterHover,
    focusStyles,
    activeNavAfterAboutClick: activeNav,
    focusWithinTransform: focusWithinScale,
  }

  if (!report.interactions.hoverChanged) {
    report.defects.push('Project hover did not change media transform')
  }

  // Mobile touch: tap Live demo is reachable (no overlay trap)
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const mpage = await mobile.newPage()
  await mpage.goto(BASE, { waitUntil: 'networkidle' })
  await waitSettled(mpage)
  await mpage.locator('#work').scrollIntoViewIfNeeded()
  await mpage.waitForTimeout(500)
  const live = mpage.locator('#work a').first()
  const box = await live.boundingBox()
  report.interactions.mobileLiveDemoBox = box
  if (!box || box.height < 40) {
    report.defects.push('Mobile Live demo target smaller than ~44px touch ideal')
  }
  await mobile.close()
  await context.close()
}

await browser.close()

const failed = report.defects.length > 0
console.log(JSON.stringify(report, null, 2))
if (failed) {
  console.error(`\nM3 validation found ${report.defects.length} defect(s).`)
  process.exitCode = 1
} else {
  console.error('\nM3 validation passed runtime checks.')
}

import { expect, test, type Page } from '@playwright/test'

const widths = [320, 390, 768, 1280] as const

const fontAt16: Record<(typeof widths)[number], string> = {
  320: '41.6px',
  390: '58.5px',
  768: '69.12px',
  1280: '115.2px',
}

interface FitSnapshot {
  font: string
  headerH: number
  headerTop: number
  headerBottom: number
  scrollWidth: number
  clientWidth: number
  lines: Array<{ text: string; left: number; right: number }>
  links: Array<{ text: string; top: number; bottom: number; left: number; right: number }>
}

async function loadHome(page: Page, width: number, rootPx: number) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('/')
  await page.evaluate((px) => {
    document.documentElement.style.fontSize = px === 16 ? '' : `${px}px`
  }, rootPx)
  await page.evaluate(() => document.fonts.ready)
}

async function snapshot(page: Page): Promise<FitSnapshot> {
  return page.evaluate(() => {
    const doc = document.documentElement
    const h1 = document.querySelector('h1')
    if (!h1) {
      throw new Error('missing h1')
    }
    const lines = [...h1.querySelectorAll('span')].map((el) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      const box = range.getBoundingClientRect()
      return {
        text: el.textContent ?? '',
        left: box.left,
        right: box.right,
      }
    })
    const header = document.querySelector('header')
    if (!header) {
      throw new Error('missing header')
    }
    const headerBox = header.getBoundingClientRect()
    const links = [...header.querySelectorAll('a')].map((el) => {
      const box = el.getBoundingClientRect()
      return {
        text: (el.textContent ?? '').trim(),
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
      }
    })
    return {
      font: getComputedStyle(h1).fontSize,
      headerH: headerBox.height,
      headerTop: headerBox.top,
      headerBottom: headerBox.bottom,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      lines,
      links,
    }
  })
}

function expectContained(data: FitSnapshot) {
  expect(data.scrollWidth).toBeLessThanOrEqual(data.clientWidth + 1)
  for (const line of data.lines) {
    expect(line.left, line.text).toBeGreaterThanOrEqual(-1)
    expect(line.right, line.text).toBeLessThanOrEqual(data.clientWidth + 1)
  }
  for (const link of data.links) {
    expect(link.top, link.text).toBeGreaterThanOrEqual(data.headerTop - 1)
    expect(link.bottom, link.text).toBeLessThanOrEqual(data.headerBottom + 1)
    expect(link.left, link.text).toBeGreaterThanOrEqual(-1)
    expect(link.right, link.text).toBeLessThanOrEqual(data.clientWidth + 1)
  }
}

for (const width of widths) {
  test(`default text keeps the approved hero size @ ${width}`, async ({ page }) => {
    await loadHome(page, width, 16)
    const data = await snapshot(page)
    expect(data.font).toBe(fontAt16[width])
    if (width >= 390) {
      expect(data.headerH).toBe(60)
    }
    expectContained(data)
  })

  for (const rootPx of [32, 64] as const) {
    test(`root ${rootPx}px keeps the name and header inside the viewport @ ${width}`, async ({
      page,
    }) => {
      await loadHome(page, width, rootPx)
      expectContained(await snapshot(page))
    })
  }
}

test('wrapped header does not cover the work heading', async ({ page }) => {
  await loadHome(page, 320, 16)
  await page.getByRole('link', { name: 'Work', exact: true }).click()
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const work = document.querySelector('#work')?.getBoundingClientRect().top ?? 0
        const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
        return work - header
      }),
    )
    .toBeGreaterThanOrEqual(-1)
})

test('enlarged header links are reachable from the keyboard', async ({ page }) => {
  await loadHome(page, 390, 32)
  const labels = ['André Arcodaci', 'Work', 'About', 'Contact']
  for (const label of labels) {
    await page.getByRole('link', { name: label }).first().focus()
    const box = await page.evaluate(() => {
      const el = document.activeElement
      if (!(el instanceof HTMLElement)) {
        return null
      }
      const rect = el.getBoundingClientRect()
      const header = document.querySelector('header')?.getBoundingClientRect()
      return {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        headerBottom: header?.bottom ?? 0,
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
      }
    })
    expect(box).not.toBeNull()
    expect(box!.top).toBeGreaterThanOrEqual(-1)
    expect(box!.bottom).toBeLessThanOrEqual((box!.headerBottom ?? 0) + 1)
    expect(box!.right).toBeLessThanOrEqual(box!.innerWidth + 1)
  }
})

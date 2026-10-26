import { expect, test } from '@playwright/test'
import { GATE_ROUTES, VIEWPORTS } from './routes.ts'

for (const viewport of VIEWPORTS) {
  for (const route of GATE_ROUTES) {
    test(`sem rolagem horizontal · ${viewport.name} · ${route}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await page.goto(route)
      await page.evaluate(() => document.fonts.ready.then(() => true))
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
    })
  }
}

for (const route of GATE_ROUTES) {
  test(`nenhum elemento de main passa da borda em 390px · ${route}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready.then(() => true))
    const culprit = await page.evaluate(() => {
      const main = document.querySelector('main')
      if (!main) return 'sem <main>'
      const describe = (el: Element) => {
        const cls = typeof el.className === 'string' ? el.className.trim() : ''
        return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${
          cls ? `.${cls.split(/\s+/).join('.')}` : ''
        }`
      }
      for (const el of main.querySelectorAll('*')) {
        const rect = el.getBoundingClientRect()
        if (rect.width > 0 && rect.right > window.innerWidth + 1) {
          return `${describe(el)} right=${Math.round(rect.right)}`
        }
      }
      return null
    })
    expect(culprit).toBeNull()
  })
}

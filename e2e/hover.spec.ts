import { expect, test, type Page } from '@playwright/test'
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

import { expect, test, type Page } from '@playwright/test'

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

/** Rola com a roda até a base do Sobre subir `fraction` da altura do Contato. */
async function scrollIntoReveal(page: Page, fraction: number) {
  const distance = await page.evaluate((fraction) => {
    const about = document.getElementById('about')
    const contact = document.getElementById('contact')
    if (!about || !contact) throw new Error('sem #about ou #contact')
    return (
      about.getBoundingClientRect().bottom -
      window.innerHeight +
      contact.offsetHeight * fraction
    )
  }, fraction)
  await page.mouse.move(700, 450)
  for (let done = 0; done < distance; done += 400)
    await page.mouse.wheel(0, Math.min(400, distance - done))
  await settle(page)
}

const curve = (page: Page) =>
  page.evaluate(() => {
    const about = document.getElementById('about')
    return about ? parseFloat(getComputedStyle(about, '::after').height) : -1
  })

test.describe('fim da home: o Contato sai de baixo do Sobre', () => {
  test.use({
    reducedMotion: 'no-preference',
    viewport: { width: 1440, height: 900 },
  })

  test('no meio da revelação: Contato preso no pé da janela, borda curva', async ({
    page,
  }) => {
    await page.goto('/')
    await scrollIntoReveal(page, 0.5)
    const bottom = await page
      .locator('#contact')
      .evaluate((el) => el.getBoundingClientRect().bottom)
    expect(Math.abs(bottom - 900)).toBeLessThanOrEqual(1)
    expect(await curve(page)).toBeGreaterThan(50)
  })

  test('#contact para com o Contato inteiro à vista e a borda reta', async ({
    page,
  }) => {
    await page.goto('/')
    await page.locator('a[href="#contact"]').first().click()
    await settle(page)
    const box = await page
      .locator('#contact')
      .evaluate((el) => el.getBoundingClientRect().toJSON())
    expect(box.top).toBeGreaterThanOrEqual(-1)
    expect(box.bottom).toBeLessThanOrEqual(901)
    expect(await curve(page)).toBeLessThanOrEqual(1)
  })

  test('Tab até um canal ainda coberto o traz à vista', async ({ page }) => {
    await page.goto('/')
    await scrollIntoReveal(page, 0.2)
    await page.locator('#about').evaluate((el) => {
      el.setAttribute('tabindex', '-1')
      el.focus()
    })
    await page.keyboard.press('Tab')
    const link = page.locator('#contact a').first()
    await expect(link).toBeFocused()
    await expect
      .poll(() =>
        link.evaluate((el) => {
          const box = el.getBoundingClientRect()
          const hit = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + box.height / 2,
          )
          return hit !== null && el.contains(hit)
        }),
      )
      .toBe(true)
  })
})

test.describe('fim da home com reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('o Contato fica no fluxo, sem curva', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('[data-reveal]').count()).toBe(0)
    const position = await page
      .locator('#contact')
      .evaluate((el) => getComputedStyle(el).position)
    expect(position).not.toBe('sticky')
  })
})

import { test, type Page } from '@playwright/test'

/**
 * Capturas do case study do próprio portfólio: o Hero com o cubo, o cubo
 * virado modelo e a máquina de escrever carimbando uma frase. Os PNGs saem em
 * `PORTFOLIO_CAPTURE_DIR` (padrão: `docs/portfolio`) e viram `.webp` em
 * `public/images/projects/` à mão, com `cwebp`.
 */
test.use({ reducedMotion: 'no-preference' })

const outDir = (testDir: string) =>
  process.env.PORTFOLIO_CAPTURE_DIR ?? `${testDir}/../docs/portfolio`

async function ready(page: Page, path: string) {
  await page.goto(path)
  await page.waitForSelector('[data-entrance="done"]')
  await page.evaluate(() => document.fonts.ready.then(() => true))
  await page.waitForTimeout(800)
}

for (const locale of [
  { name: 'en', path: '/', phrase: 'hello, world' },
  { name: 'pt', path: '/pt', phrase: 'oi, mundo' },
]) {
  test(`portfolio · cubo · ${locale.name}`, async ({ page }, testInfo) => {
    const dir = outDir(testInfo.project.testDir)
    await page.setViewportSize({ width: 1440, height: 900 })
    await ready(page, locale.path)
    await page.mouse.move(40, 880)
    await page.screenshot({ path: `${dir}/hero-${locale.name}.png` })

    const cube = page.locator('button[class*="cubeButton"]')
    const box = (await cube.boundingBox())!
    // Recorte quadrado justo no centro da célula, onde a forma gira.
    const side = Math.round(Math.max(box.width, box.height) * 0.72)
    const clip = {
      x: Math.round(box.x + box.width / 2 - side / 2),
      y: Math.round(box.y + box.height / 2 - side / 2),
      width: side,
      height: side,
    }
    await page.mouse.move(40, 880)
    const frames = [await page.screenshot({ clip })]
    // 1 Sora, 2 pena, 3 livro, 4 avião.
    for (let shape = 1; shape <= 4; shape++) {
      await cube.click()
      await page.mouse.move(40, 880)
      await page.waitForTimeout(1800)
      frames.push(await page.screenshot({ clip }))
    }
    // Grade 2 × 2: o cubo, Sora, a pena e o avião, com filetes entre eles.
    const pick = [frames[0]!, frames[1]!, frames[2]!, frames[4]!]
    const bg = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector('main section')!)
          .backgroundColor,
    )
    await page.setViewportSize({ width: side * 2 + 1, height: side * 2 + 1 })
    await page.setContent(
      `<style>html,body{margin:0;background:#16130f22}
        .g{display:grid;grid-template-columns:repeat(2,${side}px);gap:1px}
        img{display:block;width:${side}px;height:${side}px;background:${bg}}</style>
      <div class="g">${pick
        .map(
          (buf) =>
            `<img src="data:image/png;base64,${buf.toString('base64')}">`,
        )
        .join('')}</div>`,
    )
    await page.screenshot({ path: `${dir}/cube-grid-${locale.name}.png` })
  })

  test(`portfolio · máquina · ${locale.name}`, async ({ page }, testInfo) => {
    const dir = outDir(testInfo.project.testDir)
    await page.setViewportSize({ width: 1440, height: 900 })
    await ready(page, locale.path)
    await page.evaluate(() =>
      document.getElementById('about')?.scrollIntoView({ block: 'start' }),
    )
    await page.waitForTimeout(1500)
    // Uma frase em linha: o mouse anda uma letra a cada tecla. O espaço só
    // anda: no navegador ele também rolaria a página.
    let x = 930
    for (const char of locale.phrase) {
      await page.mouse.move(x, 160)
      if (char !== ' ') await page.keyboard.press(char)
      x += 34
      await page.waitForTimeout(60)
    }
    // E algumas soltas, empilhadas e fora de ordem, como quem testa a máquina.
    for (const [px, py, char] of [
      [1010, 250, 'a'],
      [1018, 258, 'a'],
      [1300, 290, 'k'],
      [700, 760, '?'],
    ] as const) {
      await page.mouse.move(px, py)
      await page.keyboard.press(char)
    }
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${dir}/typewriter-${locale.name}.png` })
  })
}

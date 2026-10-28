import { expect, test, type Page } from '@playwright/test'
import { contentByLocale } from '../src/content/index.ts'
import {
  flight,
  freezeAt,
  groupBox,
  pseudoOpacity,
  release,
} from './title-flight.helpers.ts'
import { VIEWPORTS } from './routes.ts'

const en = contentByLocale.en.site
const desktop = VIEWPORTS.find((v) => v.name === 'desktop')!

test.use({ viewport: { width: desktop.width, height: desktop.height } })

const SLUG = 'local-email-client'
const TITLE = 'Local Email Client'

/** Link do título na ficha do Local Email Client. */
function slipLink(page: Page) {
  return page.locator(`#work-${SLUG} a[data-anchor-focus]`)
}

function caseTitle(page: Page) {
  return page.getByRole('heading', { level: 1, name: TITLE })
}

function backLink(page: Page) {
  return page.getByRole('link', { name: en.caseStudy.backToWork })
}

async function open(page: Page, path = '/') {
  await page.goto(path)
  await page.evaluate(() => document.fonts.ready.then(() => true))
  await expect(
    page.locator('[data-entrance="run"], [data-entrance="pending"]'),
  ).toHaveCount(0)
}

/**
 * Espera a View Transition começar e acabar. Só esperar "nenhuma animação"
 * passaria logo depois do clique, antes de a transição existir.
 */
async function landed(page: Page) {
  await expect.poll(async () => (await flight(page)).length).toBeGreaterThan(0)
  await expect.poll(async () => (await flight(page)).length).toBe(0)
}

/** Espera as transições de um elemento (o recuo do hover) terminarem. */
async function still(page: Page, selector: string) {
  await page.waitForFunction(
    (selector) =>
      document
        .querySelector(selector)
        ?.getAnimations({ subtree: true })
        .every((animation) => animation.playState !== 'running') ?? false,
    selector,
  )
}

/**
 * Maior número de animações de View Transition vistas, quadro a quadro,
 * durante `ms` a partir de agora (logo depois de um clique).
 */
function maxFlightAround(page: Page, ms = 600) {
  return page.evaluate((ms) => {
    let max = 0
    const count = () =>
      document
        .getAnimations()
        .filter((animation) =>
          (animation.effect as KeyframeEffect | null)?.pseudoElement?.includes(
            'view-transition',
          ),
        ).length
    return new Promise<number>((resolve) => {
      const start = performance.now()
      const tick = () => {
        max = Math.max(max, count())
        if (performance.now() - start >= ms) resolve(max)
        else requestAnimationFrame(tick)
      }
      tick()
    })
  }, ms)
}

/** Clica sem mexer o mouse: o cursor fica onde o teste o deixou. */
function clickInPage(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => (el as HTMLElement).click())
}

/** Retângulo do texto do `h1` do case, na janela. */
function caseTitleTextBox(page: Page) {
  return page.locator('#case-study-title > span').evaluate((span) => {
    const { x, y, width, height } = span.getBoundingClientRect()
    return { x, y, width, height }
  })
}

const near = (actual: number, expected: number, slack = 2) =>
  Math.abs(actual - expected) <= slack

test.describe('título que viaja · sem reduce', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('ida: URL muda no clique, antes da viagem acabar', async ({ page }) => {
    await open(page)
    await slipLink(page).click()
    await expect(page).toHaveURL(new RegExp(`/work/${SLUG}$`))
    await expect
      .poll(async () => (await flight(page)).length, { timeout: 1000 })
      .toBeGreaterThan(0)
  })

  test('ida: o título começa no lugar da ficha e termina no h1', async ({
    page,
  }) => {
    await open(page)
    // O cursor sobre a ficha recua o título: mede depois do recuo, que é
    // onde ele está quando o clique tira a foto antiga. (Pairar sobre o
    // próprio link não estabiliza: o recuo o tira de baixo do cursor.)
    await page.locator(`#work-${SLUG}`).hover()
    await still(page, `#work-${SLUG}`)
    const from = (await slipLink(page).boundingBox())!
    await slipLink(page).click()

    await freezeAt(page, 0)
    const start = await groupBox(page)
    expect(near(start.width, from.width), JSON.stringify(start)).toBe(true)
    expect(near(start.x, from.x), JSON.stringify(start)).toBe(true)
    expect(near(start.y, from.y), JSON.stringify(start)).toBe(true)

    await freezeAt(page, 800)
    const end = await groupBox(page)
    const to = await caseTitleTextBox(page)
    expect(near(end.width, to.width), JSON.stringify({ end, to })).toBe(true)
    expect(near(end.height, to.height), JSON.stringify({ end, to })).toBe(true)
    expect(near(end.x, to.x), JSON.stringify({ end, to })).toBe(true)
    expect(near(end.y, to.y), JSON.stringify({ end, to })).toBe(true)
    await release(page)
    await landed(page)
  })

  test('ida: só a foto nova do título aparece', async ({ page }) => {
    await open(page)
    await slipLink(page).click()
    await freezeAt(page, 400)
    expect(await pseudoOpacity(page, '::view-transition-old(case-title)')).toBe(
      0,
    )
    expect(await pseudoOpacity(page, '::view-transition-new(case-title)')).toBe(
      1,
    )
    await release(page)
    await landed(page)
  })

  test('ida: termina com foco no h1 e nenhum pseudo-elemento', async ({
    page,
  }) => {
    await open(page)
    await slipLink(page).click()
    await landed(page)
    await expect(caseTitle(page)).toBeFocused()
  })

  test('volta: só a foto antiga aparece; termina na ficha, com foco no link', async ({
    page,
  }) => {
    await open(page)
    await slipLink(page).click()
    await landed(page)
    await backLink(page).click()
    await freezeAt(page, 375)
    expect(await pseudoOpacity(page, '::view-transition-old(case-title)')).toBe(
      1,
    )
    expect(await pseudoOpacity(page, '::view-transition-new(case-title)')).toBe(
      0,
    )
    await release(page)
    await landed(page)
    await expect(page.locator(`#work-${SLUG}`)).toBeInViewport()
    await expect(slipLink(page)).toBeFocused()
  })

  test('volta: a ficha pousa em repouso com o cursor parado sobre outra', async ({
    page,
  }) => {
    const slips = page.locator('#work ol > li')
    const titles = () =>
      slips.evaluateAll((items) =>
        items.map((li) => getComputedStyle(li.querySelector('h3')!).transform),
      )
    const opacities = () =>
      slips.evaluateAll((items) =>
        items.map((li) => getComputedStyle(li).opacity),
      )

    // Primeira volta: descobre onde fica uma ficha vizinha depois do pouso.
    await open(page)
    await slipLink(page).click()
    await landed(page)
    await clickInPage(page, `a[href$="#work-${SLUG}"]`)
    await landed(page)
    const neighbour = await slips.evaluateAll((items, slug) => {
      const at = items.findIndex((li) => li.id === `work-${slug}`)
      for (const index of [at - 1, at + 1]) {
        const box = items[index]?.getBoundingClientRect()
        if (box && box.top >= 0 && box.top + 20 < window.innerHeight)
          return { index, x: box.left + 40, y: box.top + 20 }
      }
      return null
    }, SLUG)
    // O pouso põe a ficha no topo: só a de baixo fica à vista. Com o case na
    // última ficha não há vizinha, e o cenário não existe (BACKLOG, Fase 5).
    test.skip(neighbour === null, 'sem ficha abaixo da que tem case')
    const { index, x, y } = neighbour!

    // Segunda ida e volta, com o cursor parado sobre a vizinha.
    await slipLink(page).click()
    await landed(page)
    await page.mouse.move(x, y)
    await clickInPage(page, `a[href$="#work-${SLUG}"]`)
    await landed(page)
    await expect(page.locator(`#work-${SLUG}`)).toBeInViewport()
    expect(await opacities()).toEqual(
      Array.from({ length: await slips.count() }, () => '1'),
    )
    expect((await titles())[index]).toBe('none')

    // O cursor se mexe: a reação volta.
    await page.mouse.move(x + 5, y)
    await expect.poll(async () => (await titles())[index]).not.toBe('none')
    await expect
      .poll(async () => (await opacities()).filter((o) => o === '1'))
      .toHaveLength(1)
  })

  test('segundo clique durante a viagem termina na página certa', async ({
    page,
  }) => {
    await open(page)
    await slipLink(page).click()
    await page.waitForSelector(`a[href$="#work-${SLUG}"]`, {
      state: 'attached',
    })
    await clickInPage(page, `a[href$="#work-${SLUG}"]`)
    await landed(page)
    await expect(page).toHaveURL(new RegExp(`/#work-${SLUG}$`))
    await expect(slipLink(page)).toBeVisible()
  })
})

test.describe('título que viaja · voltar do navegador', () => {
  test.use({ reducedMotion: 'no-preference' })

  // O router repete a transição ao voltar entre duas páginas que já viajaram;
  // pelo desenho, voltar/avançar do navegador é troca direta.
  test('voltar e avançar do navegador: troca direta, sem viagem', async ({
    page,
  }) => {
    await open(page)
    await slipLink(page).click()
    await landed(page)
    await page.goBack()
    expect(await maxFlightAround(page)).toBe(0)
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('#main')).toBeFocused()
    await page.goForward()
    expect(await maxFlightAround(page)).toBe(0)
    await expect(caseTitle(page)).toBeVisible()
  })

  test('voltar do navegador depois do "Voltar": troca direta', async ({
    page,
  }) => {
    await open(page)
    await slipLink(page).click()
    await landed(page)
    await backLink(page).click()
    await landed(page)
    await page.goBack()
    expect(await maxFlightAround(page)).toBe(0)
    await expect(caseTitle(page)).toBeVisible()
  })
})

test.describe('título que viaja · reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('reduced motion: troca direta, mesmos foco e posição', async ({
    page,
  }) => {
    await open(page)
    await slipLink(page).click()
    expect(await maxFlightAround(page)).toBe(0)
    await expect(page).toHaveURL(new RegExp(`/work/${SLUG}$`))
    await expect(caseTitle(page)).toBeFocused()

    await backLink(page).click()
    expect(await maxFlightAround(page)).toBe(0)
    await expect(page).toHaveURL(new RegExp(`/#work-${SLUG}$`))
    await expect(page.locator(`#work-${SLUG}`)).toBeInViewport()
    await expect(slipLink(page)).toBeFocused()
  })
})

test.describe('título que viaja · case em preview', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('case em preview: volta direta, sem viagem', async ({ page }) => {
    const preview = contentByLocale.en.projects.find(
      (project) => project.status === 'preview',
    )
    // Todos os projetos de hoje estão publicados (BACKLOG, Fase 5).
    test.skip(!preview, 'nenhum projeto em preview')
    const slug = preview!.slug
    await open(page, `/work/${slug}`)
    await backLink(page).click()
    expect(await maxFlightAround(page)).toBe(0)
    await expect(page.locator(`#work-${slug}`)).toBeInViewport()
    await expect(page.locator(`#work-${slug} h3`)).toBeFocused()
  })
})

test.describe('título que viaja · recarga depois da volta', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('recarregar depois de voltar de um case hidrata igual ao HTML: sem repouso', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })

    await open(page)
    await slipLink(page).click()
    await landed(page)
    await backLink(page).click()
    await landed(page)
    // Na volta por navegação do cliente, a lista pousa em repouso.
    await expect(page.locator('#work [data-settling]')).toHaveCount(1)

    await page.reload()
    await page.waitForLoadState('networkidle')
    // O estado do histórico sobrevive à recarga; o HTML pré-renderizado não
    // sabe dele. A primeira renderização precisa casar com o HTML.
    await expect(page.locator('#work [data-settling]')).toHaveCount(0)
    expect(errors).toEqual([])
  })
})

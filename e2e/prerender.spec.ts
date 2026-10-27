import { expect, test } from '@playwright/test'
import { prerenderRoutes } from '../src/app/prerenderRoutes.ts'
import { contentByLocale } from '../src/content/index.ts'

const en = contentByLocale.en.site
const pt = contentByLocale.pt.site

test.describe('HTML pré-renderizado (sem navegador)', () => {
  const pages: [string, RegExp][] = [
    ['/', /André/],
    ['/pt', /André/],
    ['/pt/work/map-areas', /Map Areas/],
  ]
  for (const [url, h1] of pages) {
    test(`${url} chega com conteúdo e head`, async ({ request }) => {
      const res = await request.get(url)
      expect(res.status()).toBe(200)
      const html = await res.text()
      expect(html).toMatch(/<h1[\s>]/)
      expect(html).toMatch(h1)
      expect(html.match(/rel="canonical"/g)).toHaveLength(1)
      expect(html).toContain('hreflang="x-default"')
      expect(html).toContain('property="og:image"')
    })
  }

  test('/pt declara pt-BR', async ({ request }) => {
    expect(await (await request.get('/pt')).text()).toContain(
      '<html lang="pt-BR"',
    )
  })

  test('/pt/nada é 404 de verdade, em português e noindex', async ({
    request,
  }) => {
    const nf = await request.get('/pt/nada')
    expect(nf.status()).toBe(404)
    const html = await nf.text()
    expect(html).toContain(pt.notFound.title)
    expect(html).toContain('content="noindex"')
  })
})

test.describe('sem JS', () => {
  test.use({ javaScriptEnabled: false })

  test('/pt mostra o h1, a lista de trabalhos e o contato', async ({
    page,
  }) => {
    await page.goto('/pt')
    await expect(
      page.getByRole('heading', { level: 1, name: /André/ }),
    ).toBeVisible()
    await expect(page.locator('#work li')).not.toHaveCount(0)
    await expect(
      page.getByRole('heading', { name: pt.contact.label }),
    ).toBeAttached()
  })

  test('a ficha publicada leva ao case, e o masthead troca para o case em inglês', async ({
    page,
  }) => {
    await page.goto('/pt')
    // O Map Areas é `preview`: a ficha dele não tem link. O caminho da ficha
    // ao case é o de um projeto publicado.
    await page.getByRole('link', { name: /Token Killer/ }).click()
    await expect(page).toHaveURL(/\/pt\/work\/token-killer$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Token Killer' }),
    ).toBeVisible()

    await page.getByRole('link', { name: pt.shell.localeSwitch }).click()
    await expect(page).toHaveURL(/\/work\/token-killer$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('o masthead do case do Map Areas leva a /work/map-areas em inglês', async ({
    page,
  }) => {
    await page.goto('/pt/work/map-areas')
    await expect(
      page.getByRole('heading', { level: 1, name: /Map Areas/ }),
    ).toBeVisible()
    await page.getByRole('link', { name: pt.shell.localeSwitch }).click()
    await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/work\/map-areas$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(
      page.getByRole('heading', { level: 1, name: /Map Areas/ }),
    ).toBeVisible()
  })

  test('o masthead do 404 em /pt/nada cai no 404 em inglês', async ({
    page,
  }) => {
    await page.goto('/pt/nada')
    // pt/404.html serve qualquer caminho sob /pt/: sem JS, o href é o do build
    // (/nao-encontrada), não /nada; o destino ainda é o 404 em inglês.
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.request().isNavigationRequest()),
      page.getByRole('link', { name: pt.shell.localeSwitch }).click(),
    ])
    expect(res.status()).toBe(404)
    await expect(
      page.getByRole('heading', { level: 1, name: en.notFound.title }),
    ).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })
})

test.describe('masthead depois da hidratação', () => {
  // A hidratação não corrige atributo divergente: o href do HTML (que não
  // sabe o caminho pedido nem o hash) precisa ser reescrito no cliente.
  test('em /pt/nada, a troca de idioma aponta para /nada', async ({ page }) => {
    await page.goto('/pt/nada', { waitUntil: 'networkidle' })
    await expect(
      page.getByRole('link', { name: pt.shell.localeSwitch }),
    ).toHaveAttribute('href', '/nada')
  })

  test('em /pt#contact, a troca de idioma leva o hash', async ({ page }) => {
    await page.goto('/pt#contact', { waitUntil: 'networkidle' })
    await expect(
      page.getByRole('link', { name: pt.shell.localeSwitch }),
    ).toHaveAttribute('href', '/#contact')
  })
})

test.describe('hidratação', () => {
  const HYDRATION = /hydrat|did not match|Minified React error/i

  for (const { url } of prerenderRoutes(contentByLocale)) {
    test(`${url} hidrata sem aviso`, async ({ page }) => {
      const problems: string[] = []
      page.on('console', (message) => {
        if (HYDRATION.test(message.text())) problems.push(message.text())
      })
      page.on('pageerror', (error) => {
        if (HYDRATION.test(error.message)) problems.push(error.message)
      })
      await page.goto(url, { waitUntil: 'networkidle' })
      expect(problems).toEqual([])
    })
  }
})

test('/work/TOKEN-KILLER (servido de work/token-killer.html) hidrata como o case', async ({
  page,
}) => {
  await page.goto('/work/TOKEN-KILLER', { waitUntil: 'networkidle' })
  await expect(
    page.getByRole('heading', { level: 1, name: 'Token Killer' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: en.notFound.title }),
  ).toHaveCount(0)
})

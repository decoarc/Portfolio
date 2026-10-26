import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** Cada comp novo entra aqui e herda a matriz inteira de verificação. */
const COMPS = [
  '01-inspection-slot',
  '02-editorial-rolodex',
  '03-spatial-gallery',
] as const

/**
 * Família display que cada comp precisa ter carregado de fato. Sem esta trava,
 * um import nu de `@fontsource` que parasse de resolver renderizaria as três
 * páginas em `system-ui`, as 18 verificações continuariam verdes e as 18
 * capturas que decidem o D2 mostrariam a fonte errada.
 */
const DISPLAY_FONT: Record<(typeof COMPS)[number], string> = {
  '01-inspection-slot': 'Archivo Variable',
  '02-editorial-rolodex': 'Fraunces Variable',
  '03-spatial-gallery': 'Syne Variable',
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

const LOCALES = ['en', 'pt'] as const

for (const comp of COMPS) {
  for (const viewport of VIEWPORTS) {
    for (const locale of LOCALES) {
      test(`${comp} · ${viewport.name} · ${locale}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await page.goto(`/design/comps/${comp}.html?locale=${locale}&chrome=0`)
        await page.evaluate(() => document.fonts.ready.then(() => true))

        await expect(page.locator('[data-region="hero"]')).toBeVisible()
        await expect(page.locator('[data-region="work"]')).toBeVisible()

        // A copy veio do módulo compartilhado, não ficou placeholder vazio.
        await expect(page.locator('[data-copy="person.name"]')).toHaveText(
          'André Arcodaci',
        )
        await expect(page.locator('[data-work-list] > li')).toHaveCount(4)

        const displayFamily = DISPLAY_FONT[comp]
        const displayLoaded = await page.evaluate(
          (family) =>
            [...document.fonts].some(
              (face) =>
                face.family.replace(/^["']|["']$/g, '') === family &&
                face.status === 'loaded',
            ),
          displayFamily,
        )
        expect(
          displayLoaded,
          `a display ${displayFamily} carregou (não caiu em system-ui)`,
        ).toBe(true)

        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        )
        expect(overflow, 'sem overflow horizontal').toBeLessThanOrEqual(1)

        /**
         * Overflow por região, não só no documento: dois dos três comps põem
         * `overflow: hidden` no hero por desenho, e isso recorta qualquer
         * estouro interno antes de ele chegar ao `scrollWidth` do documento.
         * Medir cada `[data-region]` deixa a trava simétrica nos três.
         */
        const regions = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('[data-region]')].map(
            (el) => ({
              name: el.dataset.region ?? '(sem nome)',
              overflow: el.scrollWidth - el.clientWidth,
            }),
          ),
        )
        expect(regions.length, 'o comp declara regiões').toBeGreaterThan(0)
        for (const region of regions) {
          expect(
            region.overflow,
            `sem overflow interno em [data-region="${region.name}"]`,
          ).toBeLessThanOrEqual(1)
        }

        const animations = await page.evaluate(
          () => document.getAnimations().length,
        )
        expect(animations, 'comp estático: nenhuma animação declarada').toBe(0)

        /**
         * Contraste no modo plano. Com as camadas de gradiente no lugar, o axe
         * não consegue compor o fundo e devolve cada nó de texto como
         * `incomplete` — 0 violations sem nenhum par medido. `?flat=1` troca os
         * gradientes pelas cores sólidas de base e torna a medição possível,
         * daí a exigência de `incomplete` também vazio.
         */
        await page.goto(
          `/design/comps/${comp}.html?locale=${locale}&chrome=0&flat=1`,
        )
        await page.evaluate(() => document.fonts.ready.then(() => true))
        await expect(page.locator('[data-work-list] > li')).toHaveCount(4)

        const results = await new AxeBuilder({ page })
          .withRules(['color-contrast'])
          .analyze()
        expect(
          results.violations,
          'contraste WCAG AA em todo texto do comp',
        ).toEqual([])
        expect(
          results.incomplete,
          'nenhum par de contraste ficou sem medir',
        ).toEqual([])
      })
    }
  }
}

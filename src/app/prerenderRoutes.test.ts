import { describe, expect, it } from 'vitest'
import { contentByLocale } from '../content/index.ts'
import { caseStudyAccess } from '../content/publication.ts'
import type { Locale, LocaleContent } from '../content/types.ts'
import { locales } from '../lib/locale.ts'
import { prerenderRoutes } from './prerenderRoutes.ts'

describe('prerenderRoutes', () => {
  it('home, cases e 404 de cada locale, no arquivo que o Pages serve', () => {
    const routes = prerenderRoutes(contentByLocale)
    expect(routes.map((r) => [r.url, r.file])).toEqual(
      expect.arrayContaining([
        ['/', 'index.html'],
        ['/pt', 'pt.html'],
        ['/work/map-areas', 'work/map-areas.html'],
        ['/pt/work/map-areas', 'pt/work/map-areas.html'],
        ['/nao-encontrada', '404.html'],
        ['/pt/nao-encontrada', 'pt/404.html'],
      ]),
    )
    expect(routes.find((r) => r.file === 'pt.html')?.key).toEqual({
      locale: 'pt',
      page: 'home',
    })
    expect(routes.find((r) => r.file === 'pt/404.html')?.key).toEqual({
      locale: 'pt',
      page: 'notFound',
    })
    expect(routes.find((r) => r.file === 'work/map-areas.html')?.key).toEqual({
      locale: 'en',
      page: 'case',
      slug: 'map-areas',
    })
    // Um arquivo por rota.
    expect(new Set(routes.map((r) => r.file)).size).toBe(routes.length)
  })

  it('cada locale tem exatamente os projetos com caseStudyAccess !== none', () => {
    const routes = prerenderRoutes(contentByLocale)
    for (const locale of locales) {
      const expected = contentByLocale[locale].projects
        .filter((project) => caseStudyAccess(project) !== 'none')
        .map((project) => project.slug)
        .sort()
      const actual = routes
        .flatMap((r) =>
          r.key.locale === locale && r.key.page === 'case' ? [r.key.slug] : [],
        )
        .sort()
      expect(expected.length).toBeGreaterThan(0)
      expect(actual).toEqual(expected)
    }
  })

  it('projeto em draft não gera arquivo', () => {
    const clone = structuredClone(contentByLocale) as Record<
      Locale,
      LocaleContent
    >
    const base = clone.pt.projects[0]
    clone.pt.projects.push({ ...base, slug: 'rascunho', status: 'draft' })
    const files = prerenderRoutes(clone).map((r) => r.file)
    expect(files).not.toContain('pt/work/rascunho.html')
    expect(files.some((file) => file.includes('rascunho'))).toBe(false)
  })
})

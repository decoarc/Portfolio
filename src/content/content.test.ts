/// <reference types="node" />
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contentByLocale, getContent } from './index.ts'
import { isValidSlug } from './publication.ts'
import type { Locale } from './types.ts'

/** Caminhos de folha da árvore; arrays entram por índice. */
function shapeOf(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => shapeOf(item, `${path}[${index}]`))
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      shapeOf(child, path === '' ? key : `${path}.${key}`),
    )
  }
  return [path]
}

/** Folhas string com o caminho, para achar texto vazio. */
function stringLeaves(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]]
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      stringLeaves(item, `${path}[${index}]`),
    )
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      stringLeaves(child, path === '' ? key : `${path}.${key}`),
    )
  }
  return []
}

const locales: Locale[] = ['en', 'pt']

describe('paridade entre locales', () => {
  it('en e pt têm o mesmo shape', () => {
    const en = new Set(shapeOf(contentByLocale.en))
    const pt = new Set(shapeOf(contentByLocale.pt))
    const onlyEn = [...en].filter((path) => !pt.has(path))
    const onlyPt = [...pt].filter((path) => !en.has(path))
    expect({ onlyEn, onlyPt }).toEqual({ onlyEn: [], onlyPt: [] })
  })

  it.each(locales)('%s não tem string vazia', (locale) => {
    const empty = stringLeaves(contentByLocale[locale])
      .filter(([, text]) => text.trim() === '')
      .map(([path]) => path)
    expect(empty).toEqual([])
  })

  it('mesmos slugs, na mesma ordem, válidos e sem repetição', () => {
    const en = contentByLocale.en.projects.map((project) => project.slug)
    const pt = contentByLocale.pt.projects.map((project) => project.slug)
    expect(pt).toEqual(en)
    expect(en.filter((slug) => !isValidSlug(slug))).toEqual([])
    expect(new Set(en).size).toBe(en.length)
  })
})

describe('projetos', () => {
  const all = locales.flatMap((locale) =>
    contentByLocale[locale].projects.map((project) => ({ locale, project })),
  )

  it.each(all)(
    '$locale/$project.slug tem seções com conteúdo',
    ({ project }) => {
      expect(project.sections.length).toBeGreaterThanOrEqual(1)
      for (const section of project.sections) {
        const filled =
          (section.paragraphs?.length ?? 0) > 0 ||
          (section.items?.length ?? 0) > 0
        expect(filled, section.heading).toBe(true)
      }
    },
  )

  it('nenhum projeto verified é mock', () => {
    const wrong = all
      .filter(({ project }) => project.type === 'verified' && project.mock)
      .map(({ locale, project }) => `${locale}/${project.slug}`)
    expect(wrong).toEqual([])
  })

  it.each(all.filter(({ project }) => project.cover?.thumbSrc))(
    '$locale/$project.slug: a miniatura existe em public/',
    ({ project }) => {
      expect(existsSync(join('public', project.cover!.thumbSrc!))).toBe(true)
    },
  )

  it('Map Areas tem miniatura', () => {
    for (const locale of locales) {
      const map = contentByLocale[locale].projects.find(
        (p) => p.slug === 'map-areas',
      )
      expect(map?.cover?.thumbSrc).toBe('/images/projects/map-areas-800.webp')
    }
  })

  it('map-areas não linka repositório', () => {
    for (const locale of locales) {
      const mapAreas = contentByLocale[locale].projects.find(
        (project) => project.slug === 'map-areas',
      )
      expect(mapAreas).toBeDefined()
      expect(mapAreas?.links.some((link) => link.kind === 'repo')).toBe(false)
    }
  })
})

describe('getContent', () => {
  it('devolve o conteúdo do locale pedido', () => {
    expect(getContent('pt').site.person.role).toBe('Desenvolvedor Full Stack')
  })
})

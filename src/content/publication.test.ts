import { describe, expect, it } from 'vitest'
import {
  caseBackHref,
  caseStudyAccess,
  caseStudyHref,
  findProject,
  galleryHref,
  homeProjects,
  isValidSlug,
  listProjects,
  workAnchor,
} from './publication.ts'
import type { Project } from './types.ts'

function project(overrides: Partial<Project> = {}): Project {
  return {
    slug: 'exemplo',
    title: 'Exemplo',
    type: 'verified',
    status: 'published',
    summary: 'Resumo',
    role: 'Papel',
    year: '2025',
    stack: [],
    sections: [],
    links: [],
    ...overrides,
  }
}

describe('workAnchor', () => {
  it('é o id da ficha na lista de trabalhos', () => {
    expect(workAnchor('local-email-client')).toBe('work-local-email-client')
  })
})

describe('isValidSlug', () => {
  it('aceita kebab-case e recusa o resto', () => {
    expect(isValidSlug('map-areas')).toBe(true)
    expect(isValidSlug('Bad Slug')).toBe(false)
    expect(isValidSlug('../etc')).toBe(false)
    expect(isValidSlug('')).toBe(false)
  })
})

describe('listProjects', () => {
  it('remove draft e preserva a ordem', () => {
    const a = project({ slug: 'a', status: 'preview' })
    const b = project({ slug: 'b', status: 'draft' })
    const c = project({ slug: 'c', status: 'published' })
    expect(listProjects([a, b, c])).toEqual([a, c])
  })
})

describe('homeProjects', () => {
  it('os 3 primeiros, sem rascunho, na ordem', () => {
    const [a, b, c, d, e] = ['a', 'b', 'c', 'd', 'e'].map((slug) =>
      project({ slug }),
    )
    const draft = project({ slug: 'x', status: 'draft' })
    expect(homeProjects([a, draft, b, c, d, e])).toEqual([a, b, c])
    expect(homeProjects([a, b])).toEqual([a, b])
  })
})

describe('galleryHref', () => {
  it('é /projects em cada locale', () => {
    expect(galleryHref('en')).toBe('/projects')
    expect(galleryHref('pt')).toBe('/pt/projects')
  })
})

describe('caseBackHref', () => {
  const list = ['a', 'b', 'c', 'd'].map((slug) => project({ slug }))

  it('projeto da home volta para a ficha na home', () => {
    expect(caseBackHref('en', list, 'b')).toBe('/#work-b')
    expect(caseBackHref('pt', list, 'b')).toBe('/pt#work-b')
  })

  it('projeto só da galeria volta para o cartão na galeria', () => {
    expect(caseBackHref('en', list, 'd')).toBe('/projects#work-d')
    expect(caseBackHref('pt', list, 'd')).toBe('/pt/projects#work-d')
  })
})

describe('caseStudyAccess', () => {
  it('segue o status e o slug', () => {
    expect(caseStudyAccess(project())).toBe('full')
    expect(caseStudyAccess(project({ status: 'preview' }))).toBe('preview')
    expect(caseStudyAccess(project({ status: 'draft' }))).toBe('none')
    expect(caseStudyAccess(undefined)).toBe('none')
    expect(caseStudyAccess(project({ slug: 'Bad Slug' }))).toBe('none')
  })
})

describe('caseStudyHref', () => {
  it('so publicado com slug valido tem link', () => {
    expect(caseStudyHref('pt', project({ slug: 'x' }))).toBe('/pt/work/x')
    expect(caseStudyHref('en', project({ slug: 'x' }))).toBe('/work/x')
    expect(caseStudyHref('pt', project({ status: 'preview' }))).toBeNull()
    expect(caseStudyHref('pt', project({ status: 'draft' }))).toBeNull()
    expect(caseStudyHref('pt', project({ slug: 'Bad Slug' }))).toBeNull()
  })
})

describe('findProject', () => {
  it('recusa slug invalido ou ausente', () => {
    const p = project({ slug: 'x' })
    expect(findProject([p], 'x')).toBe(p)
    expect(findProject([p], 'y')).toBeUndefined()
    expect(findProject([p], '../etc')).toBeUndefined()
    expect(findProject([p], undefined)).toBeUndefined()
  })

  it('ignora a caixa do slug: o Pages serve /work/X do arquivo em minúsculas', () => {
    const p = project({ slug: 'local-email-client' })
    expect(findProject([p], 'LOCAL-EMAIL-CLIENT')).toBe(p)
    expect(findProject([p], 'Local-Email-Client')).toBe(p)
  })
})

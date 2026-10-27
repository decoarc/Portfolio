import { describe, expect, it } from 'vitest'
import {
  caseStudyAccess,
  caseStudyHref,
  findProject,
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
    expect(workAnchor('token-killer')).toBe('work-token-killer')
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
})

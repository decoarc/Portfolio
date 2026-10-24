import { describe, expect, it } from 'vitest'
import { mapAreas } from './en/projects/map-areas'
import type { ProjectCaseStudy } from './types'
import {
  assertPublicationRules,
  canLinkCaseStudy,
  filterPublicProjects,
  getProjectHref,
  isListedProject,
  isValidSlug,
} from './projectLinks'

function makeProject(
  overrides: Partial<ProjectCaseStudy> = {},
): ProjectCaseStudy {
  return {
    slug: 'map-areas',
    title: 'Map Areas',
    tagline: 'Test',
    stack: ['PHP'],
    status: 'draft',
    featured: false,
    coverImage: { src: '/x.svg', alt: '', width: 1, height: 1 },
    problem: 'p',
    responsibilities: [],
    implementation: [],
    challenges: [],
    outcomes: ['[Outcome TBD]'],
    evidenceComplete: false,
    ...overrides,
  }
}

describe('isValidSlug', () => {
  it('accepts kebab-case slugs', () => {
    expect(isValidSlug('map-areas')).toBe(true)
  })

  it('rejects invalid slugs', () => {
    expect(isValidSlug('Map Areas')).toBe(false)
    expect(isValidSlug('-bad')).toBe(false)
  })
})

describe('project status → listing and href rules', () => {
  it('hides draft projects from public lists', () => {
    expect(isListedProject(makeProject({ status: 'draft' }))).toBe(false)
    expect(filterPublicProjects([makeProject({ status: 'draft' })])).toHaveLength(
      0,
    )
  })

  it('lists preview projects without case-study hrefs', () => {
    const project = makeProject({ status: 'preview', evidenceComplete: false })
    expect(isListedProject(project)).toBe(true)
    expect(canLinkCaseStudy(project)).toBe(false)
    expect(getProjectHref(project)).toBeNull()
  })

  it('blocks published projects that lack evidence', () => {
    const project = makeProject({
      status: 'published',
      evidenceComplete: false,
    })
    expect(canLinkCaseStudy(project)).toBe(false)
    expect(getProjectHref(project)).toBeNull()
    expect(assertPublicationRules(project)).toMatch(/evidenceComplete/)
  })

  it('returns a case-study href only for published + evidenced projects', () => {
    const project = makeProject({
      status: 'published',
      evidenceComplete: true,
    })
    expect(getProjectHref(project)).toBe('/work/map-areas')
    expect(assertPublicationRules(project)).toBeNull()
  })
})

describe('Map Areas publication flags', () => {
  it('stays a preview without a repository link', () => {
    expect(mapAreas.status).toBe('preview')
    expect(mapAreas.evidenceComplete).toBe(false)
    expect(mapAreas.hrefRepo).toBeUndefined()
  })
})

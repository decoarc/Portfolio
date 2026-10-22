import { describe, expect, it } from 'vitest'
import type { ProjectCaseStudy } from './types'
import {
  filterRealBullets,
  findProjectBySlug,
  isPlaceholderContent,
  resolveCaseStudyAccess,
} from './caseStudyAccess'

function makeProject(
  overrides: Partial<ProjectCaseStudy> = {},
): ProjectCaseStudy {
  return {
    slug: 'map-areas',
    title: 'Map Areas',
    tagline: 'Draw polygons',
    stack: ['PHP', 'Leaflet'],
    status: 'draft',
    featured: false,
    coverImage: { src: '/x.webp', alt: 'x', width: 1, height: 1 },
    problem: '[Problem statement TBD]',
    responsibilities: ['[Responsibilities TBD]'],
    implementation: ['[Implementation notes TBD]'],
    challenges: ['[Challenges TBD]'],
    outcomes: ['[Outcome TBD]'],
    evidenceComplete: false,
    ...overrides,
  }
}

describe('isPlaceholderContent', () => {
  it('detects TBD markers', () => {
    expect(isPlaceholderContent('[Problem statement TBD — expand]')).toBe(true)
    expect(isPlaceholderContent('[Outcome TBD]')).toBe(true)
  })

  it('allows real prose', () => {
    expect(
      isPlaceholderContent('Need a tool to persist map polygons in PostGIS.'),
    ).toBe(false)
  })
})

describe('resolveCaseStudyAccess', () => {
  it('returns unavailable for missing or draft projects', () => {
    expect(resolveCaseStudyAccess(undefined)).toBe('unavailable')
    expect(resolveCaseStudyAccess(makeProject({ status: 'draft' }))).toBe(
      'unavailable',
    )
  })

  it('returns preview for preview projects without evidence', () => {
    expect(
      resolveCaseStudyAccess(
        makeProject({ status: 'preview', evidenceComplete: false }),
      ),
    ).toBe('preview')
  })

  it('returns unavailable for published without evidence', () => {
    expect(
      resolveCaseStudyAccess(
        makeProject({ status: 'published', evidenceComplete: false }),
      ),
    ).toBe('unavailable')
  })

  it('returns full for published + evidenced projects', () => {
    expect(
      resolveCaseStudyAccess(
        makeProject({
          status: 'published',
          evidenceComplete: true,
          problem: 'Real problem',
        }),
      ),
    ).toBe('full')
  })
})

describe('filterRealBullets', () => {
  it('drops TBD placeholders', () => {
    expect(
      filterRealBullets([
        'Built PostGIS schema',
        '[Responsibilities TBD]',
        '  ',
      ]),
    ).toEqual(['Built PostGIS schema'])
  })
})

describe('findProjectBySlug', () => {
  it('finds by kebab slug and rejects invalid ids', () => {
    const projects = [makeProject()]
    expect(findProjectBySlug(projects, 'map-areas')?.title).toBe('Map Areas')
    expect(findProjectBySlug(projects, 'nope')).toBeUndefined()
    expect(findProjectBySlug(projects, 'Bad Slug')).toBeUndefined()
  })
})

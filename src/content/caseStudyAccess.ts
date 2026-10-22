import type { ProjectCaseStudy } from './types'
import { canLinkCaseStudy, isValidSlug } from './projectLinks'

export type CaseStudyAccess = 'full' | 'preview' | 'unavailable'

const TBD_PATTERN = /\[\s*.*TBD.*\s*\]/i

/** True when a content string is an explicit placeholder, not publishable prose. */
export function isPlaceholderContent(value: string): boolean {
  return TBD_PATTERN.test(value.trim())
}

export function filterRealBullets(items: string[]): string[] {
  return items.filter((item) => item.trim().length > 0 && !isPlaceholderContent(item))
}

/**
 * Resolves what `/work/:slug` may show.
 * - full: published + evidenceComplete (homepage may also link)
 * - preview: listed preview — verified overview only; TBD sections omitted
 * - unavailable: unknown, draft, or published without evidence
 */
export function resolveCaseStudyAccess(
  project: ProjectCaseStudy | undefined,
): CaseStudyAccess {
  if (!project || !isValidSlug(project.slug)) {
    return 'unavailable'
  }
  if (canLinkCaseStudy(project)) {
    return 'full'
  }
  if (project.status === 'preview') {
    return 'preview'
  }
  return 'unavailable'
}

export function findProjectBySlug(
  projects: ProjectCaseStudy[],
  slug: string | undefined,
): ProjectCaseStudy | undefined {
  if (!slug || !isValidSlug(slug)) {
    return undefined
  }
  return projects.find((project) => project.slug === slug)
}

import type { ProjectCaseStudy, ProjectStatus, ProjectSummary } from './types'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}

/** Draft projects stay out of public Work lists. */
export function isListedProject(
  project: Pick<ProjectSummary, 'status'>,
): boolean {
  return project.status === 'preview' || project.status === 'published'
}

/**
 * A project may be linked as a case study only when published
 * and evidence is complete. Preview/draft never emit `/work/:slug`.
 */
export function canLinkCaseStudy(
  project: Pick<ProjectCaseStudy, 'status' | 'evidenceComplete'>,
): boolean {
  return project.status === 'published' && project.evidenceComplete
}

/**
 * Returns the public case-study href, or null when linking would be unsafe.
 * UI must omit the CTA when null — never point at a guaranteed 404.
 */
export function getProjectHref(
  project: Pick<ProjectCaseStudy, 'slug' | 'status' | 'evidenceComplete'>,
): string | null {
  if (!isValidSlug(project.slug)) {
    return null
  }
  if (!canLinkCaseStudy(project)) {
    return null
  }
  return `/work/${project.slug}`
}

export function assertPublicationRules(
  project: ProjectCaseStudy,
): string | null {
  if (!isValidSlug(project.slug)) {
    return `Invalid slug: ${project.slug}`
  }
  if (project.status === 'published' && !project.evidenceComplete) {
    return `Published project "${project.slug}" requires evidenceComplete: true`
  }
  return null
}

export function filterPublicProjects<T extends ProjectSummary>(
  projects: T[],
): T[] {
  return projects.filter(isListedProject)
}

export function statusAllowsCaseStudyRoute(status: ProjectStatus): boolean {
  return status === 'published'
}

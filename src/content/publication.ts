import { localePath } from '../lib/locale.ts'
import type { Locale, Project } from './types.ts'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return SLUG.test(slug)
}

/** Remove rascunhos; preserva a ordem. */
export function listProjects(projects: Project[]): Project[] {
  return projects.filter((project) => project.status !== 'draft')
}

export function caseStudyAccess(
  project: Project | undefined,
): 'full' | 'preview' | 'none' {
  if (!project || !isValidSlug(project.slug)) return 'none'
  if (project.status === 'published') return 'full'
  if (project.status === 'preview') return 'preview'
  return 'none'
}

export function caseStudyHref(locale: Locale, project: Project): string | null {
  if (caseStudyAccess(project) !== 'full') return null
  return localePath(locale, `/work/${project.slug}`)
}

/** Id da ficha do projeto na lista de trabalhos; alvo do "Voltar" do case study. */
export function workAnchor(slug: string): string {
  return `work-${slug}`
}

export function findProject(
  projects: Project[],
  slug: string | undefined,
): Project | undefined {
  if (slug === undefined || !isValidSlug(slug)) return undefined
  return projects.find((project) => project.slug === slug)
}

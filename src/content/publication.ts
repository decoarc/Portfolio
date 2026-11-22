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

/** Quantos projetos a lista da home mostra; a galeria mostra todos. */
export const HOME_PROJECT_LIMIT = 3

/** Os primeiros da lista (sem rascunhos), na ordem do conteúdo. */
export function homeProjects(projects: Project[]): Project[] {
  return listProjects(projects).slice(0, HOME_PROJECT_LIMIT)
}

/** A galeria com todos os projetos: `/projects` e `/pt/projects`. */
export function galleryHref(locale: Locale): string {
  return localePath(locale, '/projects')
}

/**
 * Para onde o "Voltar" de um case leva: a ficha na home quando o projeto está
 * entre os da home, senão o cartão dele na galeria. Depende só do conteúdo,
 * para o HTML pré-renderizado e a hidratação concordarem.
 */
export function caseBackHref(
  locale: Locale,
  projects: Project[],
  slug: string,
): string {
  const onHome = homeProjects(projects).some((p) => p.slug === slug)
  return onHome
    ? localePath(locale, `/#${workAnchor(slug)}`)
    : `${galleryHref(locale)}#${workAnchor(slug)}`
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
  if (slug === undefined) return undefined
  // O Pages serve /work/X do arquivo em minúsculas; o app casa igual, ou a
  // hidratação trocaria o case pré-renderizado pelo 404.
  const normal = slug.toLowerCase()
  if (!isValidSlug(normal)) return undefined
  return projects.find((project) => project.slug === normal)
}

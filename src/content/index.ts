import { siteEn } from './en/site'
import { projectsEn } from './en/projects'
import type { Locale, ProjectCaseStudy, SiteContent } from './types'

export type { Locale, ProjectCaseStudy, SiteContent } from './types'
export {
  assertPublicationRules,
  canLinkCaseStudy,
  filterPublicProjects,
  getProjectHref,
  isListedProject,
  isValidSlug,
} from './projectLinks'

const siteByLocale: Record<Locale, SiteContent> = {
  en: siteEn,
  // Portuguese seam reserved — do not invent PT copy until provided.
  pt: siteEn,
}

const projectsByLocale: Record<Locale, ProjectCaseStudy[]> = {
  en: projectsEn,
  pt: projectsEn,
}

export function getSiteContent(locale: Locale = 'en'): SiteContent {
  return siteByLocale[locale] ?? siteByLocale.en
}

export function getProjects(locale: Locale = 'en'): ProjectCaseStudy[] {
  return projectsByLocale[locale] ?? projectsByLocale.en
}

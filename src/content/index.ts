import { projectsEn } from './en/projects/index.ts'
import { siteEn } from './en/site.ts'
import { projectsPt } from './pt/projects/index.ts'
import { sitePt } from './pt/site.ts'
import type { Locale, LocaleContent } from './types.ts'

/**
 * Árvore completa de conteúdo. Também é lida por `scripts/assert-no-mock.ts`
 * no Node: imports relativos com `.ts`, sem alias e sem CSS/DOM.
 */
export const contentByLocale: Record<Locale, LocaleContent> = {
  en: { site: siteEn, projects: projectsEn },
  pt: { site: sitePt, projects: projectsPt },
}

export function getContent(locale: Locale): LocaleContent {
  return contentByLocale[locale]
}

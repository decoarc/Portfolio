import type { HomeSectionId } from '../content/types.ts'
import { Hero } from '../sections/Hero/index.ts'
import { Release } from '../sections/Release/index.ts'
import { Work } from '../sections/Work/index.ts'
import { homeSections } from './homeSections.ts'
import { useContent, useLocale } from './LocaleContext.ts'

/** As demais seções numeradas entram na Task 6; o índice já lista todas. */
export function HomeRoute() {
  const locale = useLocale()
  const { site, projects } = useContent()
  const sections = homeSections(site)
  /** O número de uma seção é a sua posição em `homeSections` mais um. */
  const numberOf = (id: HomeSectionId) => sections.indexOf(id) + 1
  return (
    <>
      <title>{site.meta.homeTitle}</title>
      <Hero person={site.person} copy={site.hero} />
      <Release copy={site.release} sections={sections} />
      <Work
        index={numberOf('work')}
        copy={site.work}
        projects={projects}
        locale={locale}
        labels={{ projectType: site.projectType, links: site.links }}
      />
    </>
  )
}

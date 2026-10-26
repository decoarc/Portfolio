import type { HomeSectionId } from '../content/types.ts'
import { About } from '../sections/About/index.ts'
import { Approach } from '../sections/Approach/index.ts'
import { Contact } from '../sections/Contact/index.ts'
import { Hero } from '../sections/Hero/index.ts'
import { Interests } from '../sections/Interests/index.ts'
import { Release } from '../sections/Release/index.ts'
import { Work } from '../sections/Work/index.ts'
import { homeSections } from './homeSections.ts'
import { useContent, useLocale } from './LocaleContext.ts'

/** A home: frontispício, índice e as seções numeradas na ordem do índice. */
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
      {sections.includes('approach') && (
        <Approach index={numberOf('approach')} copy={site.approach} />
      )}
      <About index={numberOf('about')} copy={site.about} />
      {sections.includes('interests') && (
        <Interests index={numberOf('interests')} copy={site.interests} />
      )}
      <Contact
        index={numberOf('contact')}
        copy={site.contact}
        externalHint={site.links.externalHint}
      />
    </>
  )
}

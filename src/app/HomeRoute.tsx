import { CoverStrip } from '../components/CoverStrip/index.ts'
import type { HomeSectionId } from '../content/types.ts'
import { Opening } from '../motion/Opening.tsx'
import { Reveal } from '../motion/Reveal.tsx'
import { About } from '../sections/About/index.ts'
import { Approach } from '../sections/Approach/index.ts'
import { Contact } from '../sections/Contact/index.ts'
import { Hero } from '../sections/Hero/index.ts'
import { Interests } from '../sections/Interests/index.ts'
import { Release } from '../sections/Release/index.ts'
import { Tools } from '../sections/Tools/index.ts'
import { Trajectory } from '../sections/Trajectory/index.ts'
import { Work } from '../sections/Work/index.ts'
import { homeSections } from './homeSections.ts'
import { useContent, useLocale } from './LocaleContext.ts'
import { useRouteHead } from './useRouteHead.ts'

/**
 * A home: frontispício, índice e as seções numeradas na ordem do índice —
 * trajetória e ferramentas primeiro, depois os projetos pessoais.
 */
export function HomeRoute() {
  const locale = useLocale()
  useRouteHead({ locale, page: 'home' })
  const { site, projects } = useContent()
  const sections = homeSections(site)
  /** O número de uma seção é a sua posição em `homeSections` mais um. */
  const numberOf = (id: HomeSectionId) => sections.indexOf(id) + 1
  return (
    <>
      <Opening>
        <Hero
          person={site.person}
          copy={site.hero}
          ctaPeek={
            <CoverStrip
              projects={projects}
              labels={{
                projectType: site.projectType,
                noCapture: site.work.noCapture,
              }}
            />
          }
        />
        <Release copy={site.release} sections={sections} />
      </Opening>
      <Trajectory index={numberOf('trajectory')} copy={site.trajectory} />
      <Tools index={numberOf('tools')} copy={site.tools} />
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
      {sections.includes('interests') && (
        <Interests index={numberOf('interests')} copy={site.interests} />
      )}
      <Reveal>
        <About index={numberOf('about')} copy={site.about} />
        <Contact
          index={numberOf('contact')}
          copy={site.contact}
          externalHint={site.links.externalHint}
        />
      </Reveal>
    </>
  )
}
